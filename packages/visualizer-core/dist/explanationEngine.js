"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStepExplanation = generateStepExplanation;
function generateStepExplanation(ev, nextEv, variables, prevVariables, changedVars, lineNo, sourceCodeLines) {
    const lineContent = lineNo && lineNo <= sourceCodeLines.length ? sourceCodeLines[lineNo - 1]?.trim() : "";
    const evType = ev?.type || "line.execute";
    let changedText = "No variables changed.";
    if (changedVars.length > 0) {
        const diffs = changedVars.map((v) => {
            const prev = prevVariables[v] !== undefined ? JSON.stringify(prevVariables[v]) : "undefined";
            const curr = JSON.stringify(variables[v]);
            return `${v}: ${prev} → ${curr}`;
        });
        changedText = diffs.join(", ");
    }
    let begWhat = "Executing line of code.";
    let begWhy = "The computer runs statements in order from top to bottom.";
    let begNext = "The program will proceed to the next step.";
    let intWhat = "Line execution step.";
    let intWhy = "Standard control flow progression.";
    let intNext = "Next instruction in current basic block.";
    let detWhat = `Evaluating line ${lineNo || "?"}: '${lineContent}'`;
    let detWhy = `Stack frame state evaluation for event '${evType}'.`;
    let detNext = `Dispatching next event '${nextEv?.type || "program.end"}'.`;
    // Specific event-based reasoning
    if (evType === "array.swap") {
        const swap = ev;
        const idxA = swap.indexA;
        const idxB = swap.indexB;
        const valA = swap.valueA ?? variables[swap.target]?.[idxA];
        const valB = swap.valueB ?? variables[swap.target]?.[idxB];
        begWhat = `Swapped positions ${idxA} and ${idxB} in the list.`;
        begWhy = `The two items were in the wrong order, so we traded their spots to help sort the list.`;
        begNext = `The algorithm will move to the next pair of items to check.`;
        intWhat = `Swapped ${swap.target}[${idxA}] (${valA}) with ${swap.target}[${idxB}] (${valB}).`;
        intWhy = `Inversion detected where adjacent elements violated the sorting invariant.`;
        intNext = `Increment inner loop index or complete current pass.`;
        detWhat = `Array swap mutation on target '${swap.target}' at indices (${idxA}, ${idxB}).`;
        detWhy = `Element values (${valA}, ${valB}) swapped in-place.`;
        detNext = `Yield control to enclosing loop iteration.`;
    }
    else if (evType === "array.access") {
        const access = ev;
        const idx = access.index;
        const target = access.target;
        const val = variables[target]?.[idx];
        if (access.accessType === "compare") {
            begWhat = `Looking at element number ${idx} (value: ${val}) to compare it.`;
            begWhy = `We need to see whether this number is smaller, larger, or equal to our target.`;
            begNext = `A decision will be made based on whether the comparison is true or false.`;
            intWhat = `Comparative read of ${target}[${idx}] = ${val}.`;
            intWhy = `Evaluating comparison predicate against adjacent element or search target.`;
            intNext = `Branch evaluation based on predicate truth value.`;
            detWhat = `Subscript comparison read at ${target}[${idx}].`;
            detWhy = `AST comparison operator operand evaluation.`;
            detNext = `Branch jump or conditional assignment.`;
        }
        else {
            begWhat = `Checking the value at position ${idx} in '${target}'.`;
            begWhy = `Reading data from memory to use in calculation.`;
            begNext = `The value will be used in the current line's formula or check.`;
            intWhat = `Array read at index ${idx}.`;
            intWhy = `Loading element into local register for expression evaluation.`;
            intNext = `Continue statement evaluation.`;
            detWhat = `Memory read: ${target}[${idx}] = ${val}.`;
            detWhy = `AST subscript load node evaluation.`;
            detNext = `Store or intermediate computation.`;
        }
    }
    else if (evType === "variable.update" || evType === "variable.create") {
        const vEv = ev;
        const varName = vEv.name;
        const val = vEv.value;
        if (varName === "mid") {
            const low = variables["low"] ?? variables["left"] ?? 0;
            const high = variables["high"] ?? variables["right"] ?? 0;
            begWhat = `Calculated middle index: mid = ${val}.`;
            begWhy = `Binary search cuts the problem in half by always checking the exact middle first (${low} + ${high}) // 2.`;
            begNext = `Next, we check if the middle element is our target.`;
            intWhat = `Computed midpoint mid = ${val} from bounds [${low}, ${high}].`;
            intWhy = `Divide-and-conquer partition step dividing the search range.`;
            intNext = `Compare arr[mid] with target key.`;
            detWhat = `Midpoint pointer assignment: mid = (${low} + ${high}) // 2 = ${val}.`;
            detWhy = `Calculates median index to achieve O(log n) logarithmic reduction.`;
            detNext = `Three-way comparison (equality, less-than, greater-than).`;
        }
        else if (varName === "low" || varName === "left") {
            begWhat = `Moved the left boundary 'low' forward to ${val}.`;
            begWhy = `The target is larger than our middle guess, so the answer cannot be on the left side.`;
            begNext = `Now we only search the right half of the remaining numbers.`;
            intWhat = `Updated lower bound ${varName} = ${val}.`;
            intWhy = `Search target is strictly greater than midpoint value, eliminating left sub-interval.`;
            intNext = `Recalculate midpoint for updated interval.`;
            detWhat = `Pointer adjustment: ${varName} = mid + 1 = ${val}.`;
            detWhy = `Discards left half [0..mid], preserving loop invariant arr[i] < target for all i < low.`;
            detNext = `Loop header condition evaluation (low <= high).`;
        }
        else if (varName === "high" || varName === "right") {
            begWhat = `Moved the right boundary 'high' backward to ${val}.`;
            begWhy = `The target is smaller than our middle guess, so the answer cannot be on the right side.`;
            begNext = `Now we only search the left half of the remaining numbers.`;
            intWhat = `Updated upper bound ${varName} = ${val}.`;
            intWhy = `Search target is strictly less than midpoint value, eliminating right sub-interval.`;
            intNext = `Recalculate midpoint for updated interval.`;
            detWhat = `Pointer adjustment: ${varName} = mid - 1 = ${val}.`;
            detWhy = `Discards right half [mid..n-1], preserving loop invariant arr[i] > target for all i > high.`;
            detNext = `Loop header condition evaluation (low <= high).`;
        }
        else {
            begWhat = `Set variable '${varName}' to ${JSON.stringify(val)}.`;
            begWhy = `Storing the result of the calculation so we can use it in following steps.`;
            begNext = `Proceeding with updated '${varName}'.`;
            intWhat = `Variable '${varName}' updated to ${JSON.stringify(val)}.`;
            intWhy = `State transition in local frame.`;
            intNext = `Evaluate next statement in scope.`;
            detWhat = `State mutation: ${varName} = ${JSON.stringify(val)}.`;
            detWhy = `Assignment operation writing to frame local namespace.`;
            detNext = `Next bytecode/AST evaluation.`;
        }
    }
    else if (evType === "function.call") {
        const fnEv = ev;
        begWhat = `Calling function '${fnEv.functionName}()'.`;
        begWhy = `The program enters a specialized block of instructions to solve a sub-task.`;
        begNext = `Starting execution at the first line of '${fnEv.functionName}()'.`;
        intWhat = `Invocation: ${fnEv.functionName}(${Object.entries(fnEv.args || {}).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(", ")}).`;
        intWhy = `Pushes a new call frame onto the call stack.`;
        intNext = `Execute function prologue and initial statements.`;
        detWhat = `Call frame pushed: frameId='${fnEv.frameId}', target='${fnEv.functionName}'.`;
        detWhy = `Stack depth increased to allocate isolated local namespace.`;
        detNext = `Bind arguments to parameter names and execute first opcode.`;
    }
    else if (evType === "function.return") {
        const fnEv = ev;
        begWhat = `Function '${fnEv.functionName}()' finished and returned ${JSON.stringify(fnEv.returnValue)}.`;
        begWhy = `The task is complete, so it sends the answer back to where it was called.`;
        begNext = `Returning control to the caller.`;
        intWhat = `Function ${fnEv.functionName}() returns ${JSON.stringify(fnEv.returnValue)}.`;
        intWhy = `Pops current call frame and returns value to caller's execution context.`;
        intNext = `Caller receives return value.`;
        detWhat = `Frame popped: frameId='${fnEv.frameId}', return=${JSON.stringify(fnEv.returnValue)}.`;
        detWhy = `Stack unwind and frame deallocation.`;
        detNext = `Resume execution at instruction following callsite.`;
    }
    return {
        beginner: { what: begWhat, why: begWhy, changed: changedText, next: begNext },
        intermediate: { what: intWhat, why: intWhy, changed: changedText, next: intNext },
        detailed: { what: detWhat, why: detWhy, changed: changedText, next: detNext },
    };
}
