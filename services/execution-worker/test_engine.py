"""
Unit tests for AlgoViz Python Execution Engine & Sandbox.
"""

import unittest
from sandbox import execute_in_sandbox, SecurityError

class TestAlgoVizExecutionEngine(unittest.TestCase):

    def test_bubble_sort_trace(self):
        code = """
nums = [3, 1, 2]
for i in range(len(nums)):
    for j in range(len(nums) - i - 1):
        if nums[j] > nums[j+1]:
            nums[j], nums[j+1] = nums[j+1], nums[j]
"""
        trace = execute_in_sandbox(code, execution_id="test_bubble")
        self.assertEqual(trace["version"], "1.0")
        self.assertEqual(trace["language"], "python")
        self.assertGreater(len(trace["events"]), 10)
        
        # Verify array swap event was captured
        swap_events = [e for e in trace["events"] if e.get("type") == "array.swap"]
        self.assertGreater(len(swap_events), 0)
        self.assertEqual(swap_events[0]["target"], "nums")

    def test_binary_search_trace(self):
        code = """
def binary_search(arr, target):
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

result = binary_search([1, 2, 3, 4, 5], 4)
"""
        trace = execute_in_sandbox(code, execution_id="test_bs")
        call_events = [e for e in trace["events"] if e.get("type") == "function.call"]
        self.assertGreater(len(call_events), 0)
        self.assertEqual(call_events[0]["functionName"], "binary_search")

    def test_forbidden_module_security(self):
        malicious_code = "import os\nos.system('ls')"
        with self.assertRaises(SecurityError):
            execute_in_sandbox(malicious_code)

    def test_step_limit_error(self):
        infinite_loop = "while True:\n    pass"
        trace = execute_in_sandbox(infinite_loop, max_steps=100)
        error_events = [e for e in trace["events"] if e.get("type") == "program.error"]
        self.assertGreater(len(error_events), 0)
        self.assertEqual(error_events[0]["code"], "STEP_LIMIT_EXCEEDED")

if __name__ == "__main__":
    unittest.main()
