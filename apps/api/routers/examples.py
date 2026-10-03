from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/examples", tags=["examples"])

EXAMPLES = [
    {
        "id": "bubble-sort",
        "title": "Bubble Sort",
        "category": "Sorting",
        "difficulty": "Easy",
        "language": "python",
        "description": "Iteratively compare adjacent elements and swap them if they are out of order.",
        "code": """def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

nums = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(nums)
"""
    },
    {
        "id": "binary-search",
        "title": "Binary Search",
        "category": "Searching",
        "difficulty": "Easy",
        "language": "python",
        "description": "Efficient search in a sorted array by halving the search space at each step.",
        "code": """def binary_search(arr, target):
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
    },
    {
        "id": "next-permutation",
        "title": "Next Permutation",
        "category": "Arrays",
        "difficulty": "Medium",
        "language": "python",
        "description": "Rearrange numbers into the lexicographically next greater permutation of numbers.",
        "code": """def next_permutation(nums):
    n = len(nums)
    i = n - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    
    if i >= 0:
        j = n - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    
    # Reverse suffix
    left, right = i + 1, n - 1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1

arr = [1, 3, 5, 4, 2]
next_permutation(arr)
"""
    },
    {
        "id": "two-sum-sorted",
        "title": "Two Sum (Two Pointer)",
        "category": "Arrays",
        "difficulty": "Easy",
        "language": "python",
        "description": "Find two numbers in a sorted array that add up to a target sum.",
        "code": """def two_sum_sorted(numbers, target):
    left = 0
    right = len(numbers) - 1
    while left < right:
        curr_sum = numbers[left] + numbers[right]
        if curr_sum == target:
            return [left, right]
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return []

nums = [1, 3, 4, 6, 8, 11, 15]
two_sum_sorted(nums, 14)
"""
    },
    {
        "id": "linked-list-traversal",
        "title": "Linked List Traversal",
        "category": "Linked Lists",
        "difficulty": "Easy",
        "language": "python",
        "description": "Traverse a singly linked list and compute node values.",
        "code": """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Create linked list: 10 -> 20 -> 30 -> 40
head = ListNode(10)
head.next = ListNode(20)
head.next.next = ListNode(30)
head.next.next.next = ListNode(40)

curr = head
values = []
while curr is not None:
    values.append(curr.val)
    curr = curr.next
"""
    }
]

@router.get("")
def list_examples():
    return EXAMPLES

@router.get("/{example_id}")
def get_example(example_id: str):
    for ex in EXAMPLES:
        if ex["id"] == example_id:
            return ex
    return EXAMPLES[0]
