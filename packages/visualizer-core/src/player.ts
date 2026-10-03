import { DVIRExecutionTrace, DryRunTable, Diagnostic, ComplexityAnalysis } from "@algoviz/dvir";
import { precomputeAllSnapshots, ReplayStateSnapshot } from "./visualizers/array.js";
import { generateDryRunTable } from "./dryRunGenerator.js";

export type TracePlayerListener = (snapshot: ReplayStateSnapshot) => void;

export class TracePlayer {
  private trace: DVIRExecutionTrace | null = null;
  private currentStep: number = 0;
  private isPlaying: boolean = false;
  private speed: number = 1; // Multipliers: 0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x, 4x
  private timerId: any = null;
  private listeners: Set<TracePlayerListener> = new Set();
  private snapshots: ReplayStateSnapshot[] = [];
  private dryRunTable: DryRunTable | null = null;

  public loadTrace(trace: DVIRExecutionTrace) {
    this.pause();
    this.trace = trace;
    this.currentStep = 0;
    this.snapshots = precomputeAllSnapshots(trace);
    this.dryRunTable = trace.dryRunTable || generateDryRunTable(trace);
    this.notify();
  }

  public subscribe(listener: TracePlayerListener): () => void {
    this.listeners.add(listener);
    if (this.trace) {
      listener(this.getSnapshot());
    }
    return () => this.listeners.delete(listener);
  }

  public getSnapshot(): ReplayStateSnapshot {
    if (!this.snapshots.length) {
      return {
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
        explanation: {
          beginner: { what: "Ready.", why: "Ready.", changed: "None.", next: "Press Run or Play." },
          intermediate: { what: "Ready.", why: "Ready.", changed: "None.", next: "Press Run or Play." },
          detailed: { what: "Ready.", why: "Ready.", changed: "None.", next: "Press Run or Play." },
        },
        actionDescription: "Ready to start.",
      };
    }
    const safeIdx = Math.max(0, Math.min(this.currentStep, this.snapshots.length - 1));
    return this.snapshots[safeIdx];
  }

  public getTrace(): DVIRExecutionTrace | null {
    return this.trace;
  }

  public getDryRunTable(): DryRunTable {
    if (this.dryRunTable) return this.dryRunTable;
    if (this.trace) {
      this.dryRunTable = generateDryRunTable(this.trace);
      return this.dryRunTable;
    }
    return { columns: [], rows: [] };
  }

  public getDiagnostics(): Diagnostic[] {
    return this.trace?.diagnostics || [];
  }

  public getComplexity(): ComplexityAnalysis | null {
    return this.trace?.complexity || null;
  }

  public play() {
    if (this.isPlaying || !this.trace || this.snapshots.length === 0) return;
    this.isPlaying = true;
    this.scheduleNext();
  }

  private scheduleNext() {
    if (!this.isPlaying || !this.trace) return;
    if (this.currentStep >= this.snapshots.length - 1) {
      this.pause();
      return;
    }

    const currentSnapshot = this.snapshots[this.currentStep];
    const ev = currentSnapshot?.currentEvent;

    let baseDelayMs = 200;
    if (ev) {
      if (ev.type === "array.swap") {
        baseDelayMs = 420;
      } else if (ev.type === "array.access" || ev.type === "array.update") {
        baseDelayMs = 260;
      } else if (ev.type === "line.execute") {
        baseDelayMs = 180;
      } else if (ev.type === "variable.update" || ev.type === "variable.create") {
        baseDelayMs = 150;
      } else if (ev.type === "function.call" || ev.type === "function.return") {
        baseDelayMs = 250;
      }
    }

    const delayMs = Math.max(40, Math.round(baseDelayMs / this.speed));

    this.timerId = setTimeout(() => {
      if (!this.isPlaying || !this.trace) return;
      if (this.currentStep < this.snapshots.length - 1) {
        this.currentStep++;
        this.notify();
        this.scheduleNext();
      } else {
        this.pause();
      }
    }, delayMs);
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public next() {
    if (!this.trace || this.snapshots.length === 0) return;
    if (this.currentStep < this.snapshots.length - 1) {
      this.currentStep++;
      this.notify();
    }
  }

  public previous() {
    if (!this.trace || this.snapshots.length === 0) return;
    if (this.currentStep > 0) {
      this.currentStep--;
      this.notify();
    }
  }

  public first() {
    if (!this.trace || this.snapshots.length === 0) return;
    this.currentStep = 0;
    this.notify();
  }

  public last() {
    if (!this.trace || this.snapshots.length === 0) return;
    this.currentStep = this.snapshots.length - 1;
    this.notify();
  }

  public seek(stepIndex: number) {
    if (!this.trace || this.snapshots.length === 0) return;
    this.currentStep = Math.max(0, Math.min(stepIndex, this.snapshots.length - 1));
    this.notify();
  }

  public setSpeed(speed: number) {
    this.speed = speed;
    if (this.isPlaying) {
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.scheduleNext();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }

  public getTotalSteps(): number {
    return this.snapshots.length;
  }

  private notify() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
