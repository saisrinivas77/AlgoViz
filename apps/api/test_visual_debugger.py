import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure execution-worker is in sys.path
WORKER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../services/execution-worker"))
if WORKER_DIR not in sys.path:
    sys.path.insert(0, WORKER_DIR)

from main import app
from sandbox import execute_in_sandbox
from analyzer import analyze_trace_and_code

client = TestClient(app)

def test_binary_search_execution_and_complexity():
    code = """def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
result = binary_search(nums, 23)
"""
    trace = execute_in_sandbox(code)
    assert trace["summary"]["totalSteps"] > 5
    assert "diagnostics" in trace
    assert "complexity" in trace

    complexity = trace["complexity"]
    assert complexity["timeComplexity"] == "O(log n)"
    assert complexity["spaceComplexity"] == "O(1)"
    assert complexity["confidence"] == "high"
    assert "halved" in complexity["timeExplanation"].lower() or "logarithmic" in complexity["timeExplanation"].lower()

    # No bugs should be detected in valid binary search
    err_diags = [d for d in trace["diagnostics"] if d["severity"] == "error"]
    assert len(err_diags) == 0


def test_bubble_sort_quadratic_complexity():
    code = """nums = [64, 34, 25, 12, 22]
n = len(nums)
for i in range(n):
    for j in range(0, n - i - 1):
        if nums[j] > nums[j + 1]:
            nums[j], nums[j + 1] = nums[j + 1], nums[j]
"""
    trace = execute_in_sandbox(code)
    complexity = trace["complexity"]
    assert complexity["timeComplexity"] == "O(n²)"
    assert complexity["spaceComplexity"] == "O(1)"
    assert complexity["confidence"] == "high"
    assert complexity["evidence"]["loopCount"] == 2


def test_recursive_factorial_stack_and_space():
    code = """def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

res = factorial(4)
"""
    trace = execute_in_sandbox(code)
    # Check that call stack events were captured
    call_events = [e for e in trace["events"] if e["type"] == "function.call"]
    return_events = [e for e in trace["events"] if e["type"] == "function.return"]
    assert len(call_events) >= 4
    assert len(return_events) >= 4

    complexity = trace["complexity"]
    assert complexity["spaceComplexity"] == "O(d)"
    assert complexity["evidence"]["maxDepth"] >= 4


def test_buggy_binary_search_boundary_detection():
    # Boundary bug: low = mid instead of low = mid + 1
    code = """def binary_search_buggy(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid
        else:
            high = mid - 1
    return -1

nums = [1, 3, 5, 7]
res = binary_search_buggy(nums, 6)
"""
    trace = execute_in_sandbox(code, max_steps=500)
    diags = trace["diagnostics"]
    boundary_bugs = [d for d in diags if d["category"] in ("ALGORITHM_ERROR", "LOGICAL_ERROR") and "boundary" in d["id"].lower()]
    assert len(boundary_bugs) > 0
    bug = boundary_bugs[0]
    assert bug["line"] in (9, 10)
    assert "mid + 1" in bug["suggestedFix"]
    assert bug["confidence"] == "high"


def test_inverted_comparison_detection():
    code = """def search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] > target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
"""
    trace = execute_in_sandbox(code)
    diags = trace["diagnostics"]
    inverted = [d for d in diags if "inverted" in d["id"].lower()]
    assert len(inverted) > 0
    assert inverted[0]["line"] in (6, 7)
    assert "high = mid - 1" in inverted[0]["suggestedFix"]


def test_infinite_loop_protection_and_diagnostic():
    code = """x = 0
while x < 10:
    pass
"""
    trace = execute_in_sandbox(code, max_steps=100)
    err_events = [e for e in trace["events"] if e["type"] == "program.error"]
    assert len(err_events) > 0
    assert err_events[0]["code"] == "STEP_LIMIT_EXCEEDED"

    # Must generate diagnostic for infinite loop
    inf_diags = [d for d in trace["diagnostics"] if d["id"] == "diag_inf_loop"]
    assert len(inf_diags) > 0
    assert inf_diags[0]["severity"] == "error"
    assert inf_diags[0]["line"] in (2, 3)


def test_runtime_error_diagnostic_zero_division():
    code = """a = 10
b = 0
c = a / b
"""
    trace = execute_in_sandbox(code)
    err_events = [e for e in trace["events"] if e["type"] == "program.error"]
    assert len(err_events) > 0
    diags = trace["diagnostics"]
    rt_diags = [d for d in diags if d["category"] == "RUNTIME_ERROR"]
    assert len(rt_diags) > 0
    assert rt_diags[0]["line"] in (3, 4)
    assert "ZeroDivisionError" in rt_diags[0]["message"]
    assert "divisor" in rt_diags[0]["suggestedFix"].lower()


def test_runtime_error_diagnostic_index_error():
    code = """arr = [1, 2, 3]
val = arr[10]
"""
    trace = execute_in_sandbox(code)
    err_events = [e for e in trace["events"] if e["type"] == "program.error"]
    assert len(err_events) > 0
    diags = trace["diagnostics"]
    rt_diags = [d for d in diags if d["category"] == "RUNTIME_ERROR"]
    assert len(rt_diags) > 0
    assert rt_diags[0]["line"] in (2, 3)
    assert "IndexError" in rt_diags[0]["message"]
    assert "boundaries" in rt_diags[0]["explanation"].lower()


def test_api_executions_endpoint_returns_diagnostics_and_complexity():
    payload = {
        "language": "python",
        "source": "nums = [1, 2, 3]\nfor i in range(len(nums)):\n    pass"
    }
    response = client.post("/api/v1/executions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "trace" in data
    trace = data["trace"]
    assert "diagnostics" in trace
    assert "complexity" in trace
    assert trace["complexity"]["timeComplexity"] == "O(n)"


def test_uncalled_function_diagnostic():
    code = """def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0]
    return quicksort([x for x in arr[1:] if x < pivot]) + [pivot] + quicksort([x for x in arr[1:] if x >= pivot])
"""
    trace = execute_in_sandbox(code)
    diags = trace["diagnostics"]
    uncalled = [d for d in diags if d.get("category") == "USAGE_WARNING"]
    assert len(uncalled) > 0
    assert "quicksort" in uncalled[0]["message"]
    assert "quicksort(...)" in uncalled[0]["suggestedFix"]


def test_no_module_leakage_in_variables():
    code = """x = 42
nums = [1, 2, 3]
"""
    trace = execute_in_sandbox(code)
    var_events = [e for e in trace["events"] if e["type"] in ("variable.create", "variable.update")]
    var_names = {e["name"] for e in var_events}
    # Ensure standard sandbox imports did not leak into user variables
    for forbidden in ("math", "collections", "heapq", "bisect", "itertools", "functools", "typing", "re", "random"):
        assert forbidden not in var_names, f"Sandbox module {forbidden} leaked into user variables!"
    assert "x" in var_names
    assert "nums" in var_names

