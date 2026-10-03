"""
Deterministic AST & Trace Analyzer for AlgoViz Engine.
Performs evidence-based Bug Detection, Multi-layer Complexity Analysis,
and Algorithmic Pattern Identification.
"""

import ast
import math
from typing import Any, Dict, List, Optional, Tuple

def analyze_trace_and_code(
    source_code: str,
    events: List[Dict[str, Any]],
    summary: Dict[str, Any],
    stdout: Optional[List[str]] = None
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Analyzes Python source code and runtime execution events to produce:
    1. Deterministic Diagnostics (bugs, runtime errors, algorithm flaws, performance warnings)
    2. Multi-layer Time & Space Complexity Analysis with evidence and confidence
    """
    diagnostics = []
    
    # 1. Parse AST
    parsed_ast = None
    try:
        parsed_ast = ast.parse(source_code)
    except SyntaxError:
        pass

    # 2. Extract runtime error events if present
    runtime_error_event = None
    step_limit_event = None
    for ev in events:
        if ev.get("type") == "program.error":
            if ev.get("code") == "STEP_LIMIT_EXCEEDED":
                step_limit_event = ev
            else:
                runtime_error_event = ev

    # 3. Detect Runtime Errors
    if runtime_error_event:
        err_diag = _analyze_runtime_error(runtime_error_event, events, source_code)
        if err_diag:
            diagnostics.append(err_diag)

    # 4. Detect Step Limit / Infinite Loop Errors
    if step_limit_event:
        inf_diag = _analyze_step_limit_or_infinite_loop(step_limit_event, events, source_code, parsed_ast)
        if inf_diag:
            diagnostics.append(inf_diag)

    # 5. Static AST + Trace Logical Bug Detection
    if parsed_ast:
        ast_diags = _analyze_logical_bugs(parsed_ast, events, source_code)
        diagnostics.extend(ast_diags)

    # 6. Complexity Analysis (Multi-layer: AST static + trace evidence)
    complexity = _analyze_complexity(parsed_ast, events, source_code)

    return diagnostics, complexity


def _analyze_runtime_error(error_event: Dict[str, Any], events: List[Dict[str, Any]], source_code: str) -> Optional[Dict[str, Any]]:
    """Extracts evidence-based diagnostics for runtime errors (IndexError, ZeroDivisionError, etc.)"""
    err_code = error_event.get("code", "RUNTIME_ERROR")
    err_msg = error_event.get("message", "A runtime error occurred.")
    
    # Find last line executed before error
    last_line = error_event.get("line")
    last_vars = {}
    last_step_id = error_event.get("id", 1)

    for ev in reversed(events):
        if ev.get("type") == "line.execute":
            if not last_line:
                last_line = ev.get("source", {}).get("line")
            break

    # Gather variables right before the error
    for ev in reversed(events):
        if ev.get("type") in ("variable.update", "variable.create"):
            var_name = ev.get("name")
            if var_name and var_name not in last_vars:
                last_vars[var_name] = ev.get("value")
        if len(last_vars) >= 6:
            break

    explanation = err_msg
    suggested_fix = "Review variable bounds and ensure operation safety."
    confidence = "high"

    if "IndexError" in err_code or "out of range" in err_msg:
        explanation = f"An attempt was made to access an array index that exceeds its boundaries at line {last_line}."
        suggested_fix = "Verify loop range: use 'len(arr) - 1' for last element, and check index bounds before accessing."
    elif "ZeroDivisionError" in err_code or "division by zero" in err_msg:
        explanation = f"Division or modulo by zero occurred at line {last_line}."
        suggested_fix = "Ensure divisor is non-zero with a defensive check: 'if divisor != 0:'."
    elif "RecursionError" in err_code or "recursion depth" in err_msg:
        explanation = "Maximum recursion depth exceeded. The recursive function did not terminate."
        suggested_fix = "Check base cases: ensure parameters monotonically approach base condition (e.g. n - 1 or n // 2)."
    elif "KeyError" in err_code:
        explanation = f"Dictionary key was not found at line {last_line}."
        suggested_fix = "Use 'dict.get(key, default)' or check 'if key in dict:' before accessing."
    elif "TypeError" in err_code:
        explanation = f"Incompatible types encountered in operation at line {last_line}."
        suggested_fix = "Verify types of operands before operation or add explicit type conversion."

    return {
        "id": f"diag_rt_{last_step_id}",
        "severity": "error",
        "category": "RUNTIME_ERROR",
        "message": f"{err_code}: {err_msg}",
        "line": last_line or 1,
        "evidence": last_vars,
        "explanation": explanation,
        "suggestedFix": suggested_fix,
        "confidence": confidence,
        "stepId": last_step_id
    }


def _analyze_step_limit_or_infinite_loop(
    error_event: Dict[str, Any],
    events: List[Dict[str, Any]],
    source_code: str,
    parsed_ast: Optional[ast.AST]
) -> Optional[Dict[str, Any]]:
    """Detects infinite loops and non-progressing loop states."""
    # Analyze frequency of executed lines
    line_counts: Dict[int, int] = {}
    last_line = 1
    for ev in events:
        if ev.get("type") == "line.execute":
            l = ev.get("source", {}).get("line")
            if l:
                last_line = l
                line_counts[l] = line_counts.get(l, 0) + 1

    # Find the most repeated line in a loop
    repeated_line = last_line
    max_count = 0
    for l, count in line_counts.items():
        if count > max_count:
            max_count = count
            repeated_line = l

    # Find variables repeating in this loop
    recent_vars = {}
    for ev in reversed(events[-100:]):
        if ev.get("type") in ("variable.update", "variable.create"):
            var_name = ev.get("name")
            if var_name and var_name not in recent_vars:
                recent_vars[var_name] = ev.get("value")

    return {
        "id": "diag_inf_loop",
        "severity": "error",
        "category": "LOGICAL_ERROR",
        "message": f"Infinite Loop / Non-terminating execution detected at line {repeated_line}.",
        "line": repeated_line,
        "evidence": {
            "repeatedLine": repeated_line,
            "iterationCount": max_count,
            "variablesAtHalt": recent_vars
        },
        "explanation": (
            f"The execution loop around line {repeated_line} executed {max_count} times without reaching termination. "
            "The loop condition variables appear not to advance toward the exit condition."
        ),
        "suggestedFix": (
            "Ensure loop control variables (e.g. index, pointers, or flags) are updated on every branch inside the loop."
        ),
        "confidence": "high",
        "stepId": error_event.get("id", 1)
    }


def _analyze_logical_bugs(
    parsed_ast: ast.AST,
    events: List[Dict[str, Any]],
    source_code: str
) -> List[Dict[str, Any]]:
    """Detects algorithmic and logical bugs using AST and execution history."""
    diagnostics = []

    # 1. Binary Search Boundary Bug detection
    # Pattern: while low <= high (or low < high) where inside:
    # low = mid (without + 1) or high = mid (without - 1)
    for node in ast.walk(parsed_ast):
        if isinstance(node, ast.While):
            loop_vars = _get_names_in_expr(node.test)
            if ("low" in loop_vars or "left" in loop_vars) and ("high" in loop_vars or "right" in loop_vars):
                low_var = "low" if "low" in loop_vars else "left"
                high_var = "high" if "high" in loop_vars else "right"

                for body_node in ast.walk(node):
                    if isinstance(body_node, ast.Assign):
                        for tgt in body_node.targets:
                            if isinstance(tgt, ast.Name) and tgt.id == low_var:
                                if isinstance(body_node.value, ast.Name) and body_node.value.id == "mid":
                                    cond_str = "low <= high"
                                    try:
                                        cond_str = ast.unparse(node.test)
                                    except Exception:
                                        pass
                                    diagnostics.append({
                                        "id": f"diag_bs_boundary_{body_node.lineno}",
                                        "severity": "error",
                                        "category": "ALGORITHM_ERROR",
                                        "message": f"Binary Search Boundary Bug: '{low_var} = mid' can cause an infinite loop.",
                                        "line": body_node.lineno,
                                        "evidence": {
                                            "loopCondition": cond_str,
                                            "faultyAssignment": f"{low_var} = mid",
                                            "scenario": f"When {high_var} - {low_var} == 1, mid calculates to {low_var}. Assigning '{low_var} = mid' results in no progress."
                                        },
                                        "explanation": (
                                            f"When integer division calculates 'mid = ({low_var} + {high_var}) // 2', "
                                            f"if {high_var} is {low_var} + 1, 'mid' equals '{low_var}'. Setting '{low_var} = mid' leaves "
                                            f"'{low_var}' unchanged, repeating the same search range indefinitely."
                                        ),
                                        "suggestedFix": f"Update '{low_var} = mid + 1' to ensure the search range shrinks.",
                                        "confidence": "high"
                                    })
                            elif isinstance(tgt, ast.Name) and tgt.id == high_var:
                                if isinstance(body_node.value, ast.Name) and body_node.value.id == "mid":
                                    if isinstance(node.test, ast.Compare) and any(isinstance(op, ast.LtE) for op in node.test.ops):
                                        diagnostics.append({
                                            "id": f"diag_bs_high_boundary_{body_node.lineno}",
                                            "severity": "warning",
                                            "category": "ALGORITHM_ERROR",
                                            "message": f"Binary Search Boundary Bug: '{high_var} = mid' with '<=' condition may cause off-by-one or loop stall.",
                                            "line": body_node.lineno,
                                            "evidence": {
                                                "faultyAssignment": f"{high_var} = mid"
                                            },
                                            "explanation": (
                                                f"When searching with inclusive boundaries ('{low_var} <= {high_var}'), "
                                                f"setting '{high_var} = mid - 1' is standard because 'mid' was already checked."
                                            ),
                                            "suggestedFix": f"Use '{high_var} = mid - 1'.",
                                            "confidence": "high"
                                        })

    # 2. Check for Inverted Binary Search Comparison
    # e.g. if arr[mid] > target: low = mid + 1 (should be high = mid - 1)
    for node in ast.walk(parsed_ast):
        if isinstance(node, ast.If):
            test_str = ""
            try:
                test_str = ast.unparse(node.test)
            except Exception:
                pass
            if "mid" in test_str and "target" in test_str:
                body_assigns = [
                    tgt.id
                    for b in node.body if isinstance(b, ast.Assign)
                    for tgt in b.targets if isinstance(tgt, ast.Name)
                ]
                if ">" in test_str and ("low" in body_assigns or "left" in body_assigns):
                    low_var = "low" if "low" in body_assigns else "left"
                    diagnostics.append({
                        "id": f"diag_bs_inverted_{node.lineno}",
                        "severity": "error",
                        "category": "LOGICAL_ERROR",
                        "message": f"Inverted Comparison Logic: moving '{low_var}' right when middle element is greater than target.",
                        "line": node.lineno,
                        "evidence": {
                            "condition": test_str,
                            "bodyAssignment": f"{low_var} updated"
                        },
                        "explanation": (
                            "In an ascending sorted array, if arr[mid] is greater than target, target must lie in the left half. "
                            "Moving the lower pointer right discards the potential target."
                        ),
                        "suggestedFix": "Change to 'high = mid - 1' when 'arr[mid] > target'.",
                        "confidence": "high"
                    })

    # 3. Check for Binary Search on Unsorted Array at runtime
    array_updates = [ev for ev in events if ev.get("type") in ("variable.create", "variable.update") and isinstance(ev.get("value"), list)]
    if array_updates and any("binary_search" in ev.get("functionName", "") for ev in events if ev.get("type") == "function.call"):
        for arr_ev in array_updates:
            lst = arr_ev.get("value")
            if isinstance(lst, list) and len(lst) > 2 and all(isinstance(x, (int, float)) for x in lst):
                if lst != sorted(lst):
                    line_no = arr_ev.get("source", {}).get("line", 1) if arr_ev.get("source") else 1
                    diagnostics.append({
                        "id": "diag_bs_unsorted_input",
                        "severity": "warning",
                        "category": "ALGORITHM_ERROR",
                        "message": f"Binary Search Precondition Violated: array '{arr_ev.get('name')}' is not sorted.",
                        "line": line_no,
                        "evidence": {
                            "array": lst[:10]
                        },
                        "explanation": (
                            "Binary search assumes the input array is strictly sorted. "
                            "Searching an unsorted array produces incorrect results or false negatives."
                        ),
                        "suggestedFix": f"Sort the array before binary search: '{arr_ev.get('name')}.sort()'.",
                        "confidence": "high"
                    })
                    break

    # 4. Performance Warning: Nested loop O(N^2) on large input
    max_nesting = 0
    for node in ast.walk(parsed_ast):
        if isinstance(node, (ast.For, ast.While)):
            depth = _get_loop_depth(node)
            if depth > max_nesting:
                max_nesting = depth

    if max_nesting >= 2:
        line_executions = sum(1 for e in events if e.get("type") == "line.execute")
        if line_executions > 1000:
            diagnostics.append({
                "id": "diag_perf_nested_loop",
                "severity": "info",
                "category": "PERFORMANCE_WARNING",
                "message": f"Quadratic Execution: nested loop structure generated {line_executions} line executions.",
                "line": 1,
                "evidence": {
                    "nestingDepth": max_nesting,
                    "totalSteps": line_executions
                },
                "explanation": (
                    f"A nested loop structure with nesting depth {max_nesting} was detected. "
                    "For large inputs, quadratic O(n²) or cubic O(n³) behavior may become a performance bottleneck."
                ),
                "suggestedFix": "Consider algorithmic optimizations (e.g. hash maps, sorting, two pointers, or divide-and-conquer).",
                "confidence": "medium"
            })

    # 5. Detect Uncalled Functions / Solution Classes
    top_level_funcs = [n for n in parsed_ast.body if isinstance(n, ast.FunctionDef) and not n.name.startswith("_")]
    top_level_classes = [n for n in parsed_ast.body if isinstance(n, ast.ClassDef)]
    has_func_calls = any(e.get("type") == "function.call" for e in events)

    if top_level_funcs and not has_func_calls:
        for fn in top_level_funcs:
            diagnostics.append({
                "id": f"diag_uncalled_func_{fn.name}",
                "severity": "warning",
                "category": "USAGE_WARNING",
                "message": f"Function '{fn.name}' was defined but never called.",
                "line": fn.lineno,
                "evidence": {
                    "functionName": fn.name,
                    "arguments": [arg.arg for arg in fn.args.args if arg.arg != "self"]
                },
                "explanation": (
                    f"The algorithm '{fn.name}' was defined, but no driver statement was found to execute it. "
                    "Only the function definition was processed by the interpreter."
                ),
                "suggestedFix": f"Add a call at the bottom of your code, e.g.: '{fn.name}(...)' to execute and visualize the algorithm.",
                "confidence": "high"
            })
    elif top_level_classes and not has_func_calls:
        for cls_node in top_level_classes:
            diagnostics.append({
                "id": f"diag_uncalled_class_{cls_node.name}",
                "severity": "warning",
                "category": "USAGE_WARNING",
                "message": f"Class '{cls_node.name}' was defined without instantiation or method calls.",
                "line": cls_node.lineno,
                "evidence": {
                    "className": cls_node.name
                },
                "explanation": (
                    f"The class '{cls_node.name}' was defined, but not instantiated. "
                    "To visualize its methods, instantiate it and invoke its method at the bottom of the script."
                ),
                "suggestedFix": f"Instantiate and call its method, e.g.: 'sol = {cls_node.name}()\\nsol.some_method(...)'",
                "confidence": "high"
            })

    return diagnostics


def _get_loop_depth(node: ast.AST) -> int:
    """Calculates maximum nested loop depth starting from this node."""
    max_child = 0
    for child in ast.iter_child_nodes(node):
        if isinstance(child, (ast.For, ast.While)):
            max_child = max(max_child, _get_loop_depth(child))
        else:
            for sub in ast.walk(child):
                if isinstance(sub, (ast.For, ast.While)):
                    max_child = max(max_child, _get_loop_depth(sub))
    return 1 + max_child


def _get_names_in_expr(expr: Optional[ast.AST]) -> List[str]:
    """Returns all variable names referenced in an AST expression."""
    if not expr:
        return []
    return [node.id for node in ast.walk(expr) if isinstance(node, ast.Name)]


def _analyze_complexity(
    parsed_ast: Optional[ast.AST],
    events: List[Dict[str, Any]],
    source_code: str
) -> Dict[str, Any]:
    """
    Multi-layer Time & Space Complexity Analyzer.
    Combines AST static loop/recursion patterns with empirical runtime metrics.
    """
    if not parsed_ast:
        return {
            "timeComplexity": "O(?)",
            "spaceComplexity": "O(?)",
            "timeExplanation": "Unable to determine complexity because source code could not be parsed.",
            "spaceExplanation": "Unable to determine complexity.",
            "confidence": "low",
            "evidence": {}
        }

    max_loop_depth = 0
    for node in ast.walk(parsed_ast):
        if isinstance(node, (ast.For, ast.While)):
            depth = _get_loop_depth(node)
            if depth > max_loop_depth:
                max_loop_depth = depth

    has_recursion = False
    max_call_depth = 0
    for ev in events:
        d = ev.get("stackDepth", 0)
        if d > max_call_depth:
            max_call_depth = d
    if max_call_depth >= 2:
        has_recursion = True

    input_size_n = 0
    for ev in events:
        if ev.get("type") in ("variable.create", "variable.update"):
            val = ev.get("value")
            if isinstance(val, list) and len(val) > input_size_n:
                input_size_n = len(val)

    has_halving = False
    for node in ast.walk(parsed_ast):
        if isinstance(node, ast.BinOp):
            if isinstance(node.op, (ast.FloorDiv, ast.Div)):
                has_halving = True

    has_sorting_call = False
    for node in ast.walk(parsed_ast):
        if isinstance(node, ast.Call):
            func_name = ""
            if isinstance(node.func, ast.Name):
                func_name = node.func.id
            elif isinstance(node.func, ast.Attribute):
                func_name = node.func.attr
            if func_name in ("sort", "sorted"):
                has_sorting_call = True

    line_execs = sum(1 for e in events if e.get("type") == "line.execute")
    comparisons = sum(1 for e in events if e.get("type") == "array.access" and e.get("accessType") == "compare")
    swaps = sum(1 for e in events if e.get("type") == "array.swap")

    time_comp = "O(n)"
    time_exp = "Single pass through the data."
    time_conf = "high"
    observations = []

    if has_halving and max_loop_depth == 1 and not has_recursion:
        time_comp = "O(log n)"
        time_exp = (
            "The search space is approximately halved at each iteration "
            "(detected integer halving division in the loop). "
            f"Observed {line_execs} line steps for input size n = {input_size_n}."
        )
        time_conf = "high"
        observations.append(f"Input size n = {input_size_n}, line executions = {line_execs}")
        if input_size_n > 0:
            expected_log = math.ceil(math.log2(input_size_n)) if input_size_n > 1 else 1
            observations.append(f"Expected log2(n) iterations ≈ {expected_log}")

    elif max_loop_depth >= 2:
        time_comp = "O(n²)" if max_loop_depth == 2 else f"O(n^{max_loop_depth})"
        time_exp = (
            f"Nested loop structure with nesting level {max_loop_depth}. "
            f"The inner loop runs for each iteration of the outer loop. "
            f"Generated {line_execs} steps with {comparisons} comparisons and {swaps} swaps."
        )
        time_conf = "high"
        observations.append(f"Nesting depth: {max_loop_depth}")
        observations.append(f"Comparisons: {comparisons}, Swaps: {swaps}")

    elif has_sorting_call:
        time_comp = "O(n log n)"
        time_exp = (
            "The code relies on standard comparison sorting (Timsort in Python), "
            "which has a guaranteed average and worst-case time complexity of O(n log n)."
        )
        time_conf = "high"
        observations.append("Built-in sorting function detected")

    elif has_recursion:
        if max_call_depth > 1:
            time_comp = "O(n)"
            time_exp = f"Linear recursive traversal reaching depth {max_call_depth}."
            time_conf = "medium"
            observations.append(f"Max call stack depth: {max_call_depth}")
    else:
        time_comp = "O(n)"
        time_exp = f"Single linear loop iterating up to n = {input_size_n or 'length'} times."
        time_conf = "high"
        observations.append(f"Total line executions: {line_execs}")

    # Space Complexity Determination
    space_comp = "O(1)"
    space_exp = "Only a constant number of auxiliary variables are maintained in local scope."
    space_conf = "high"

    has_aux_collection = False
    for ev in events:
        if ev.get("type") in ("variable.create", "variable.update"):
            val = ev.get("value")
            name = ev.get("name", "")
            if isinstance(val, (list, dict, set)) and len(val) > 0 and name not in ("nums", "arr", "numbers"):
                has_aux_collection = True

    if has_recursion:
        space_comp = "O(d)"
        space_exp = (
            f"Call stack allocates memory proportional to recursion depth (maximum depth {max_call_depth}). "
            "Auxiliary space is bounded by the call stack frames."
        )
        space_conf = "high"
        observations.append(f"Recursion stack depth: {max_call_depth}")
    elif has_aux_collection:
        space_comp = "O(n)"
        space_exp = "Auxiliary data structure (list/dictionary/set) grows with the number of processed elements."
        space_conf = "high"
        observations.append("Auxiliary collection created in memory")
    else:
        space_comp = "O(1)"
        space_exp = "Only a constant number of scalar pointer and index variables are maintained."
        space_conf = "high"

    return {
        "timeComplexity": time_comp,
        "spaceComplexity": space_comp,
        "timeExplanation": time_exp,
        "spaceExplanation": space_exp,
        "confidence": time_conf,
        "evidence": {
            "loopCount": max_loop_depth,
            "maxDepth": max_call_depth,
            "totalOperations": line_execs,
            "reductionRatio": "Halving (1/2)" if has_halving else "Linear (1)",
            "observations": observations
        }
    }
