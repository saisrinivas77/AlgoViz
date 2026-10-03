"""
Python Runtime Tracer for AlgoViz Engine.
Hooks into execution via sys.settrace and instrumented calls to compile DVIR traces.
"""

import sys
import time
import json
import types
from typing import Any, Dict, List, Optional

INTERNAL_NAMES = {
    "self", "__tr", "_algoviz_tr", "print",
    "ListNode", "TreeNode", "create_linked_list", "create_tree"
}

class TracerContext:
    def __init__(self, execution_id: str = "ex_dev", max_steps: int = 10000):
        self.execution_id = execution_id
        self.max_steps = max_steps
        self.events: List[Dict[str, Any]] = []
        self.step_count = 0
        self.start_time = time.time()
        self.call_stack: List[Dict[str, Any]] = []
        self.previous_vars_by_frame: Dict[int, Dict[str, Any]] = {}
        self.stdout_logs: List[str] = []
        self.detected_structures: set = set()

        # Emit program start
        self._add_event({
            "id": self._next_id(),
            "type": "program.start",
            "language": "python"
        })

    def _next_id(self, force: bool = False) -> int:
        self.step_count += 1
        if not force and self.step_count > self.max_steps:
            raise RuntimeError(f"STEP_LIMIT_EXCEEDED: Maximum visualization steps ({self.max_steps}) reached.")
        return self.step_count

    def _add_event(self, event: Dict[str, Any]):
        self.events.append(event)

    def access(self, arr: Any, target_name: str, index: int, access_type: str = "read") -> Any:
        """Called by instrumented AST when array element is read or compared."""
        try:
            val = arr[index]
            # Only record visual array events for lists with valid integer indices
            if isinstance(arr, list) and not isinstance(index, (slice, bool)):
                try:
                    idx_int = int(index)
                    self.detected_structures.add("array")
                    self._add_event({
                        "id": self._next_id(),
                        "type": "array.access",
                        "target": target_name,
                        "index": idx_int,
                        "accessType": access_type
                    })
                except (ValueError, TypeError):
                    pass
            return val
        except Exception:
            return arr[index]

    def update_array(self, target_name: str, index: int, value: Any):
        """Called when an array element is updated."""
        if isinstance(index, (slice, bool)):
            return
        try:
            idx_int = int(index)
            self.detected_structures.add("array")
            self._add_event({
                "id": self._next_id(),
                "type": "array.update",
                "target": target_name,
                "index": idx_int,
                "value": self._serialize_val(value)
            })
        except (ValueError, TypeError):
            # Target is a mapping/dict with non-integer keys
            pass

    def swap_array(self, target_name: str, idx_a: int, idx_b: int, arr: Any = None):
        """Called when an explicit element swap occurs."""
        if isinstance(idx_a, (slice, bool)) or isinstance(idx_b, (slice, bool)):
            return
        try:
            idx_a_int = int(idx_a)
            idx_b_int = int(idx_b)
            self.detected_structures.add("array")
            val_a = None
            val_b = None
            if arr is not None and isinstance(arr, list):
                try:
                    val_a = self._serialize_val(arr[idx_a_int])
                    val_b = self._serialize_val(arr[idx_b_int])
                except Exception:
                    pass
            self._add_event({
                "id": self._next_id(),
                "type": "array.swap",
                "target": target_name,
                "indexA": idx_a_int,
                "indexB": idx_b_int,
                "valueA": val_a,
                "valueB": val_b
            })
        except (ValueError, TypeError):
            pass

    def trace_line(self, frame, event, arg):
        """sys.settrace callback for line executions and variable state tracking."""
        co_filename = frame.f_code.co_filename
        # Only trace user code executed in the sandbox and filter out all internal worker/tracer files
        if co_filename != "<string>" or "tracer.py" in co_filename or "instrumenter.py" in co_filename or "sandbox.py" in co_filename:
            return self.trace_line

        func_name = frame.f_code.co_name
        # Skip tracer internal method frames
        if func_name in ("access", "update_array", "swap_array", "_next_id", "_add_event", "_serialize_val"):
            return self.trace_line

        if event == "line":
            line_no = frame.f_lineno

            # Diff variables in current frame scope
            local_vars = {
                k: self._serialize_val(v)
                for k, v in frame.f_locals.items()
                if self._is_user_variable(k, v)
            }

            self._add_event({
                "id": self._next_id(),
                "type": "line.execute",
                "source": {
                    "line": line_no
                },
                "stackDepth": len(self.call_stack)
            })

            frame_key = id(frame)
            prev_vars = self.previous_vars_by_frame.get(frame_key, {})

            # Check variable creation / updates for this frame
            for var_name, var_val in local_vars.items():
                if var_name not in prev_vars:
                    self._add_event({
                        "id": self._next_id(),
                        "type": "variable.create",
                        "name": var_name,
                        "value": var_val,
                        "variableType": type(frame.f_locals[var_name]).__name__
                    })
                elif prev_vars[var_name] != var_val:
                    self._add_event({
                        "id": self._next_id(),
                        "type": "variable.update",
                        "name": var_name,
                        "value": var_val,
                        "previousValue": prev_vars[var_name],
                        "variableType": type(frame.f_locals[var_name]).__name__
                    })

                if isinstance(frame.f_locals[var_name], list):
                    self.detected_structures.add("array")

            self.previous_vars_by_frame[frame_key] = local_vars.copy()

        elif event == "call":
            if func_name != "<module>" and not func_name.startswith("__") and not func_name.startswith("_"):
                frame_id = f"frame_{len(self.call_stack)+1}"
                self.call_stack.append({"name": func_name, "frameId": frame_id})
                self._add_event({
                    "id": self._next_id(),
                    "type": "function.call",
                    "functionName": func_name,
                    "args": {
                        k: self._serialize_val(v)
                        for k, v in frame.f_locals.items()
                        if self._is_user_variable(k, v)
                    },
                    "frameId": frame_id
                })

        elif event == "return":
            # Capture any variable assignments that completed on the frame's final line
            frame_key = id(frame)
            prev_vars = self.previous_vars_by_frame.get(frame_key, {})
            local_vars = {
                k: self._serialize_val(v)
                for k, v in frame.f_locals.items()
                if self._is_user_variable(k, v)
            }
            for var_name, var_val in local_vars.items():
                if var_name not in prev_vars:
                    self._add_event({
                        "id": self._next_id(),
                        "type": "variable.create",
                        "name": var_name,
                        "value": var_val,
                        "variableType": type(frame.f_locals[var_name]).__name__
                    })
                elif prev_vars[var_name] != var_val:
                    self._add_event({
                        "id": self._next_id(),
                        "type": "variable.update",
                        "name": var_name,
                        "value": var_val,
                        "previousValue": prev_vars[var_name],
                        "variableType": type(frame.f_locals[var_name]).__name__
                    })
                if isinstance(frame.f_locals[var_name], list):
                    self.detected_structures.add("array")
            self.previous_vars_by_frame[frame_key] = local_vars.copy()

            if self.call_stack and func_name != "<module>" and not func_name.startswith("__") and not func_name.startswith("_"):
                frame_info = self.call_stack.pop()
                self._add_event({
                    "id": self._next_id(),
                    "type": "function.return",
                    "functionName": frame_info["name"],
                    "returnValue": self._serialize_val(arg),
                    "frameId": frame_info["frameId"]
                })

        return self.trace_line

    def _is_user_variable(self, k: str, v: Any) -> bool:
        """Determines if a variable is genuine user data rather than sandbox internals or modules."""
        if k.startswith("__") or k.startswith("_algoviz") or k.startswith("_tr"):
            return False
        if k in INTERNAL_NAMES:
            return False
        if callable(v):
            return False
        if isinstance(v, (types.ModuleType, types.FunctionType, types.BuiltinFunctionType, types.MethodType)):
            return False
        if isinstance(v, type):
            return False
        return True

    def _serialize_val(self, val: Any) -> Any:
        """Helper to serialize complex Python objects safely."""
        if isinstance(val, (int, float, str, bool, type(None))):
            return val
        elif isinstance(val, list):
            return [self._serialize_val(x) for x in val[:100]] # Limit size
        elif isinstance(val, dict):
            return {str(k): self._serialize_val(v) for k, v in list(val.items())[:50]}
        else:
            return str(val)

    def finalize(self, source_code: str) -> Dict[str, Any]:
        """Emits program end event and compiles complete DVIR trace object."""
        duration_ms = int((time.time() - self.start_time) * 1000)
        self._add_event({
            "id": self._next_id(force=True),
            "type": "program.end",
            "durationMs": duration_ms
        })

        return {
            "version": "1.0",
            "executionId": self.execution_id,
            "language": "python",
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "summary": {
                "totalSteps": len(self.events),
                "durationMs": duration_ms,
                "maxMemoryBytes": 1024 * 1024 * 16, # Placeholder estimation
                "detectedStructures": list(self.detected_structures) or ["array"]
            },
            "code": source_code,
            "events": self.events,
            "stdout": self.stdout_logs
        }
