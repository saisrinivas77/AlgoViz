"""
Isolated Execution Sandbox for AlgoViz Worker.
Executes instrumented Python code securely, enforcing step limits, time limits, and forbidden imports.
"""

import sys
import io
import traceback
from typing import Dict, Any

from instrumenter import instrument_code, instrument_code_ast
from tracer import TracerContext
from analyzer import analyze_trace_and_code

import math
import collections
from collections import deque, defaultdict, Counter, OrderedDict
import heapq
import bisect
from bisect import bisect_left, bisect_right, insort
import itertools
from itertools import permutations, combinations, accumulate, product, chain
import functools
from functools import lru_cache, cache, reduce
import typing
from typing import List, Dict, Set, Tuple, Optional, Union, Any, Deque, DefaultDict
import re
import string
import random

# LeetCode Common Data Structures
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def __repr__(self):
        vals = []
        curr = self
        seen = set()
        while curr and id(curr) not in seen and len(vals) < 30:
            seen.add(id(curr))
            vals.append(str(curr.val))
            curr = curr.next
        if curr and id(curr) in seen:
            vals.append("(cycle)")
        return " -> ".join(vals) if vals else "Empty"

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self):
        return f"TreeNode({self.val})"

def create_linked_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    curr = head
    for v in arr[1:]:
        curr.next = ListNode(v)
        curr = curr.next
    return head

def create_tree(arr):
    if not arr:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

FORBIDDEN_MODULES = {
    "os", "subprocess", "socket", "requests", "urllib", "shutil",
    "pathlib", "ctypes", "multiprocessing", "threading", "signal"
}

def check_security(source_code: str):
    """Simple static analysis to reject dangerous standard module usages."""
    for mod in FORBIDDEN_MODULES:
        if f"import {mod}" in source_code or f"from {mod}" in source_code:
            raise SecurityError(f"FORBIDDEN_IMPORT: Module '{mod}' is not allowed in AlgoViz sandbox.")

class SecurityError(Exception):
    pass

class SandboxGlobals(dict):
    def __init__(self, tracer, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tracer = tracer

    def __getitem__(self, key):
        if key in ("_algoviz_tr", "__tr") or key.endswith("__tr") or key.endswith("_algoviz_tr"):
            return self.tracer
        return super().__getitem__(key)

    def __contains__(self, key):
        if key in ("_algoviz_tr", "__tr") or key.endswith("__tr") or key.endswith("_algoviz_tr"):
            return True
        return super().__contains__(key)

def execute_in_sandbox(source_code: str, execution_id: str = "ex_demo", max_steps: int = 50000) -> Dict[str, Any]:
    """
    Instrument source code and execute inside an isolated execution context.
    Captures line steps, array operations, stdout, and errors.
    """
    # Security scan
    check_security(source_code)

    # AST Instrumentation
    try:
        modified_ast = instrument_code_ast(source_code)
        compiled_code = compile(modified_ast, "<string>", "exec")
    except SyntaxError as e:
        syntax_diag = {
            "id": "diag_syntax_1",
            "severity": "error",
            "category": "RUNTIME_ERROR",
            "message": f"SyntaxError: {str(e)}",
            "line": e.lineno or 1,
            "column": e.offset,
            "evidence": {"syntaxError": str(e)},
            "explanation": f"Python syntax error at line {e.lineno or 1}: {e.msg}.",
            "suggestedFix": "Check for missing colons, matching brackets, or incorrect indentation.",
            "confidence": "high",
            "stepId": 1
        }
        return {
            "version": "1.0",
            "executionId": execution_id,
            "language": "python",
            "code": source_code,
            "events": [
                {
                    "id": 1,
                    "type": "program.error",
                    "code": "SYNTAX_ERROR",
                    "message": str(e),
                    "line": e.lineno
                }
            ],
            "summary": {"totalSteps": 1, "durationMs": 0, "maxMemoryBytes": 0, "detectedStructures": []},
            "diagnostics": [syntax_diag],
            "complexity": {
                "timeComplexity": "N/A",
                "spaceComplexity": "N/A",
                "timeExplanation": "Syntax error prevented complexity analysis.",
                "spaceExplanation": "Syntax error prevented complexity analysis.",
                "confidence": "high",
                "evidence": {}
            }
        }

    # Prepare tracer environment
    tracer = TracerContext(execution_id=execution_id, max_steps=max_steps)

    # Redirect stdout
    captured_stdout = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = captured_stdout

    leetcode_env = {
        "__name__": "__main__",
        "_algoviz_tr": tracer,
        "__tr": tracer,
        "print": lambda *args, **kwargs: print(*args, file=captured_stdout, **kwargs),
        # LeetCode Classes
        "ListNode": ListNode,
        "TreeNode": TreeNode,
        "create_linked_list": create_linked_list,
        "create_tree": create_tree,
        # Standard LeetCode Modules
        "math": math,
        "collections": collections,
        "deque": deque,
        "defaultdict": defaultdict,
        "Counter": Counter,
        "OrderedDict": OrderedDict,
        "heapq": heapq,
        "bisect": bisect,
        "bisect_left": bisect_left,
        "bisect_right": bisect_right,
        "insort": insort,
        "itertools": itertools,
        "permutations": permutations,
        "combinations": combinations,
        "accumulate": accumulate,
        "product": product,
        "chain": chain,
        "functools": functools,
        "lru_cache": lru_cache,
        "cache": cache,
        "reduce": reduce,
        "typing": typing,
        "List": List,
        "Dict": Dict,
        "Set": Set,
        "Tuple": Tuple,
        "Optional": Optional,
        "Union": Union,
        "Any": Any,
        "Deque": Deque,
        "DefaultDict": DefaultDict,
        "re": re,
        "string": string,
        "random": random,
    }

    exec_globals = SandboxGlobals(tracer, leetcode_env)

    sys.settrace(tracer.trace_line)

    try:
        exec(compiled_code, exec_globals)
    except RuntimeError as e:
        if "STEP_LIMIT_EXCEEDED" in str(e):
            tracer.events.append({
                "id": tracer._next_id(force=True),
                "type": "program.error",
                "code": "STEP_LIMIT_EXCEEDED",
                "message": "Execution stopped because maximum visualization step limit was reached."
            })
        else:
            tracer.events.append({
                "id": tracer._next_id(force=True),
                "type": "program.error",
                "code": "RUNTIME_ERROR",
                "message": str(e)
            })
    except Exception as e:
        exc_type, exc_val, exc_tb = sys.exc_info()
        tb_lines = traceback.format_exception(exc_type, exc_val, exc_tb)
        last_line = tb_lines[-1].strip()
        err_lineno = None
        curr_tb = exc_tb
        while curr_tb:
            if curr_tb.tb_frame.f_code.co_filename == "<string>":
                err_lineno = curr_tb.tb_lineno
            curr_tb = curr_tb.tb_next
        if not err_lineno and exc_tb:
            err_lineno = exc_tb.tb_lineno
        tracer.events.append({
            "id": tracer._next_id(force=True),
            "type": "program.error",
            "code": exc_type.__name__ if exc_type else "RUNTIME_ERROR",
            "message": last_line,
            "line": err_lineno
        })
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    # Capture stdout logs
    output_text = captured_stdout.getvalue()
    if output_text:
        tracer.stdout_logs = [line for line in output_text.splitlines() if line]

    trace = tracer.finalize(source_code)

    # Perform deterministic AST & trace analysis for Bug Detection & Complexity
    try:
        diagnostics, complexity = analyze_trace_and_code(
            source_code=source_code,
            events=trace.get("events", []),
            summary=trace.get("summary", {}),
            stdout=trace.get("stdout", [])
        )
        trace["diagnostics"] = diagnostics
        trace["complexity"] = complexity
    except Exception as e:
        trace["diagnostics"] = []
        trace["complexity"] = {
            "timeComplexity": "O(?)",
            "spaceComplexity": "O(?)",
            "timeExplanation": f"Analysis encountered error: {str(e)}",
            "spaceExplanation": "Analysis unavailable.",
            "confidence": "low",
            "evidence": {}
        }

    return trace

