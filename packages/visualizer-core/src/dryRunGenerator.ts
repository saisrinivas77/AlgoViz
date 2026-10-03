import { DVIRExecutionTrace, DryRunTable, DryRunColumn, DryRunRow, DVIREvent } from "@algoviz/dvir";

export function generateDryRunTable(trace: DVIRExecutionTrace): DryRunTable {
  const events = trace.events || [];
  if (events.length === 0) {
    return { columns: [], rows: [] };
  }

  // 1. Detect active variables across the trace
  const varChangeCounts: Record<string, number> = {};
  const allVarNames: Set<string> = new Set();

  for (const ev of events) {
    if (ev.type === "variable.create" || ev.type === "variable.update") {
      const name = (ev as any).name;
      if (name && !name.startsWith("_")) {
        allVarNames.add(name);
        varChangeCounts[name] = (varChangeCounts[name] || 0) + 1;
      }
    }
  }

  // 2. Identify algorithm archetype
  const varList = Array.from(allVarNames);
  const isBinarySearch =
    (varList.includes("low") || varList.includes("left")) &&
    (varList.includes("high") || varList.includes("right")) &&
    varList.includes("mid");

  const isBubbleOrSort =
    varList.includes("i") &&
    varList.includes("j") &&
    events.some((e) => e.type === "array.swap");

  const isTwoPointer =
    (varList.includes("left") || varList.includes("low")) &&
    (varList.includes("right") || varList.includes("high")) &&
    !varList.includes("mid") &&
    (varList.includes("target") || varList.includes("curr_sum") || varList.includes("sum"));

  // 3. Define adaptive columns
  const columns: DryRunColumn[] = [
    { id: "step", label: "Step", type: "number", importance: "primary" },
    { id: "line", label: "Line", type: "number", importance: "primary" },
  ];

  if (isBinarySearch) {
    const lowKey = varList.includes("low") ? "low" : "left";
    const highKey = varList.includes("high") ? "high" : "right";
    columns.push(
      { id: lowKey, label: lowKey, type: "number", importance: "primary" },
      { id: highKey, label: highKey, type: "number", importance: "primary" },
      { id: "mid", label: "mid", type: "number", importance: "primary" },
      { id: "arr_mid", label: "arr[mid]", type: "number", importance: "primary" },
      { id: "target", label: "target", type: "number", importance: "primary" },
      { id: "comparison", label: "Comparison", type: "string", importance: "secondary" },
      { id: "action", label: "Action", type: "action", importance: "primary" }
    );
  } else if (isBubbleOrSort) {
    columns.push(
      { id: "i", label: "i", type: "number", importance: "primary" },
      { id: "j", label: "j", type: "number", importance: "primary" },
      { id: "curr", label: "arr[j]", type: "number", importance: "primary" },
      { id: "next", label: "arr[j+1]", type: "number", importance: "primary" },
      { id: "comparison", label: "Compare", type: "string", importance: "secondary" },
      { id: "action", label: "Action", type: "action", importance: "primary" },
      { id: "array", label: "Array", type: "array", importance: "secondary" }
    );
  } else if (isTwoPointer) {
    const leftKey = varList.includes("left") ? "left" : "low";
    const rightKey = varList.includes("right") ? "right" : "high";
    columns.push(
      { id: leftKey, label: leftKey, type: "number", importance: "primary" },
      { id: rightKey, label: rightKey, type: "number", importance: "primary" }
    );
    if (varList.includes("curr_sum")) columns.push({ id: "curr_sum", label: "Sum", type: "number", importance: "primary" });
    else if (varList.includes("sum")) columns.push({ id: "sum", label: "Sum", type: "number", importance: "primary" });
    if (varList.includes("target")) columns.push({ id: "target", label: "Target", type: "number", importance: "primary" });
    columns.push({ id: "action", label: "Action", type: "action", importance: "primary" });
  } else {
    // General algorithm: select top 4 most frequently changed variables
    const sortedVars = Object.entries(varChangeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k)
      .filter((k) => !Array.isArray((trace as any).variables?.[k]))
      .slice(0, 4);

    for (const v of sortedVars) {
      columns.push({ id: v, label: v, type: "number", importance: "primary" });
    }
    columns.push({ id: "action", label: "Action", type: "action", importance: "primary" });
  }

  // 4. Transform execution steps into dry run rows
  const rows: DryRunRow[] = [];
  const currentVariables: Record<string, any> = {};
  let currentLine = 1;
  let currentArray: any[] = [];
  let prevComparison = "-";

  for (let idx = 0; idx < events.length; idx++) {
    const ev = events[idx];
    if (!ev) continue;

    if (ev.source?.line) {
      currentLine = ev.source.line;
    }

    const changedKeys: string[] = [];
    let action = "Execute line";
    let description = "";

    switch (ev.type) {
      case "line.execute":
        // Only include line executes that are meaningful (skip if previous event was line.execute)
        if (idx > 0 && events[idx - 1].type === "line.execute") continue;
        action = `Line ${currentLine}`;
        description = `Evaluating line ${currentLine}`;
        break;

      case "variable.create":
      case "variable.update": {
        const vEv = ev as any;
        currentVariables[vEv.name] = vEv.value;
        changedKeys.push(vEv.name);

        if (Array.isArray(vEv.value)) {
          currentArray = [...vEv.value];
        }

        if (vEv.name === "mid") {
          action = `Calculate mid = ${vEv.value}`;
          description = `Calculated midpoint index: ${vEv.value}`;
        } else if (vEv.name === "low" || vEv.name === "left") {
          action = `Move ${vEv.name} → ${vEv.value}`;
          description = `Narrowed lower bound to ${vEv.value}`;
        } else if (vEv.name === "high" || vEv.name === "right") {
          action = `Move ${vEv.name} → ${vEv.value}`;
          description = `Narrowed upper bound to ${vEv.value}`;
        } else {
          action = `Set ${vEv.name} = ${JSON.stringify(vEv.value)}`;
          description = `Updated ${vEv.name}`;
        }
        break;
      }

      case "array.access": {
        const aEv = ev as any;
        const targetArr = currentVariables[aEv.target] || currentArray;
        const val = targetArr ? targetArr[aEv.index] : undefined;

        if (aEv.accessType === "compare") {
          if (isBinarySearch && currentVariables["target"] !== undefined) {
            const tgt = currentVariables["target"];
            const midVal = val;
            const op = midVal === tgt ? "==" : midVal < tgt ? "<" : ">";
            prevComparison = `${midVal} ${op} ${tgt}`;
            action = `Compare arr[${aEv.index}] (${midVal}) ${op} target (${tgt})`;
            description = `Comparing middle value ${midVal} with target ${tgt}`;
          } else {
            action = `Compare at [${aEv.index}]`;
            description = `Comparing element at index ${aEv.index} (${val})`;
          }
        } else {
          action = `Access ${aEv.target}[${aEv.index}]`;
          description = `Read value ${val} from index ${aEv.index}`;
        }
        break;
      }

      case "array.swap": {
        const sEv = ev as any;
        action = `Swap [${sEv.indexA}] ↔ [${sEv.indexB}]`;
        description = `Swapped elements at indices ${sEv.indexA} and ${sEv.indexB}`;
        changedKeys.push(sEv.target);

        // Update internal array
        if (currentArray && currentArray.length > Math.max(sEv.indexA, sEv.indexB)) {
          const temp = currentArray[sEv.indexA];
          currentArray[sEv.indexA] = currentArray[sEv.indexB];
          currentArray[sEv.indexB] = temp;
        }
        break;
      }

      case "function.call": {
        const fEv = ev as any;
        action = `Call ${fEv.functionName}()`;
        description = `Entered function ${fEv.functionName}`;
        break;
      }

      case "function.return": {
        const rEv = ev as any;
        action = `Return ${JSON.stringify(rEv.returnValue)}`;
        description = `${rEv.functionName} returned ${JSON.stringify(rEv.returnValue)}`;
        break;
      }

      case "program.error": {
        action = `Error: ${(ev as any).code}`;
        description = (ev as any).message;
        break;
      }

      default:
        continue;
    }

    // Build row values according to columns
    const rowValues: Record<string, any> = {
      step: idx + 1,
      line: currentLine,
      action,
    };

    if (isBinarySearch) {
      const lowKey = varList.includes("low") ? "low" : "left";
      const highKey = varList.includes("high") ? "high" : "right";
      rowValues[lowKey] = currentVariables[lowKey] ?? "-";
      rowValues[highKey] = currentVariables[highKey] ?? "-";
      rowValues["mid"] = currentVariables["mid"] ?? "-";
      const midIdx = currentVariables["mid"];
      const arr = currentVariables["nums"] || currentVariables["arr"] || currentArray;
      rowValues["arr_mid"] = midIdx !== undefined && arr && arr[midIdx] !== undefined ? arr[midIdx] : "-";
      rowValues["target"] = currentVariables["target"] ?? "-";
      rowValues["comparison"] = prevComparison;
    } else if (isBubbleOrSort) {
      rowValues["i"] = currentVariables["i"] ?? "-";
      rowValues["j"] = currentVariables["j"] ?? "-";
      const jIdx = currentVariables["j"];
      const arr = currentVariables["nums"] || currentArray;
      if (typeof jIdx === "number" && arr && arr.length > jIdx + 1) {
        rowValues["curr"] = arr[jIdx];
        rowValues["next"] = arr[jIdx + 1];
        rowValues["comparison"] = `${arr[jIdx]} ${arr[jIdx] > arr[jIdx + 1] ? ">" : "<="} ${arr[jIdx + 1]}`;
      } else {
        rowValues["curr"] = "-";
        rowValues["next"] = "-";
        rowValues["comparison"] = "-";
      }
      rowValues["array"] = arr ? [...arr] : [];
    } else if (isTwoPointer) {
      const leftKey = varList.includes("left") ? "left" : "low";
      const rightKey = varList.includes("right") ? "right" : "high";
      rowValues[leftKey] = currentVariables[leftKey] ?? "-";
      rowValues[rightKey] = currentVariables[rightKey] ?? "-";
      if (currentVariables["curr_sum"] !== undefined) rowValues["curr_sum"] = currentVariables["curr_sum"];
      else if (currentVariables["sum"] !== undefined) rowValues["sum"] = currentVariables["sum"];
      if (currentVariables["target"] !== undefined) rowValues["target"] = currentVariables["target"];
    } else {
      for (const col of columns) {
        if (col.id !== "step" && col.id !== "line" && col.id !== "action") {
          rowValues[col.id] = currentVariables[col.id] ?? "-";
        }
      }
    }

    // Only add row if an action or state change took place
    if (ev.type !== "line.execute" || idx === 0 || idx === events.length - 1) {
      rows.push({
        stepId: ev.id,
        stepIndex: idx,
        line: currentLine,
        values: rowValues,
        changedKeys,
        action,
        description,
      });
    }
  }

  return { columns, rows };
}
