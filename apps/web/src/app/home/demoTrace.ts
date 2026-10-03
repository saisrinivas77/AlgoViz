/**
 * Pre-computed Bubble Sort execution trace for the home page demo.
 * This mirrors what the actual Python execution engine produces.
 *
 *   def bubble_sort(nums):
 *       n = len(nums)
 *       for i in range(n):
 *           for j in range(0, n - i - 1):
 *               if nums[j] > nums[j + 1]:
 *                   nums[j], nums[j + 1] = nums[j + 1], nums[j]
 *       return nums
 *
 *   nums = [64, 34, 25, 12, 22, 11, 90]
 *   bubble_sort(nums)
 */
import { DVIRExecutionTrace } from "@algoviz/dvir";

export const BUBBLE_SORT_DEMO_CODE = `def bubble_sort(nums):
    n = len(nums)
    for i in range(n):
        for j in range(0, n - i - 1):
            if nums[j] > nums[j + 1]:
                nums[j], nums[j + 1] = nums[j+1], nums[j]
    return nums

nums = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(nums)`;

let _id = 0;
const id = () => _id++;

export const BUBBLE_SORT_TRACE: DVIRExecutionTrace = {
  version: "1.0",
  executionId: "home-demo-bubble-sort",
  language: "python",
  createdAt: "2026-01-01T00:00:00Z",
  summary: {
    totalSteps: 0,
    durationMs: 120,
    maxMemoryBytes: 1024 * 64,
    detectedStructures: ["array"],
  },
  code: BUBBLE_SORT_DEMO_CODE,
  stdout: [],
  events: [
    // nums = [64, 34, 25, 12, 22, 11, 90]
    { id: id(), type: "line.execute", source: { line: 9, columnStart: 1 }, stackDepth: 0 },
    { id: id(), type: "variable.create", name: "nums", value: [64, 34, 25, 12, 22, 11, 90], variableType: "list", source: { line: 9, columnStart: 1 }, stackDepth: 0 },

    // bubble_sort(nums)
    { id: id(), type: "line.execute", source: { line: 10, columnStart: 1 }, stackDepth: 0 },
    { id: id(), type: "function.call", functionName: "bubble_sort", frameId: "frame_0", args: { nums: [64, 34, 25, 12, 22, 11, 90] }, source: { line: 10, columnStart: 1 }, stackDepth: 1 },

    // n = len(nums) = 7
    { id: id(), type: "line.execute", source: { line: 2, columnStart: 5 }, stackDepth: 1 },
    { id: id(), type: "variable.create", name: "n", value: 7, variableType: "int", source: { line: 2, columnStart: 5 }, stackDepth: 1 },

    // === Pass i=0 ===
    { id: id(), type: "line.execute", source: { line: 3, columnStart: 5 }, stackDepth: 1 },
    { id: id(), type: "variable.create", name: "i", value: 0, variableType: "int", source: { line: 3, columnStart: 5 }, stackDepth: 1 },

    // j=0: compare 64>34 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.create", name: "j", value: 0, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 0, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 0, indexB: 1, valueA: 34, valueB: 64, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [34, 64, 25, 12, 22, 11, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=1: compare 64>25 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 1, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 1, indexB: 2, valueA: 25, valueB: 64, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [34, 25, 64, 12, 22, 11, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=2: compare 64>12 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 2, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 3, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 2, indexB: 3, valueA: 12, valueB: 64, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [34, 25, 12, 64, 22, 11, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=3: compare 64>22 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 3, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 3, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 4, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 3, indexB: 4, valueA: 22, valueB: 64, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [34, 25, 12, 22, 64, 11, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=4: compare 64>11 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 4, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 4, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 5, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 4, indexB: 5, valueA: 11, valueB: 64, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [34, 25, 12, 22, 11, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=5: compare 64>90 → no swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 5, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 5, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 6, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },

    // === Pass i=1 ===
    { id: id(), type: "line.execute", source: { line: 3, columnStart: 5 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "i", value: 1, variableType: "int", source: { line: 3, columnStart: 5 }, stackDepth: 1 },

    // j=0: 34>25 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 0, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 0, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 0, indexB: 1, valueA: 25, valueB: 34, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [25, 34, 12, 22, 11, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=1: 34>12 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 1, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 1, indexB: 2, valueA: 12, valueB: 34, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [25, 12, 34, 22, 11, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=2: 34>22 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 2, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 3, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 2, indexB: 3, valueA: 22, valueB: 34, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [25, 12, 22, 34, 11, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=3: 34>11 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 3, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 3, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 4, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 3, indexB: 4, valueA: 11, valueB: 34, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [25, 12, 22, 11, 34, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=4: 34>64 → no swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 4, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 4, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 5, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },

    // === Pass i=2 ===
    { id: id(), type: "line.execute", source: { line: 3, columnStart: 5 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "i", value: 2, variableType: "int", source: { line: 3, columnStart: 5 }, stackDepth: 1 },

    // j=0: 25>12 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 0, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 0, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 0, indexB: 1, valueA: 12, valueB: 25, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [12, 25, 22, 11, 34, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=1: 25>22 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 1, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 1, indexB: 2, valueA: 22, valueB: 25, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [12, 22, 25, 11, 34, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=2: 25>11 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 2, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 3, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 2, indexB: 3, valueA: 11, valueB: 25, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [12, 22, 11, 25, 34, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=3: 25>34 → no swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 3, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 3, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 4, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },

    // === Pass i=3 ===
    { id: id(), type: "line.execute", source: { line: 3, columnStart: 5 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "i", value: 3, variableType: "int", source: { line: 3, columnStart: 5 }, stackDepth: 1 },

    // j=0: 12>22 → no swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 0, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 0, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },

    // j=1: 22>11 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 1, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 1, indexB: 2, valueA: 11, valueB: 22, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [12, 11, 22, 25, 34, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=2: 22>25 → no swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 2, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 3, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },

    // === Pass i=4 ===
    { id: id(), type: "line.execute", source: { line: 3, columnStart: 5 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "i", value: 4, variableType: "int", source: { line: 3, columnStart: 5 }, stackDepth: 1 },

    // j=0: 12>11 → swap
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 0, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 0, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "array.swap", target: "nums", indexA: 0, indexB: 1, valueA: 11, valueB: 12, source: { line: 6, columnStart: 17 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "nums", value: [11, 12, 22, 25, 34, 64, 90], variableType: "list", source: { line: 6, columnStart: 17 }, stackDepth: 1 },

    // j=1: 12>22 → no
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 1, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 2, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },

    // === Pass i=5: fully sorted ===
    { id: id(), type: "line.execute", source: { line: 3, columnStart: 5 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "i", value: 5, variableType: "int", source: { line: 3, columnStart: 5 }, stackDepth: 1 },

    // j=0: 11>12 → no
    { id: id(), type: "line.execute", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "variable.update", name: "j", value: 0, variableType: "int", source: { line: 4, columnStart: 9 }, stackDepth: 1 },
    { id: id(), type: "line.execute", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 0, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },
    { id: id(), type: "array.access", target: "nums", index: 1, accessType: "compare", source: { line: 5, columnStart: 13 }, stackDepth: 1 },

    // Return
    { id: id(), type: "line.execute", source: { line: 7, columnStart: 5 }, stackDepth: 1 },
    { id: id(), type: "function.return", functionName: "bubble_sort", frameId: "frame_0", returnValue: [11, 12, 22, 25, 34, 64, 90], source: { line: 7, columnStart: 5 }, stackDepth: 0 },
  ],
};
