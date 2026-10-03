import { DVIRExecutionTrace, DVIREvent, SourceLocation } from "@algoviz/dvir";
import { generateStepExplanation, MultiLevelExplanation } from "../explanationEngine.js";

export interface ArrayElementState {
  id?: string;
  value: any;
  status: "default" | "active" | "comparing" | "swapping" | "sorted";
}

export interface ArrayVisualizationState {
  targetName: string;
  elements: ArrayElementState[];
  activeIndices: number[];
  swapIndices: [number, number] | null;
  comparingIndices: [number, number] | null;
  pointerLabels: Record<number, string>;
}

export interface VariableHistoryEntry {
  stepIndex: number;
  value: any;
  line: number;
}

export interface ReplayStateSnapshot {
  stepIndex: number;
  totalSteps: number;
  currentEvent: DVIREvent | null;
  highlightedLine: SourceLocation | null;
  stackDepth: number;
  variables: Record<string, any>;
  previousVariables: Record<string, any>;
  changedVariables: string[];
  variableTypes: Record<string, string>;
  variableHistory: Record<string, VariableHistoryEntry[]>;
  callStack: Array<{ name: string; frameId: string; args: Record<string, any>; returnValue?: any }>;
  arrays: Record<string, ArrayVisualizationState>;
  stdout: string[];
  explanation: MultiLevelExplanation;
  actionDescription: string;
}

interface InternalArrayItem {
  id: string;
  value: any;
}

interface InternalArrayState {
  items: InternalArrayItem[];
  activeIndices: number[];
  swapIndices: [number, number] | null;
  comparingIndices: [number, number] | null;
}

const POINTER_NAME_REGEX = /^(i|j|k|l|r|p|ptr|idx|index|low|high|left|right|mid|start|end|curr|next|slow|fast|front|rear|top)$/i;

function isPointerVariable(name: string): boolean {
  return POINTER_NAME_REGEX.test(name) || name.endsWith("_idx") || name.endsWith("_ptr") || name.endsWith("Index");
}

function buildSnapshot(
  stepIndex: number,
  totalSteps: number,
  currentEvent: DVIREvent | null,
  highlightedLine: SourceLocation | null,
  stackDepth: number,
  variables: Record<string, any>,
  previousVariables: Record<string, any>,
  changedVariables: string[],
  variableTypes: Record<string, string>,
  variableHistory: Record<string, VariableHistoryEntry[]>,
  callStack: Array<{ name: string; frameId: string; args: Record<string, any>; returnValue?: any }>,
  arrayMap: Record<string, InternalArrayState>,
  stdout: string[],
  explanation: MultiLevelExplanation,
  actionDescription: string
): ReplayStateSnapshot {

  // Derive pointer labels and actively pointed indices for loop tracking
  const pointerMap: Record<string, Record<number, string>> = {};
  const activePointerIndices: Record<string, number[]> = {};

  for (const [varName, varVal] of Object.entries(variables)) {
    if (isPointerVariable(varName) && typeof varVal === "number" && varVal >= 0 && varVal < 100) {
      for (const arrName in arrayMap) {
        if (varVal < arrayMap[arrName].items.length) {
          if (!pointerMap[arrName]) pointerMap[arrName] = {};
          const existing = pointerMap[arrName][varVal];
          pointerMap[arrName][varVal] = existing ? `${existing}, ${varName}` : varName;

          if (!activePointerIndices[arrName]) activePointerIndices[arrName] = [];
          if (!activePointerIndices[arrName].includes(varVal)) {
            activePointerIndices[arrName].push(varVal);
          }
        }
      }
    }
  }

  const arrays: Record<string, ArrayVisualizationState> = {};
  for (const arrName in arrayMap) {
    const raw = arrayMap[arrName];
    const pointersAtArr = activePointerIndices[arrName] || [];

    const elements: ArrayElementState[] = raw.items.map((item, idx) => {
      let status: ArrayElementState["status"] = "default";
      if (raw.swapIndices && (raw.swapIndices[0] === idx || raw.swapIndices[1] === idx)) {
        status = "swapping";
      } else if (raw.comparingIndices && (raw.comparingIndices[0] === idx || raw.comparingIndices[1] === idx)) {
        status = "comparing";
      } else if (raw.activeIndices.includes(idx) || pointersAtArr.includes(idx)) {
        status = "active";
      }
      return { id: item.id, value: item.value, status };
    });

    arrays[arrName] = {
      targetName: arrName,
      elements,
      activeIndices: [...raw.activeIndices],
      swapIndices: raw.swapIndices ? [raw.swapIndices[0], raw.swapIndices[1]] : null,
      comparingIndices: raw.comparingIndices ? [raw.comparingIndices[0], raw.comparingIndices[1]] : null,
      pointerLabels: pointerMap[arrName] || {},
    };
  }

  // Clone variable history safely
  const clonedHistory: Record<string, VariableHistoryEntry[]> = {};
  for (const [k, v] of Object.entries(variableHistory)) {
    clonedHistory[k] = [...v];
  }

  return {
    stepIndex,
    totalSteps,
    currentEvent,
    highlightedLine,
    stackDepth,
    variables: { ...variables },
    previousVariables: { ...previousVariables },
    changedVariables: [...changedVariables],
    variableTypes: { ...variableTypes },
    variableHistory: clonedHistory,
    callStack: callStack.map((f) => ({ ...f, args: { ...f.args } })),
    arrays,
    stdout: [...stdout],
    explanation,
    actionDescription,
  };
}

export function precomputeAllSnapshots(trace: DVIRExecutionTrace): ReplayStateSnapshot[] {
  const events = trace.events || [];
  const sourceCodeLines = (trace.code || "").split("\n");

  const defaultExplanation: MultiLevelExplanation = {
    beginner: { what: "Ready to visualize.", why: "Program initialization.", changed: "None.", next: "First statement." },
    intermediate: { what: "Entry point.", why: "Runtime environment bootstrap.", changed: "None.", next: "Step forward." },
    detailed: { what: "Module load.", why: "Environment globals initialized.", changed: "None.", next: "Execute first AST node." },
  };

  if (events.length === 0) {
    return [
      {
        stepIndex: 0,
        totalSteps: 0,
        currentEvent: null,
        highlightedLine: null,
        stackDepth: 0,
        variables: {},
        previousVariables: {},
        changedVariables: [],
        variableTypes: {},
        variableHistory: {},
        callStack: [],
        arrays: {},
        stdout: [],
        explanation: defaultExplanation,
        actionDescription: "Ready to start.",
      },
    ];
  }

  const snapshots: ReplayStateSnapshot[] = [];
  let highlightedLine: SourceLocation | null = null;
  let stackDepth = 0;
  const variables: Record<string, any> = {};
  let previousVariables: Record<string, any> = {};
  const variableTypes: Record<string, string> = {};
  const variableHistory: Record<string, VariableHistoryEntry[]> = {};
  const callStack: Array<{ name: string; frameId: string; args: Record<string, any>; returnValue?: any }> = [];
  const arrayMap: Record<string, InternalArrayState> = {};
  const stdout: string[] = trace.stdout || [];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (!ev) continue;

    if (ev.source && ev.source.line) {
      highlightedLine = ev.source;
    }
    if (typeof ev.stackDepth === "number") {
      stackDepth = ev.stackDepth;
    }

    const changedVariables: string[] = [];
    let actionDescription = "Execute step";

    switch (ev.type) {
      case "line.execute":
        for (const name in arrayMap) {
          arrayMap[name].activeIndices = [];
          arrayMap[name].swapIndices = null;
          arrayMap[name].comparingIndices = null;
        }
        actionDescription = `Execute line ${highlightedLine?.line || 1}`;
        break;

      case "variable.create":
        previousVariables = { ...variables };
        variables[ev.name] = ev.value;
        variableTypes[ev.name] = (ev as any).variableType || typeof ev.value;
        changedVariables.push(ev.name);

        if (!variableHistory[ev.name]) variableHistory[ev.name] = [];
        variableHistory[ev.name].push({
          stepIndex: i,
          value: ev.value,
          line: highlightedLine?.line || 1,
        });

        actionDescription = `Initialize ${ev.name} = ${JSON.stringify(ev.value)}`;

        if (Array.isArray(ev.value)) {
          arrayMap[ev.name] = {
            items: ev.value.map((v, idx) => ({ id: `${ev.name}_${idx}`, value: v })),
            activeIndices: [],
            swapIndices: null,
            comparingIndices: null,
          };
        }
        break;

      case "variable.update":
        previousVariables = { ...variables };
        variables[ev.name] = ev.value;
        variableTypes[ev.name] = (ev as any).variableType || typeof ev.value;
        changedVariables.push(ev.name);

        if (!variableHistory[ev.name]) variableHistory[ev.name] = [];
        variableHistory[ev.name].push({
          stepIndex: i,
          value: ev.value,
          line: highlightedLine?.line || 1,
        });

        actionDescription = `Update ${ev.name}: ${JSON.stringify(previousVariables[ev.name])} → ${JSON.stringify(ev.value)}`;

        if (Array.isArray(ev.value)) {
          if (!arrayMap[ev.name]) {
            arrayMap[ev.name] = {
              items: ev.value.map((v, idx) => ({ id: `${ev.name}_${idx}`, value: v })),
              activeIndices: [],
              swapIndices: null,
              comparingIndices: null,
            };
          } else {
            const currentItems = arrayMap[ev.name].items;
            if (currentItems.length === ev.value.length) {
              for (let idx = 0; idx < ev.value.length; idx++) {
                currentItems[idx].value = ev.value[idx];
              }
            } else {
              arrayMap[ev.name].items = ev.value.map((v, idx) => ({ id: `${ev.name}_${idx}`, value: v }));
            }
          }
        }
        break;

      case "array.access":
        if (arrayMap[ev.target]) {
          arrayMap[ev.target].activeIndices = [ev.index];
          if (ev.accessType === "compare") {
            const current = arrayMap[ev.target].comparingIndices;
            if (current && current[0] !== ev.index) {
              arrayMap[ev.target].comparingIndices = [current[0], ev.index];
            } else {
              arrayMap[ev.target].comparingIndices = [ev.index, ev.index];
            }
            actionDescription = `Compare at ${ev.target}[${ev.index}]`;
          } else {
            actionDescription = `Read ${ev.target}[${ev.index}]`;
          }
        }
        break;

      case "array.update":
        if (arrayMap[ev.target]) {
          if (arrayMap[ev.target].items[ev.index]) {
            arrayMap[ev.target].items[ev.index].value = ev.value;
          }
          arrayMap[ev.target].activeIndices = [ev.index];
          actionDescription = `Write ${ev.target}[${ev.index}] = ${JSON.stringify(ev.value)}`;
        }
        break;

      case "array.swap":
        if (arrayMap[ev.target]) {
          const items = arrayMap[ev.target].items;
          if (items[ev.indexA] && items[ev.indexB]) {
            const temp = items[ev.indexA];
            items[ev.indexA] = items[ev.indexB];
            items[ev.indexB] = temp;
            if (ev.valueA !== null && ev.valueA !== undefined) items[ev.indexA].value = ev.valueA;
            if (ev.valueB !== null && ev.valueB !== undefined) items[ev.indexB].value = ev.valueB;
          }
          arrayMap[ev.target].swapIndices = [ev.indexA, ev.indexB];
          arrayMap[ev.target].activeIndices = [ev.indexA, ev.indexB];
          actionDescription = `Swap ${ev.target}[${ev.indexA}] ↔ ${ev.target}[${ev.indexB}]`;
        }
        break;

      case "function.call":
        callStack.push({
          name: ev.functionName,
          frameId: ev.frameId,
          args: ev.args,
        });
        actionDescription = `Call ${ev.functionName}()`;
        break;

      case "function.return":
        if (callStack.length > 0) {
          const popped = callStack.pop();
          if (popped) popped.returnValue = ev.returnValue;
        }
        actionDescription = `Return ${JSON.stringify(ev.returnValue)} from ${ev.functionName}()`;
        break;
    }

    const nextEv = i + 1 < events.length ? events[i + 1] : null;
    const explanation = generateStepExplanation(
      ev,
      nextEv,
      variables,
      previousVariables,
      changedVariables,
      highlightedLine?.line || null,
      sourceCodeLines
    );

    snapshots.push(
      buildSnapshot(
        i,
        events.length,
        ev,
        highlightedLine,
        stackDepth,
        variables,
        previousVariables,
        changedVariables,
        variableTypes,
        variableHistory,
        callStack,
        arrayMap,
        stdout,
        explanation,
        actionDescription
      )
    );
  }

  return snapshots;
}

const traceSnapshotCache = new WeakMap<DVIRExecutionTrace, ReplayStateSnapshot[]>();

export function computeStateAtStep(trace: DVIRExecutionTrace, targetStep: number): ReplayStateSnapshot {
  let snapshots = traceSnapshotCache.get(trace);
  if (!snapshots) {
    snapshots = precomputeAllSnapshots(trace);
    traceSnapshotCache.set(trace, snapshots);
  }
  const safeStep = Math.max(0, Math.min(targetStep, snapshots.length - 1));
  return snapshots[safeStep];
}
