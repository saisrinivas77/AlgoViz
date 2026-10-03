"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracePlayer = void 0;
const array_js_1 = require("./visualizers/array.js");
const dryRunGenerator_js_1 = require("./dryRunGenerator.js");
class TracePlayer {
    trace = null;
    currentStep = 0;
    isPlaying = false;
    speed = 1; // Multipliers: 0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x, 4x
    timerId = null;
    listeners = new Set();
    snapshots = [];
    dryRunTable = null;
    loadTrace(trace) {
        this.pause();
        this.trace = trace;
        this.currentStep = 0;
        this.snapshots = (0, array_js_1.precomputeAllSnapshots)(trace);
        this.dryRunTable = trace.dryRunTable || (0, dryRunGenerator_js_1.generateDryRunTable)(trace);
        this.notify();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        if (this.trace) {
            listener(this.getSnapshot());
        }
        return () => this.listeners.delete(listener);
    }
    getSnapshot() {
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
    getTrace() {
        return this.trace;
    }
    getDryRunTable() {
        if (this.dryRunTable)
            return this.dryRunTable;
        if (this.trace) {
            this.dryRunTable = (0, dryRunGenerator_js_1.generateDryRunTable)(this.trace);
            return this.dryRunTable;
        }
        return { columns: [], rows: [] };
    }
    getDiagnostics() {
        return this.trace?.diagnostics || [];
    }
    getComplexity() {
        return this.trace?.complexity || null;
    }
    play() {
        if (this.isPlaying || !this.trace || this.snapshots.length === 0)
            return;
        this.isPlaying = true;
        this.scheduleNext();
    }
    scheduleNext() {
        if (!this.isPlaying || !this.trace)
            return;
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
            }
            else if (ev.type === "array.access" || ev.type === "array.update") {
                baseDelayMs = 260;
            }
            else if (ev.type === "line.execute") {
                baseDelayMs = 180;
            }
            else if (ev.type === "variable.update" || ev.type === "variable.create") {
                baseDelayMs = 150;
            }
            else if (ev.type === "function.call" || ev.type === "function.return") {
                baseDelayMs = 250;
            }
        }
        const delayMs = Math.max(40, Math.round(baseDelayMs / this.speed));
        this.timerId = setTimeout(() => {
            if (!this.isPlaying || !this.trace)
                return;
            if (this.currentStep < this.snapshots.length - 1) {
                this.currentStep++;
                this.notify();
                this.scheduleNext();
            }
            else {
                this.pause();
            }
        }, delayMs);
    }
    pause() {
        this.isPlaying = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }
    next() {
        if (!this.trace || this.snapshots.length === 0)
            return;
        if (this.currentStep < this.snapshots.length - 1) {
            this.currentStep++;
            this.notify();
        }
    }
    previous() {
        if (!this.trace || this.snapshots.length === 0)
            return;
        if (this.currentStep > 0) {
            this.currentStep--;
            this.notify();
        }
    }
    first() {
        if (!this.trace || this.snapshots.length === 0)
            return;
        this.currentStep = 0;
        this.notify();
    }
    last() {
        if (!this.trace || this.snapshots.length === 0)
            return;
        this.currentStep = this.snapshots.length - 1;
        this.notify();
    }
    seek(stepIndex) {
        if (!this.trace || this.snapshots.length === 0)
            return;
        this.currentStep = Math.max(0, Math.min(stepIndex, this.snapshots.length - 1));
        this.notify();
    }
    setSpeed(speed) {
        this.speed = speed;
        if (this.isPlaying) {
            if (this.timerId) {
                clearTimeout(this.timerId);
                this.timerId = null;
            }
            this.scheduleNext();
        }
    }
    getIsPlaying() {
        return this.isPlaying;
    }
    getSpeed() {
        return this.speed;
    }
    getCurrentStep() {
        return this.currentStep;
    }
    getTotalSteps() {
        return this.snapshots.length;
    }
    notify() {
        const snapshot = this.getSnapshot();
        for (const listener of this.listeners) {
            listener(snapshot);
        }
    }
}
exports.TracePlayer = TracePlayer;
