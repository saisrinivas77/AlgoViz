"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

// ── Bubble sort step builder ──────────────────────────────────────────────────

const CODE_LINES = [
  "def bubble_sort(nums):",
  "    n = len(nums)",
  "    for i in range(n):",
  "        for j in range(0, n-i-1):",
  "            if nums[j] > nums[j+1]:",
  "                nums[j], nums[j+1] = \\",
  "                    nums[j+1], nums[j]",
  "    return nums",
  "",
  "nums = [64, 34, 25, 12, 22, 11, 90]",
  "bubble_sort(nums)",
];

type StepState = {
  values: number[];
  comparing: [number, number] | null;
  swapping: [number, number] | null;
  sorted: number[];
  activeLine: number;
  stepLabel: string;
  vars: { i: number; j: number; n: number };
};

function buildSteps(): StepState[] {
  const steps: StepState[] = [];
  const arr = [64, 34, 25, 12, 22, 11, 90];
  const n = arr.length;
  const sorted: number[] = [];

  steps.push({
    values: [...arr],
    comparing: null,
    swapping: null,
    sorted: [],
    activeLine: 9,
    stepLabel: "Initialize array",
    vars: { i: 0, j: 0, n },
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        values: [...arr],
        comparing: [j, j + 1],
        swapping: null,
        sorted: [...sorted],
        activeLine: 4,
        stepLabel: `arr[${j}]=${arr[j]} vs arr[${j + 1}]=${arr[j + 1]}`,
        vars: { i, j, n },
      });
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        steps.push({
          values: [...arr],
          comparing: null,
          swapping: [j, j + 1],
          sorted: [...sorted],
          activeLine: 5,
          stepLabel: `Swap arr[${j}] ↔ arr[${j + 1}]`,
          vars: { i, j, n },
        });
      }
    }
    sorted.unshift(n - 1 - i);
  }

  steps.push({
    values: [...arr],
    comparing: null,
    swapping: null,
    sorted: Array.from({ length: n }, (_, k) => k),
    activeLine: 7,
    stepLabel: "Sorted ✓",
    vars: { i: n - 1, j: 0, n },
  });

  return steps;
}

const DEMO_STEPS = buildSteps();
const MAX_VAL = Math.max(...DEMO_STEPS[0].values);

// ── Hero Visualizer (code + bars) ────────────────────────────────────────────

function HeroVisualizer() {
  const prefersReduced = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = DEMO_STEPS[stepIndex];

  const startLoop = useCallback(() => {
    if (prefersReduced) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStepIndex((prev) => {
        const next = (prev + 1) % DEMO_STEPS.length;
        return next;
      });
    }, 850);
  }, [prefersReduced]);

  useEffect(() => {
    startLoop();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startLoop]);

  return (
    <div
      className="perspective-card w-full rounded-lg overflow-hidden"
      style={{
        background: "var(--bg-code)",
        border: "1px solid var(--border-code-strong)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
      }}
      aria-label="Live bubble sort visualization preview"
      aria-live="polite"
    >
      {/* Window chrome */}
      <div className="window-chrome">
        <div className="window-dots">
          <div className="window-dot window-dot-red" />
          <div className="window-dot window-dot-amber" />
          <div className="window-dot window-dot-green" />
        </div>
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--fg-code-muted)" }}
        >
          bubble_sort.py
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-run-pulse"
            style={{ background: "var(--accent-green)" }}
          />
          <span
            className="font-mono text-[10px]"
            style={{ color: "var(--accent-green)" }}
          >
            running
          </span>
        </div>
      </div>

      {/* Layout: code left | visualization right */}
      <div className="grid grid-cols-2" style={{ minHeight: 280 }}>
        {/* Code panel */}
        <div
          className="p-4 overflow-hidden"
          style={{ borderRight: "1px solid var(--border-code)" }}
        >
          <div
            className="font-mono text-[10px] mb-2 uppercase tracking-wider"
            style={{ color: "var(--fg-code-muted)" }}
          >
            Source
          </div>
          <div>
            {CODE_LINES.map((line, idx) => {
              const isActive = idx === step.activeLine;
              return (
                <div
                  key={idx}
                  className="code-line"
                  style={
                    isActive
                      ? {
                          background: "rgba(180, 83, 9, 0.12)",
                          borderLeftColor: "var(--accent-amber)",
                          color: "#F5E6D0",
                        }
                      : { color: "var(--fg-code-muted)" }
                  }
                >
                  <span
                    className="select-none mr-2 text-[10px]"
                    style={{ color: "var(--border-code-strong)" }}
                  >
                    {String(idx + 1).padStart(2, " ")}
                  </span>
                  {line || " "}
                </div>
              );
            })}
          </div>
        </div>

        {/* Visualization panel */}
        <div className="p-4 flex flex-col justify-between">
          {/* Array bars */}
          <div>
            <div
              className="font-mono text-[10px] mb-3 uppercase tracking-wider"
              style={{ color: "var(--fg-code-muted)" }}
            >
              nums
            </div>
            <div className="flex items-end gap-1.5 h-24 mb-3">
              {step.values.map((val, idx) => {
                const isComparing =
                  step.comparing &&
                  (step.comparing[0] === idx || step.comparing[1] === idx);
                const isSwapping =
                  step.swapping &&
                  (step.swapping[0] === idx || step.swapping[1] === idx);
                const isSorted = step.sorted.includes(idx);
                const heightPct = Math.max(12, (val / MAX_VAL) * 100);

                let bg = "var(--bg-code-raised)";
                let textColor = "var(--fg-code-muted)";

                if (isSwapping) {
                  bg = "rgba(180, 83, 9, 0.6)";
                  textColor = "#F5E6D0";
                } else if (isComparing) {
                  bg = "rgba(180, 83, 9, 0.25)";
                  textColor = "#B45309";
                } else if (isSorted) {
                  bg = "rgba(45, 106, 48, 0.35)";
                  textColor = "var(--accent-green)";
                }

                return (
                  <motion.div
                    key={idx}
                    className="flex-1 rounded-t-sm flex items-end justify-center"
                    style={{
                      height: `${heightPct}%`,
                      background: bg,
                      border: `1px solid ${
                        isSwapping
                          ? "rgba(180,83,9,0.5)"
                          : isComparing
                          ? "rgba(180,83,9,0.3)"
                          : isSorted
                          ? "rgba(45,106,48,0.3)"
                          : "var(--border-code)"
                      }`,
                      transition: prefersReduced
                        ? "none"
                        : "height 0.2s ease, background 0.15s ease",
                    }}
                  >
                    <span
                      className="font-mono text-[9px] font-medium pb-0.5"
                      style={{ color: textColor }}
                    >
                      {val}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Step label */}
            <div
              className="font-mono text-[10px] truncate"
              style={{ color: "var(--fg-code-secondary)" }}
            >
              {step.stepLabel}
            </div>
          </div>

          {/* Variables */}
          <div
            className="mt-3 pt-3"
            style={{ borderTop: "1px solid var(--border-code)" }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-wider mb-1.5"
              style={{ color: "var(--fg-code-muted)" }}
            >
              Variables
            </div>
            <div className="flex gap-3 font-mono text-[10px]">
              {Object.entries(step.vars).map(([k, v]) => (
                <span key={k}>
                  <span style={{ color: "var(--accent-amber)" }}>{k}</span>
                  <span style={{ color: "var(--fg-code-muted)" }}>{" = "}</span>
                  <span style={{ color: "var(--fg-code-primary)" }}>
                    {String(v)}
                  </span>
                </span>
              ))}
            </div>

            {/* Step dots */}
            <div className="flex gap-0.5 mt-2.5">
              {DEMO_STEPS.slice(0, 12).map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 rounded-full transition-all duration-300"
                  style={{
                    width:
                      i === stepIndex % 12 ? "16px" : "6px",
                    background:
                      i === stepIndex % 12
                        ? "var(--accent-amber)"
                        : "var(--border-code-strong)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export function Hero() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden"
      style={{ background: "var(--bg-page)" }}
      aria-labelledby="hero-heading"
    >
      {/* Subtle background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.45,
          maskImage:
            "radial-gradient(ellipse 100% 100% at 50% 0%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 100% at 50% 0%, black 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left: Editorial copy */}
        <div className="flex-1 flex flex-col items-start text-left max-w-lg">
          {/* Eyebrow label */}
          <motion.div
            variants={FADE_UP}
            custom={0}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
            className="flex items-center gap-2 mb-7"
          >
            <span
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: "var(--fg-tertiary)" }}
            >
              Python Execution Visualizer
            </span>
          </motion.div>

          {/* Main headline — large, tight, confident */}
          <motion.h1
            id="hero-heading"
            variants={FADE_UP}
            custom={0.06}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
            className="font-display mb-6"
            style={{
              fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: "var(--fg-primary)",
            }}
          >
            Run your code.
            <br />
            <span style={{ color: "var(--fg-secondary)" }}>
              See what actually
              <br />
              happens.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={FADE_UP}
            custom={0.13}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
            className="mb-9 leading-relaxed max-w-sm"
            style={{
              fontSize: "1.0625rem",
              color: "var(--fg-secondary)",
              lineHeight: 1.65,
            }}
          >
            Write your algorithm, execute it, and watch every variable change,
            every comparison, every swap — step by step.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={FADE_UP}
            custom={0.2}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
          >
            <Link
              href="/playground"
              className="btn-primary text-[14px]"
              style={{ borderRadius: "6px", padding: "12px 24px" }}
            >
              Open Visualizer
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <button
              onClick={() => {
                document
                  .getElementById("demo")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-ghost text-[14px]"
              style={{ borderRadius: "6px", padding: "12px 24px" }}
            >
              See live demo
            </button>
          </motion.div>

          {/* No login hint */}
          <motion.p
            variants={FADE_UP}
            custom={0.27}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
            className="mt-5 font-mono text-[11px]"
            style={{ color: "var(--fg-disabled)" }}
          >
            No account required · Open immediately
          </motion.p>

          {/* Algo types */}
          <motion.div
            variants={FADE_UP}
            custom={0.32}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
            className="mt-8 flex flex-wrap gap-1.5"
          >
            {[
              "Bubble Sort",
              "Binary Search",
              "Linked List",
              "BFS / DFS",
              "Two Pointer",
            ].map((label) => (
              <span
                key={label}
                className="font-mono text-[10px] px-2 py-0.5 rounded"
                style={{
                  background: "var(--bg-raised)",
                  color: "var(--fg-tertiary)",
                  border: "1px solid var(--border)",
                }}
              >
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right: Live visualizer preview */}
        <motion.div
          variants={FADE_UP}
          custom={0.15}
          initial={prefersReduced ? false : "hidden"}
          animate="visible"
          className="flex-1 w-full max-w-xl"
        >
          <HeroVisualizer />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ color: "var(--fg-disabled)" }}
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] uppercase tracking-widest">
          scroll
        </span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
      </motion.div>
    </section>
  );
}
