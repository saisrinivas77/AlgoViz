/**
 * Data Visualization Intermediate Representation (DVIR) v1 Specification
 * Complete TypeScript definitions for language-independent trace payloads.
 */

export interface SourceLocation {
  file?: string;
  line: number;
  columnStart?: number;
  columnEnd?: number;
}

export type DVIREventType =
  | "program.start"
  | "program.end"
  | "program.error"
  | "line.execute"
  | "expression.evaluate"
  | "variable.create"
  | "variable.update"
  | "variable.delete"
  | "function.call"
  | "function.return"
  | "array.create"
  | "array.access"
  | "array.update"
  | "array.swap"
  | "array.push"
  | "array.pop"
  | "matrix.create"
  | "matrix.access"
  | "matrix.update"
  | "node.create"
  | "node.delete"
  | "pointer.update"
  | "edge.create"
  | "edge.delete"
  | "stack.push"
  | "stack.pop"
  | "queue.enqueue"
  | "queue.dequeue"
  | "tree.node.visit"
  | "heap.swap"
  | "hashmap.set"
  | "graph.node.visit"
  | "graph.edge.visit";

export interface BaseDVIREvent {
  id: number;
  type: DVIREventType;
  source?: SourceLocation;
  stackDepth?: number;
}

export interface ProgramStartEvent extends BaseDVIREvent {
  type: "program.start";
  language: string;
}

export interface ProgramEndEvent extends BaseDVIREvent {
  type: "program.end";
  durationMs: number;
}

export interface ProgramErrorEvent extends BaseDVIREvent {
  type: "program.error";
  code: string;
  message: string;
  line?: number;
}

export interface LineExecuteEvent extends BaseDVIREvent {
  type: "line.execute";
  source: SourceLocation;
  stackDepth: number;
  stdout?: string;
}

export interface VariableCreateEvent extends BaseDVIREvent {
  type: "variable.create";
  name: string;
  value: any;
  variableType: string;
}

export interface VariableUpdateEvent extends BaseDVIREvent {
  type: "variable.update";
  name: string;
  value: any;
  previousValue?: any;
  variableType: string;
}

export interface VariableDeleteEvent extends BaseDVIREvent {
  type: "variable.delete";
  name: string;
}

export interface FunctionCallEvent extends BaseDVIREvent {
  type: "function.call";
  functionName: string;
  args: Record<string, any>;
  frameId: string;
  parentFrameId?: string;
}

export interface FunctionReturnEvent extends BaseDVIREvent {
  type: "function.return";
  functionName: string;
  returnValue: any;
  frameId: string;
}

export interface ArrayCreateEvent extends BaseDVIREvent {
  type: "array.create";
  target: string;
  elements: any[];
}

export interface ArrayAccessEvent extends BaseDVIREvent {
  type: "array.access";
  target: string;
  index: number;
  accessType: "read" | "compare";
}

export interface ArrayUpdateEvent extends BaseDVIREvent {
  type: "array.update";
  target: string;
  index: number;
  value: any;
  previousValue?: any;
}

export interface ArraySwapEvent extends BaseDVIREvent {
  type: "array.swap";
  target: string;
  indexA: number;
  indexB: number;
  valueA: any;
  valueB: any;
}

export interface ArrayPushEvent extends BaseDVIREvent {
  type: "array.push";
  target: string;
  value: any;
}

export interface ArrayPopEvent extends BaseDVIREvent {
  type: "array.pop";
  target: string;
  value: any;
}

export interface ComparisonEvent extends BaseDVIREvent {
  type: "expression.evaluate";
  expression?: string;
  leftValue?: any;
  rightValue?: any;
  operator?: string;
  result?: boolean;
}

export type DVIREvent =
  | ProgramStartEvent
  | ProgramEndEvent
  | ProgramErrorEvent
  | LineExecuteEvent
  | VariableCreateEvent
  | VariableUpdateEvent
  | VariableDeleteEvent
  | FunctionCallEvent
  | FunctionReturnEvent
  | ArrayCreateEvent
  | ArrayAccessEvent
  | ArrayUpdateEvent
  | ArraySwapEvent
  | ArrayPushEvent
  | ArrayPopEvent
  | ComparisonEvent;

export type DiagnosticSeverity = "error" | "warning" | "info";
export type DiagnosticCategory =
  | "LOGICAL_ERROR"
  | "RUNTIME_ERROR"
  | "ALGORITHM_ERROR"
  | "PERFORMANCE_WARNING";

export interface Diagnostic {
  id: string;
  severity: DiagnosticSeverity;
  category: DiagnosticCategory;
  message: string;
  line: number;
  column?: number;
  evidence?: Record<string, any> | string;
  explanation: string;
  suggestedFix?: string;
  confidence: "high" | "medium" | "low";
  stepId?: number;
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  timeExplanation: string;
  spaceExplanation: string;
  confidence: "high" | "medium" | "low";
  evidence: {
    loopCount?: number;
    maxDepth?: number;
    totalOperations?: number;
    reductionRatio?: string;
    observations?: string[];
  };
}

export interface DryRunColumn {
  id: string;
  label: string;
  type: "number" | "string" | "boolean" | "array" | "action";
  importance: "primary" | "secondary";
}

export interface DryRunRow {
  stepId: number;
  stepIndex: number;
  line: number;
  values: Record<string, any>;
  changedKeys: string[];
  action: string;
  description: string;
}

export interface DryRunTable {
  columns: DryRunColumn[];
  rows: DryRunRow[];
}

export interface StepExplanation {
  what: string;
  why: string;
  changed: string;
  next: string;
}

export interface DVIRExecutionTrace {
  version: "1.0";
  executionId: string;
  language: string;
  createdAt: string;
  summary: {
    totalSteps: number;
    durationMs: number;
    maxMemoryBytes: number;
    detectedStructures: string[];
  };
  code: string;
  events: DVIREvent[];
  stdout?: string[];
  diagnostics?: Diagnostic[];
  complexity?: ComplexityAnalysis;
  dryRunTable?: DryRunTable;
}

