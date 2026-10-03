import { DVIRExecutionTrace, DVIREvent, SourceLocation } from "@algoviz/dvir";
import { MultiLevelExplanation } from "../explanationEngine.js";
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
    callStack: Array<{
        name: string;
        frameId: string;
        args: Record<string, any>;
        returnValue?: any;
    }>;
    arrays: Record<string, ArrayVisualizationState>;
    stdout: string[];
    explanation: MultiLevelExplanation;
    actionDescription: string;
}
export declare function precomputeAllSnapshots(trace: DVIRExecutionTrace): ReplayStateSnapshot[];
export declare function computeStateAtStep(trace: DVIRExecutionTrace, targetStep: number): ReplayStateSnapshot;
