"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TracePlayer,
  ReplayStateSnapshot,
  ArrayVisualizationState,
} from "@algoviz/visualizer-core";
import { DVIRExecutionTrace, Diagnostic, ComplexityAnalysis, DryRunTable } from "@algoviz/dvir";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { ArrayVisualizer } from "@/components/visualizer/ArrayVisualizer";
import { VariablesPanel } from "@/components/visualizer/VariablesPanel";
import { CallStackPanel } from "@/components/visualizer/CallStackPanel";
import { OutputPanel } from "@/components/visualizer/OutputPanel";
import { TimelineControls } from "@/components/visualizer/TimelineControls";
import { AIExplainModal } from "@/components/visualizer/AIExplainModal";
import { DryRunTablePanel } from "@/components/visualizer/DryRunTablePanel";
import { BeginnerExplanationPanel } from "@/components/visualizer/BeginnerExplanationPanel";
import { ComplexityPanel } from "@/components/visualizer/ComplexityPanel";
import { DiagnosticsPanel } from "@/components/visualizer/DiagnosticsPanel";
import {
  Play,
  RotateCcw,
  BookOpen,
  ChevronDown,
  AlertCircle,
  ArrowLeft,
  Layers,
  Terminal,
  GitBranch,
  Table,
  HelpCircle,
  Cpu,
  Bug,
  X,
} from "lucide-react";

// ── Design tokens (warm-neutral theme) ─────────────────────────────────────────
const C = {
  bg:        "#141412",
  surface:   "#1E1E1C",
  raised:    "#252522",
  border:    "#2E2E2C",
  borderStr: "#3E3E3A",
  textPri:   "#E8E6E0",
  textSec:   "#9E9E98",
  textMut:   "#5E5E58",
  amber:     "#B45309",
  amberFg:   "#F5E6D0",
  amberBg:   "rgba(180,83,9,0.10)",
  green:     "#2D6A30",
  greenFg:   "#D0F0D0",
  red:       "#B91C1C",
  redFg:     "#FFE4E4",
} as const;

const INITIAL_BUBBLE_SORT = `def bubble_sort(nums):
    n = len(nums)
    for i in range(n):
        for j in range(0, n - i - 1):
            if nums[j] > nums[j + 1]:
                nums[j], nums[j + 1] = nums[j + 1], nums[j]
    return nums

nums = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(nums)
`;

const DEFAULT_EXAMPLES = [
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    category: "Sorting",
    difficulty: "Easy",
    language: "python",
    description: "Iteratively compare adjacent elements and swap them if they are out of order.",
    code: INITIAL_BUBBLE_SORT,
  },
  {
    id: "binary-search",
    title: "Binary Search",
    category: "Searching",
    difficulty: "Easy",
    language: "python",
    description: "Efficient search in a sorted array by halving the search space at each step.",
    code: `def binary_search(arr, target):
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
`,
  },
  {
    id: "buggy-binary-search",
    title: "Buggy Binary Search",
    category: "Debugging",
    difficulty: "Medium",
    language: "python",
    description: "Binary search with a classic boundary bug (low = mid instead of low = mid + 1) causing a stall.",
    code: `def binary_search_buggy(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid  # Boundary bug: should be mid + 1
        else:
            high = mid - 1
    return -1

nums = [1, 3, 5, 7, 9]
result = binary_search_buggy(nums, 6)
`,
  },
  {
    id: "two-sum-sorted",
    title: "Two Sum (Two Pointer)",
    category: "Arrays",
    difficulty: "Easy",
    language: "python",
    description: "Find two numbers in a sorted array that add up to a target sum.",
    code: `def two_sum_sorted(numbers, target):
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
`,
  },
  {
    id: "recursive-factorial",
    title: "Recursive Factorial",
    category: "Recursion",
    difficulty: "Easy",
    language: "python",
    description: "Recursive calculation showing call stack frame pushes, unwind, and return values.",
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
`,
  },
  {
    id: "linked-list-traversal",
    title: "Linked List Traversal",
    category: "Linked Lists",
    difficulty: "Easy",
    language: "python",
    description: "Traverse a singly linked list and compute node values.",
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

head = ListNode(10)
head.next = ListNode(20)
head.next.next = ListNode(30)
head.next.next.next = ListNode(40)

curr = head
values = []
while curr is not None:
    values.append(curr.val)
    curr = curr.next
`,
  },
];

// ── Logo mark ─────────────────────────────────────────────────────────────────
function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M7 4H4v14h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 4h3v14h-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="8" r="1.25" fill="currentColor" />
      <circle cx="11" cy="14" r="1.25" fill="currentColor" />
    </svg>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
type RunStatus = "idle" | "running" | "success" | "error";

function StatusBadge({ status }: { status: RunStatus }) {
  const cfg = {
    idle:    { color: C.textMut,  dot: C.textMut,  label: "Ready" },
    running: { color: C.amberFg, dot: C.amber,    label: "Executing..." },
    success: { color: C.greenFg, dot: C.green,    label: "Trace loaded" },
    error:   { color: C.redFg,   dot: C.red,      label: "Error" },
  }[status];

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px]">
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "running" ? "animate-pulse" : ""}`}
        style={{ background: cfg.dot }}
        aria-hidden="true"
      />
      <span style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

// ── Panel tab button ──────────────────────────────────────────────────────────
type PanelTab =
  | "variables"
  | "dryrun"
  | "explain"
  | "complexity"
  | "diagnostics"
  | "callstack"
  | "output";

function PanelTabBtn({
  id,
  label,
  icon,
  active,
  badge,
  onClick,
}: {
  id: PanelTab;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors border-b-2 focus-visible:outline-none"
      style={{
        borderBottomColor: active ? C.amber : "transparent",
        color: active ? C.amberFg : C.textMut,
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = C.textSec;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = C.textMut;
      }}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold"
          style={{
            background: "rgba(185,28,28,0.25)",
            color: C.redFg,
            border: "1px solid rgba(185,28,28,0.4)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onVisualize }: { onVisualize: () => void }) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center gap-5 rounded-lg"
      style={{
        border: `1px dashed ${C.border}`,
        background: "rgba(20,20,18,0.5)",
      }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ background: C.raised, border: `1px solid ${C.border}` }}
      >
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true" style={{ color: C.textMut }}>
          <path d="M7 4H4v14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 4h3v14h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="8" y="8" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-[13px] font-medium mb-1" style={{ color: C.textSec }}>
          No visualization yet
        </p>
        <p className="text-[11px] max-w-[200px] leading-relaxed" style={{ color: C.textMut }}>
          Write or select an algorithm, then click{" "}
          <span style={{ color: C.amberFg }}>Visualize</span>
        </p>
      </div>

      <button
        onClick={onVisualize}
        className="flex items-center gap-2 text-[12px] font-medium rounded transition-opacity"
        style={{
          padding: "8px 18px",
          background: C.textPri,
          color: C.bg,
          borderRadius: 6,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
      >
        <Play className="w-3 h-3 fill-current" aria-hidden="true" />
        Run Visualization
      </button>
    </div>
  );
}

// ── Main playground ───────────────────────────────────────────────────────────
export default function PlaygroundPage() {
  const [code, setCode] = useState<string>(INITIAL_BUBBLE_SORT);
  const [executing, setExecuting] = useState<boolean>(false);
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [examples, setExamples] = useState<any[]>(DEFAULT_EXAMPLES);
  const [showExamplesMenu, setShowExamplesMenu] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("variables");
  const [selectedArray, setSelectedArray] = useState<string | null>(null);
  const examplesRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<TracePlayer>(new TracePlayer());
  const [snapshot, setSnapshot] = useState<ReplayStateSnapshot>(
    playerRef.current.getSnapshot()
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  // New core visual debugger state
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [complexity, setComplexity] = useState<ComplexityAnalysis | null>(null);
  const [dryRunTable, setDryRunTable] = useState<DryRunTable>({ columns: [], rows: [] });
  const [focusLine, setFocusLine] = useState<number | null>(null);

  // Fetch examples
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/examples`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          // Merge custom backend examples with default examples
          setExamples([...DEFAULT_EXAMPLES, ...d.filter((x: any) => !DEFAULT_EXAMPLES.some((e) => e.id === x.id))]);
        }
      })
      .catch((err) => {
        console.warn("Using default examples, could not fetch from API:", err);
      });
  }, [API_BASE_URL]);

  // Subscribe to player
  useEffect(() => {
    const unsub = playerRef.current.subscribe((snap) => {
      setSnapshot(snap);
      setIsPlaying(playerRef.current.getIsPlaying());
    });
    return () => unsub();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (examplesRef.current && !examplesRef.current.contains(e.target as Node))
        setShowExamplesMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Keyboard shortcuts for full trace replay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const inEditor = active?.tagName === "TEXTAREA" || active?.tagName === "INPUT";

      if (inEditor) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleVisualize();
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (playerRef.current.getIsPlaying()) playerRef.current.pause();
        else playerRef.current.play();
        setIsPlaying(playerRef.current.getIsPlaying());
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) {
          playerRef.current.seek(playerRef.current.getCurrentStep() + 10);
        } else {
          playerRef.current.next();
        }
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) {
          playerRef.current.seek(playerRef.current.getCurrentStep() - 10);
        } else {
          playerRef.current.previous();
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        playerRef.current.first();
      } else if (e.key === "End") {
        e.preventDefault();
        playerRef.current.last();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        playerRef.current.seek(0);
      } else if (e.key === "Escape") {
        setShowExamplesMenu(false);
        setIsAIModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [code]);

  const handleVisualize = async () => {
    setExecuting(true);
    setRunStatus("running");
    setError(null);
    setFocusLine(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/executions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "python", source: code }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: `Server error (HTTP ${res.status})` }));
        throw new Error(errData.detail || "Execution failed.");
      }

      const data = await res.json();
      const trace: DVIRExecutionTrace = data.trace;

      const errEvent = trace.events.find((e) => e.type === "program.error");
      if (errEvent && errEvent.type === "program.error") {
        setError(`${errEvent.code}: ${errEvent.message}`);
        setRunStatus("error");
      } else {
        setRunStatus("success");
      }

      // Load into Trace Player
      playerRef.current.loadTrace(trace);

      // Extract unified analysis state
      const diagList = playerRef.current.getDiagnostics();
      setDiagnostics(diagList);
      setComplexity(playerRef.current.getComplexity());
      setDryRunTable(playerRef.current.getDryRunTable());

      // If bugs or errors are detected, auto-open diagnostics tab
      if (diagList.some((d) => d.severity === "error")) {
        setActiveTab("diagnostics");
      }

      playerRef.current.play();
      setIsPlaying(true);
    } catch (err: any) {
      const isConnectionError =
        err.message === "Failed to fetch" ||
        err.name === "TypeError" ||
        (typeof err.message === "string" && err.message.toLowerCase().includes("network"));
      setError(
        isConnectionError
          ? `Unable to connect to backend server at ${API_BASE_URL}. Please ensure the API is running (start it via 'python main.py' in apps/api or 'pnpm dev:api').`
          : err.message || "Failed to connect to execution engine."
      );
      setRunStatus("error");
    } finally {
      setExecuting(false);
    }
  };

  const loadExample = (ex: any) => {
    setCode(ex.code);
    setSelectedArray(null);
    setShowExamplesMenu(false);
    setRunStatus("idle");
    setError(null);
    setDiagnostics([]);
    setComplexity(null);
    setDryRunTable({ columns: [], rows: [] });
    setFocusLine(null);
  };

  // Array state
  const arrayEntries = Object.entries(snapshot.arrays);
  const availableArrayNames = Object.keys(snapshot.arrays);
  const activeArrayNames = arrayEntries
    .filter(([, s]) => s.activeIndices.length > 0 || s.swapIndices !== null || s.comparingIndices !== null)
    .map(([name]) => name);

  const currentEventTarget =
    snapshot.currentEvent && "target" in snapshot.currentEvent
      ? (snapshot.currentEvent as any).target
      : null;

  let activeArrayState: ArrayVisualizationState | null = null;
  if (currentEventTarget && snapshot.arrays[currentEventTarget]) {
    activeArrayState = snapshot.arrays[currentEventTarget];
  } else if (activeArrayNames.length > 0 && snapshot.arrays[activeArrayNames[0]]) {
    activeArrayState = snapshot.arrays[activeArrayNames[0]];
  } else if (selectedArray && snapshot.arrays[selectedArray]) {
    activeArrayState = snapshot.arrays[selectedArray];
  } else if (arrayEntries.length > 0) {
    const withElements = arrayEntries.find(([, s]) => s.elements.length > 0);
    activeArrayState = withElements ? withElements[1] : arrayEntries[0][1];
  }

  const primaryArrayState: ArrayVisualizationState = activeArrayState || {
    targetName: "nums",
    elements: [],
    activeIndices: [],
    swapIndices: null,
    comparingIndices: null,
    pointerLabels: {},
  };

  const hasTrace = snapshot.totalSteps > 0;
  const progressPct = hasTrace ? ((snapshot.stepIndex + 1) / snapshot.totalSteps) * 100 : 0;

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: C.bg, color: C.textPri }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="h-12 flex items-center justify-between px-4 shrink-0 gap-3"
        style={{
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
        }}
        role="banner"
      >
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 group transition-opacity hover:opacity-70 focus-visible:outline-none"
            aria-label="Back to home"
            style={{ color: C.textSec }}
          >
            <LogoMark size={16} />
            <span
              className="text-[13px] font-medium hidden sm:block"
              style={{ color: C.textPri, letterSpacing: "-0.01em" }}
            >
              AlgoViz
            </span>
          </Link>
          <span style={{ color: C.border }} aria-hidden="true">/</span>
          <span className="text-[11px] font-mono truncate" style={{ color: C.textMut }}>
            DSA Visual Debugger
          </span>
        </div>

        {/* Center: Progress bar */}
        {hasTrace && (
          <div className="flex-1 max-w-xs hidden md:flex items-center gap-2">
            <div
              className="flex-1 h-0.5 rounded-full overflow-hidden"
              style={{ background: C.border }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: C.textSec, width: `${progressPct}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            </div>
            <span className="text-[10px] font-mono shrink-0" style={{ color: C.textMut }}>
              {snapshot.stepIndex + 1}/{snapshot.totalSteps}
            </span>
          </div>
        )}

        {/* Right: controls */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={runStatus} />

          {/* Examples dropdown */}
          <div className="relative" ref={examplesRef}>
            <button
              onClick={() => setShowExamplesMenu((p) => !p)}
              aria-haspopup="listbox"
              aria-expanded={showExamplesMenu}
              className="flex items-center gap-1.5 text-[11px] rounded transition-colors focus-visible:outline-none"
              style={{
                padding: "5px 10px",
                background: C.raised,
                color: C.textSec,
                border: `1px solid ${C.border}`,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = C.borderStr)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = C.border)}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Examples</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showExamplesMenu ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence>
              {showExamplesMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.13 }}
                  className="absolute right-0 mt-1.5 w-64 rounded-lg shadow-2xl z-50 p-2"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.borderStr}`,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                  }}
                  role="listbox"
                  aria-label="Algorithm examples"
                >
                  <div
                    className="text-[10px] uppercase font-bold px-2.5 py-1.5 tracking-wider mb-1"
                    style={{ color: C.textMut }}
                  >
                    Preset Algorithms
                  </div>
                  {examples.length === 0 ? (
                    <div className="text-[11px] font-mono px-2.5 py-3" style={{ color: C.textMut }}>
                      No examples — is the API running?
                    </div>
                  ) : (
                    examples.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => loadExample(ex)}
                        role="option"
                        className="w-full text-left px-2.5 py-2 rounded flex items-center justify-between transition-colors group focus-visible:outline-none"
                        style={{ color: C.textSec }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = C.raised;
                          (e.currentTarget as HTMLElement).style.color = C.textPri;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = C.textSec;
                        }}
                      >
                        <div>
                          <span className="text-[12px] font-medium" style={{ color: C.textPri }}>
                            {ex.title}
                          </span>
                          <div className="text-[10px] mt-0.5" style={{ color: C.textMut }}>
                            {ex.category} · {ex.difficulty}
                          </div>
                        </div>
                        <ArrowLeft
                          className="w-3 h-3 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: C.amber }}
                          aria-hidden="true"
                        />
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Visualize button */}
          <button
            onClick={handleVisualize}
            disabled={executing}
            className="flex items-center gap-1.5 text-[11px] font-semibold rounded transition-opacity focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: "5px 12px",
              background: C.textPri,
              color: C.bg,
              borderRadius: 6,
            }}
            aria-label={executing ? "Executing code" : "Run and visualize (Ctrl+Enter)"}
            onMouseEnter={(e) => {
              if (!executing) (e.currentTarget as HTMLElement).style.opacity = "0.85";
            }}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            {executing ? (
              <div
                className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${C.bg}66`, borderTopColor: "transparent" }}
                aria-hidden="true"
              />
            ) : (
              <Play className="w-3 h-3 fill-current" aria-hidden="true" />
            )}
            <span>{executing ? "Running..." : "Visualize"}</span>
          </button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main
        className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 overflow-hidden"
        aria-label="Playground workspace"
      >
        {/* ── Left: Code Editor ─────────────────────────────────────────── */}
        <div
          className="lg:col-span-5 flex flex-col h-full overflow-hidden"
          style={{ borderRight: `1px solid ${C.border}` }}
        >
          {/* Editor chrome */}
          <div
            className="flex items-center justify-between px-4 py-2 shrink-0"
            style={{
              background: C.surface,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3E2020" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3E3220" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#1E3020" }} />
              </div>
              <span className="text-[11px] font-mono" style={{ color: C.textMut }}>
                main.py
              </span>
            </div>
            <span className="text-[10px] font-mono" style={{ color: C.textMut }}>
              Ctrl+Enter to Run · ←/→ Step
            </span>
          </div>

          {/* Monaco editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              code={code}
              onChange={(val) => setCode(val || "")}
              highlightedLine={snapshot.highlightedLine?.line}
              focusLine={focusLine}
              diagnostics={diagnostics}
            />
          </div>
        </div>

        {/* ── Right: Visualization + Panels ───────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden min-h-0">
          {/* Visualizer canvas */}
          <div className="flex-1 min-h-0 p-3 overflow-hidden">
            {!hasTrace && runStatus === "idle" ? (
              <EmptyState onVisualize={handleVisualize} />
            ) : (
              <ArrayVisualizer
                arrayState={primaryArrayState}
                availableArrays={availableArrayNames}
                selectedArray={primaryArrayState.targetName}
                onSelectArray={setSelectedArray}
                activeArrayNames={activeArrayNames}
              />
            )}
          </div>

          {/* Bottom panel with rich tabs */}
          <div
            className="h-[230px] shrink-0 flex flex-col"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            {/* Tab bar */}
            <div
              className="flex items-center px-2 shrink-0 overflow-x-auto"
              style={{
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
              }}
              role="tablist"
              aria-label="Visual debugger panels"
            >
              <PanelTabBtn
                id="variables"
                label="Variables"
                icon={<GitBranch className="w-3 h-3" aria-hidden="true" />}
                active={activeTab === "variables"}
                onClick={() => setActiveTab("variables")}
              />
              <PanelTabBtn
                id="dryrun"
                label="Dry Run"
                icon={<Table className="w-3 h-3" aria-hidden="true" />}
                active={activeTab === "dryrun"}
                onClick={() => setActiveTab("dryrun")}
              />
              <PanelTabBtn
                id="explain"
                label="Explain"
                icon={<HelpCircle className="w-3 h-3" aria-hidden="true" />}
                active={activeTab === "explain"}
                onClick={() => setActiveTab("explain")}
              />
              <PanelTabBtn
                id="complexity"
                label="Complexity"
                icon={<Cpu className="w-3 h-3" aria-hidden="true" />}
                active={activeTab === "complexity"}
                onClick={() => setActiveTab("complexity")}
              />
              <PanelTabBtn
                id="diagnostics"
                label="Problems"
                icon={<Bug className="w-3 h-3" aria-hidden="true" />}
                active={activeTab === "diagnostics"}
                badge={diagnostics.length}
                onClick={() => setActiveTab("diagnostics")}
              />
              <PanelTabBtn
                id="callstack"
                label="Call Stack"
                icon={<Layers className="w-3 h-3" aria-hidden="true" />}
                active={activeTab === "callstack"}
                onClick={() => setActiveTab("callstack")}
              />
              <PanelTabBtn
                id="output"
                label="Output"
                icon={<Terminal className="w-3 h-3" aria-hidden="true" />}
                active={activeTab === "output"}
                onClick={() => setActiveTab("output")}
              />
              {hasTrace && (
                <div className="ml-auto font-mono text-[10px] pr-2 shrink-0 hidden sm:block" style={{ color: C.textMut }}>
                  Step {snapshot.stepIndex + 1} / {snapshot.totalSteps}
                </div>
              )}
            </div>

            {/* Panel content */}
            <div className="flex-1 min-h-0 overflow-hidden" style={{ background: C.bg }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="h-full"
                  role="tabpanel"
                  id={`panel-${activeTab}`}
                  aria-labelledby={`tab-${activeTab}`}
                >
                  {activeTab === "variables" && (
                    <VariablesPanel
                      variables={snapshot.variables}
                      previousVariables={snapshot.previousVariables}
                      changedVariables={snapshot.changedVariables}
                      variableTypes={snapshot.variableTypes}
                      variableHistory={snapshot.variableHistory}
                      currentStepIndex={snapshot.stepIndex}
                      onSeek={(step) => playerRef.current.seek(step)}
                    />
                  )}
                  {activeTab === "dryrun" && (
                    <DryRunTablePanel
                      table={dryRunTable}
                      currentStepIndex={snapshot.stepIndex}
                      onSeek={(step) => playerRef.current.seek(step)}
                    />
                  )}
                  {activeTab === "explain" && (
                    <BeginnerExplanationPanel snapshot={snapshot} />
                  )}
                  {activeTab === "complexity" && (
                    <ComplexityPanel complexity={complexity} />
                  )}
                  {activeTab === "diagnostics" && (
                    <DiagnosticsPanel
                      diagnostics={diagnostics}
                      onSelectDiagnostic={(diag) => {
                        setFocusLine(diag.line);
                        if (diag.stepId) {
                          playerRef.current.seek(diag.stepId - 1);
                        }
                      }}
                    />
                  )}
                  {activeTab === "callstack" && <CallStackPanel callStack={snapshot.callStack} />}
                  {activeTab === "output"    && <OutputPanel stdout={snapshot.stdout} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* ── Error bar ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="shrink-0 flex items-center justify-between px-4 py-2.5 text-[12px]"
            style={{
              background: "rgba(185,28,28,0.12)",
              borderTop: "1px solid rgba(185,28,28,0.25)",
            }}
            role="alert"
          >
            <div className="flex items-center gap-2" style={{ color: "#FFE4E4" }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: C.red }} aria-hidden="true" />
              <span className="font-mono">{error}</span>
            </div>
            <button
              onClick={() => { setError(null); setRunStatus("idle"); }}
              className="p-1 rounded transition-colors focus-visible:outline-none"
              style={{ color: C.red }}
              aria-label="Dismiss error"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#FFE4E4")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = C.red)}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Timeline footer ────────────────────────────────────────────────── */}
      <footer
        className="shrink-0 px-4 py-2.5"
        style={{
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <TimelineControls
          currentStep={snapshot.stepIndex}
          totalSteps={snapshot.totalSteps}
          isPlaying={isPlaying}
          speed={speed}
          onPlayPause={() => {
            if (playerRef.current.getIsPlaying()) playerRef.current.pause();
            else playerRef.current.play();
            setIsPlaying(playerRef.current.getIsPlaying());
          }}
          onNext={() => playerRef.current.next()}
          onPrevious={() => playerRef.current.previous()}
          onFirst={() => playerRef.current.first()}
          onLast={() => playerRef.current.last()}
          onRestart={() => {
            playerRef.current.seek(0);
            setRunStatus(hasTrace ? "success" : "idle");
          }}
          onSeek={(step) => playerRef.current.seek(step)}
          onSetSpeed={(s) => {
            setSpeed(s);
            playerRef.current.setSpeed(s);
          }}
          onAskAI={() => setIsAIModalOpen(true)}
        />
      </footer>

      {/* ── AI Modal ───────────────────────────────────────────────────────── */}
      <AIExplainModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        code={code}
        stepIndex={snapshot.stepIndex}
        currentEvent={snapshot.currentEvent}
        variables={snapshot.variables}
      />
    </div>
  );
}
