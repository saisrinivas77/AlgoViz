"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  TracePlayer,
  ReplayStateSnapshot,
  ArrayVisualizationState,
} from "@algoviz/visualizer-core";
import { BUBBLE_SORT_TRACE, BUBBLE_SORT_DEMO_CODE } from "./demoTrace";
import { ArrayVisualizer } from "@/components/visualizer/ArrayVisualizer";

const CODE_LINES = BUBBLE_SORT_DEMO_CODE.split("\n");

// ── Code panel with highlighted active line ────────────────────────────────────
function DemoCodePanel({
  highlightedLine,
}: {
  highlightedLine: number | null | undefined;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div
        className="font-mono text-[10px] uppercase tracking-wider mb-3 px-1"
        style={{ color: "var(--fg-code-muted)" }}
      >
        bubble_sort.py
      </div>
      <div className="font-mono text-[12px] leading-[1.75]">
        {CODE_LINES.map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = highlightedLine === lineNum;

          // Syntax coloring
          let lineColor: string;
          if (isHighlighted) {
            lineColor = "#F5E6D0";
          } else if (line.includes("def ")) {
            lineColor = "#C8956C";
          } else if (line.includes("for ") || line.includes("if ")) {
            lineColor = "#9DCBCB";
          } else if (line.includes("return")) {
            lineColor = "rgba(45,106,48,0.9)";
          } else if (line.includes("#")) {
            lineColor = "var(--fg-code-muted)";
          } else {
            lineColor = "var(--fg-code-secondary)";
          }

          return (
            <div
              key={idx}
              className="flex items-start transition-all duration-100"
              style={{
                background: isHighlighted
                  ? "rgba(180, 83, 9, 0.1)"
                  : "transparent",
                borderLeft: `2px solid ${
                  isHighlighted
                    ? "var(--accent-amber)"
                    : "transparent"
                }`,
                paddingLeft: "6px",
              }}
            >
              <span
                className="shrink-0 select-none mr-2 pt-px text-[10px] w-6 text-right"
                style={{ color: "var(--border-code-strong)" }}
              >
                {lineNum}
              </span>
              <span style={{ color: lineColor }}>{line || " "}</span>
              {isHighlighted && (
                <span
                  className="ml-2 text-[10px] font-sans animate-cursor"
                  style={{ color: "var(--accent-amber)" }}
                >
                  ▌
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Variables panel ───────────────────────────────────────────────────────────
function DemoVariables({
  variables,
}: {
  variables: Record<string, unknown>;
}) {
  const entries = Object.entries(variables).filter(
    ([, v]) => typeof v !== "object" || v === null
  );

  return (
    <div className="h-full overflow-y-auto">
      <div
        className="font-mono text-[10px] uppercase tracking-wider mb-3"
        style={{ color: "var(--fg-code-muted)" }}
      >
        Variables
      </div>
      {entries.length === 0 ? (
        <p
          className="text-[11px] font-mono"
          style={{ color: "var(--fg-code-muted)" }}
        >
          Waiting...
        </p>
      ) : (
        <div className="space-y-1.5">
          {entries.map(([key, val]) => (
            <div
              key={key}
              className="flex items-center justify-between font-mono text-[11px] px-2.5 py-1.5 rounded"
              style={{
                background: "var(--bg-code)",
                border: "1px solid var(--border-code)",
              }}
            >
              <span style={{ color: "var(--accent-amber)" }}>{key}</span>
              <span style={{ color: "var(--fg-code-primary)" }}>
                {JSON.stringify(val)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Controls ──────────────────────────────────────────────────────────────────
interface DemoControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onRestart: () => void;
  onSeek: (n: number) => void;
}

function DemoControls({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onRestart,
  onSeek,
}: DemoControlsProps) {
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress track */}
      <div className="flex items-center gap-3">
        <span
          className="font-mono text-[11px] shrink-0 w-24"
          style={{ color: "var(--fg-code-muted)" }}
        >
          {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="flex-1"
          style={{
            background: `linear-gradient(to right, var(--fg-code-secondary) ${progress}%, var(--border-code-strong) ${progress}%)`,
          }}
          aria-label="Seek to step"
        />
      </div>

      {/* Button row */}
      <div className="flex items-center gap-2">
        {/* Restart */}
        <button
          onClick={onRestart}
          title="Restart"
          aria-label="Restart"
          className="p-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-1"
          style={{
            background: "var(--bg-code-surface)",
            color: "var(--fg-code-secondary)",
            border: "1px solid var(--border-code)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "var(--fg-code-primary)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border-code-strong)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "var(--fg-code-secondary)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border-code)";
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          title="Previous step (←)"
          aria-label="Previous step"
          className="p-2 rounded transition-colors focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "var(--bg-code-surface)",
            color: "var(--fg-code-secondary)",
            border: "1px solid var(--border-code)",
          }}
          onMouseEnter={(e) => {
            if (!(e.currentTarget as HTMLButtonElement).disabled) {
              (e.currentTarget as HTMLElement).style.color =
                "var(--fg-code-primary)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "var(--fg-code-secondary)";
          }}
        >
          <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="p-2.5 rounded transition-opacity focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: "var(--fg-code-primary)",
            color: "var(--bg-code)",
            borderRadius: "6px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={totalSteps === 0 || currentStep >= totalSteps - 1}
          title="Next step (→)"
          aria-label="Next step"
          className="p-2 rounded transition-colors focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "var(--bg-code-surface)",
            color: "var(--fg-code-secondary)",
            border: "1px solid var(--border-code)",
          }}
          onMouseEnter={(e) => {
            if (!(e.currentTarget as HTMLButtonElement).disabled) {
              (e.currentTarget as HTMLElement).style.color =
                "var(--fg-code-primary)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "var(--fg-code-secondary)";
          }}
        >
          <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Status */}
        <div className="ml-auto font-mono text-[11px]">
          {isPlaying ? (
            <span
              className="flex items-center gap-1.5"
              style={{ color: "var(--accent-green)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-run-pulse"
                style={{ background: "var(--accent-green)" }}
              />
              Executing
            </span>
          ) : (
            <span style={{ color: "var(--fg-code-muted)" }}>Paused</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Full Live Demo Section ────────────────────────────────────────────────────
export function LiveDemo() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const hasStartedRef = useRef(false);

  // TracePlayer — real visualizer engine, unchanged
  const playerRef = useRef<TracePlayer>(new TracePlayer());
  const [snapshot, setSnapshot] = useState<ReplayStateSnapshot>(
    playerRef.current.getSnapshot()
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // Load trace once
  useEffect(() => {
    playerRef.current.loadTrace(BUBBLE_SORT_TRACE);
  }, []);

  // Subscribe to player updates
  useEffect(() => {
    const unsub = playerRef.current.subscribe((snap) => {
      setSnapshot(snap);
      setIsPlaying(playerRef.current.getIsPlaying());
    });
    return () => unsub();
  }, []);

  // Auto-play on scroll into view
  useEffect(() => {
    if (isInView && !hasStartedRef.current && !prefersReduced) {
      hasStartedRef.current = true;
      setTimeout(() => {
        playerRef.current.play();
        setIsPlaying(true);
      }, 600);
    }
  }, [isInView, prefersReduced]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isInView) return;
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      )
        return;
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (playerRef.current.getIsPlaying()) playerRef.current.pause();
        else playerRef.current.play();
        setIsPlaying(playerRef.current.getIsPlaying());
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        playerRef.current.next();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        playerRef.current.previous();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isInView]);

  // Cleanup
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      player.pause();
    };
  }, []);

  // Array state
  const arrayEntries = Object.entries(snapshot.arrays);
  const primaryArrayState: ArrayVisualizationState =
    arrayEntries.length > 0
      ? arrayEntries[0][1]
      : {
          targetName: "nums",
          elements: [
            { value: 64, status: "default" },
            { value: 34, status: "default" },
            { value: 25, status: "default" },
            { value: 12, status: "default" },
            { value: 22, status: "default" },
            { value: 11, status: "default" },
            { value: 90, status: "default" },
          ],
          activeIndices: [],
          swapIndices: null,
          comparingIndices: null,
          pointerLabels: {},
        };

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="relative"
      style={{
        background: "var(--bg-code)",
        color: "var(--fg-code-primary)",
        padding: "var(--section-py) 1.5rem",
      }}
      aria-labelledby="demo-heading"
    >
      <div className="section-sep-dark absolute top-0 left-0 right-0" />

      <div style={{ maxWidth: "88rem", margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] uppercase tracking-widest mb-5"
            style={{ color: "var(--fg-code-muted)" }}
          >
            03 — Live Demo
          </motion.p>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <motion.h2
              id="demo-heading"
              initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-heading"
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--fg-code-primary)",
              }}
            >
              Bubble Sort,{" "}
              <span style={{ color: "var(--fg-code-secondary)" }}>
                step by step.
              </span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/playground"
                className="flex items-center gap-1.5 text-[13px] font-medium group transition-opacity"
                style={{ color: "var(--fg-code-secondary)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--fg-code-primary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--fg-code-secondary)")
                }
              >
                Open full playground
                <ArrowRight
                  className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Main demo panel */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-md overflow-hidden"
          style={{
            border: "1px solid var(--border-code-strong)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              background: "var(--bg-code-raised)",
              borderBottom: "1px solid var(--border-code)",
            }}
          >
            <div className="flex gap-1.5">
              <div className="window-dot window-dot-red" />
              <div className="window-dot window-dot-amber" />
              <div className="window-dot window-dot-green" />
            </div>
            <span
              className="font-mono text-[11px]"
              style={{ color: "var(--fg-code-muted)" }}
            >
              AlgoViz — bubble_sort.py
            </span>
            <div className="flex items-center gap-1.5">
              {isPlaying && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-run-pulse"
                  style={{ background: "var(--accent-green)" }}
                />
              )}
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--fg-code-muted)" }}
              >
                {isPlaying ? "Executing" : "Paused"}
              </span>
            </div>
          </div>

          {/* Three-panel layout: Code | Array | Variables */}
          <div
            className="grid grid-cols-1 lg:grid-cols-12"
            style={{ minHeight: 480, background: "var(--bg-code)" }}
          >
            {/* Code panel */}
            <div
              className="lg:col-span-4 p-5"
              style={{
                borderBottom: "1px solid var(--border-code)",
                borderRight: "none",
                background: "var(--bg-code-surface)",
              }}
            >
              <style>{`@media (min-width: 1024px) { .demo-code-panel { border-bottom: none !important; border-right: 1px solid var(--border-code) !important; } }`}</style>
              <div className="demo-code-panel h-full">
                <DemoCodePanel
                  highlightedLine={snapshot.highlightedLine?.line}
                />
              </div>
            </div>

            {/* Array visualizer */}
            <div
              className="lg:col-span-5 p-5 flex flex-col"
              style={{ borderBottom: "1px solid var(--border-code)" }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-wider mb-3"
                style={{ color: "var(--fg-code-muted)" }}
              >
                Array Visualization
              </div>
              <div className="flex-1" style={{ minHeight: 280 }}>
                <ArrayVisualizer
                  arrayState={primaryArrayState}
                  availableArrays={Object.keys(snapshot.arrays)}
                  selectedArray={primaryArrayState.targetName}
                  activeArrayNames={Object.keys(snapshot.arrays)}
                />
              </div>
            </div>

            {/* Variables sidebar */}
            <div
              className="lg:col-span-3 p-5"
              style={{ background: "var(--bg-code-surface)" }}
            >
              <DemoVariables variables={snapshot.variables} />
            </div>
          </div>

          {/* Controls footer */}
          <div
            className="px-5 py-4"
            style={{
              background: "var(--bg-code-raised)",
              borderTop: "1px solid var(--border-code)",
            }}
          >
            <DemoControls
              currentStep={snapshot.stepIndex}
              totalSteps={snapshot.totalSteps}
              isPlaying={isPlaying}
              onPlayPause={() => {
                if (playerRef.current.getIsPlaying())
                  playerRef.current.pause();
                else playerRef.current.play();
                setIsPlaying(playerRef.current.getIsPlaying());
              }}
              onNext={() => playerRef.current.next()}
              onPrevious={() => playerRef.current.previous()}
              onRestart={() => {
                playerRef.current.seek(0);
              }}
              onSeek={(n) => playerRef.current.seek(n)}
            />
          </div>
        </motion.div>

        {/* Keyboard hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-4 text-center font-mono text-[10px]"
          style={{ color: "var(--fg-code-muted)" }}
        >
          Space · ← · → to control playback
        </motion.p>
      </div>
    </section>
  );
}
