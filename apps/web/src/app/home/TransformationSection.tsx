"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const STAGES = [
  {
    num: "01",
    label: "Source Code",
    subtitle: "Standard Python",
    desc: "You write normal Python. No decorators, no special imports, no modifications required.",
    preview: (
      <div className="font-mono text-[11px] leading-[1.7]">
        <div style={{ color: "#C8956C" }}>def bubble_sort(nums):</div>
        <div style={{ color: "var(--fg-code-secondary)" }}>    n = len(nums)</div>
        <div style={{ color: "#9DCBCB" }}>    for i in range(n):</div>
        <div style={{ color: "#9DCBCB" }}>        for j in range(0, n-i-1):</div>
        <div style={{ color: "rgba(180,83,9,0.9)" }}>            if nums[j] {">"} nums[j+1]:</div>
      </div>
    ),
  },
  {
    num: "02",
    label: "Execution Events",
    subtitle: "AST instrumentation",
    desc: "Python's ast module parses your code. We inject execution hooks that capture every meaningful operation without altering program logic.",
    preview: (
      <div className="font-mono text-[11px] leading-[1.8] space-y-0.5">
        {[
          { key: "line.execute", val: "4", col: "var(--fg-code-secondary)" },
          { key: "variable.create", val: "nums = [64, 34...]", col: "var(--fg-code-secondary)" },
          { key: "array.access", val: "nums[0]", col: "rgba(180,83,9,0.8)" },
          { key: "array.compare", val: "nums[0] > nums[1]", col: "rgba(180,83,9,0.8)" },
          { key: "array.swap", val: "[0] ↔ [1]", col: "rgba(45,106,48,0.9)" },
        ].map(({ key, val, col }) => (
          <div key={key} className="flex gap-3">
            <span style={{ color: "var(--fg-code-muted)", minWidth: 120 }}>{key}:</span>
            <span style={{ color: col }}>{val}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: "03",
    label: "State Snapshot",
    subtitle: "Deterministic replay",
    desc: "Every step produces a complete program state snapshot: variables, array contents, active indices, call stack depth, and current line.",
    preview: (
      <div className="font-mono text-[11px] leading-[1.8]">
        <div className="flex gap-3 mb-2">
          <span style={{ color: "var(--fg-code-muted)", minWidth: 80 }}>step:</span>
          <span style={{ color: "var(--fg-code-secondary)" }}>47 / 132</span>
        </div>
        <div className="flex gap-3 mb-2">
          <span style={{ color: "var(--fg-code-muted)", minWidth: 80 }}>line:</span>
          <span style={{ color: "var(--fg-code-secondary)" }}>5</span>
        </div>
        <div className="flex gap-3 mb-2">
          <span style={{ color: "var(--fg-code-muted)", minWidth: 80 }}>i, j:</span>
          <span style={{ color: "rgba(180,83,9,0.9)" }}>2, 1</span>
        </div>
        <div className="flex gap-3">
          <span style={{ color: "var(--fg-code-muted)", minWidth: 80 }}>nums:</span>
          <span style={{ color: "rgba(45,106,48,0.9)" }}>
            [12, 22, 25, 34, 64, 11, 90]
          </span>
        </div>
      </div>
    ),
  },
  {
    num: "04",
    label: "Visualization",
    subtitle: "Step-by-step playback",
    desc: "The state model renders as animated components — array bars, variable panels, code line highlighting, and call stack — all synchronized.",
    preview: (
      <div>
        <div className="flex items-end gap-1 h-10 mb-2">
          {[12, 22, 25, 34, 64, 11, 90].map((v, i) => {
            const isActive = i === 4 || i === 5;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${(v / 90) * 100}%`,
                  background: isActive
                    ? "rgba(180,83,9,0.5)"
                    : "var(--bg-code-raised)",
                  border: `1px solid ${
                    isActive ? "rgba(180,83,9,0.4)" : "var(--border-code)"
                  }`,
                }}
              />
            );
          })}
        </div>
        <div
          className="font-mono text-[9px]"
          style={{ color: "rgba(180,83,9,0.8)" }}
        >
          Comparing arr[4] = 64 vs arr[5] = 11
        </div>
      </div>
    ),
  },
] as const;

export function TransformationSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-12%" });

  return (
    <section
      id="transformation"
      ref={sectionRef}
      className="relative"
      style={{
        background: "var(--bg-page)",
        color: "var(--fg-primary)",
        padding: "var(--section-py) 1.5rem",
      }}
      aria-labelledby="transformation-heading"
    >
      <div className="section-sep absolute top-0 left-0 right-0" />
      <div className="section-sep absolute bottom-0 left-0 right-0" />

      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] uppercase tracking-widest mb-6"
            style={{ color: "var(--fg-tertiary)" }}
          >
            02 — How It Works
          </motion.p>

          <motion.h2
            id="transformation-heading"
            initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading mb-5"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--fg-primary)",
            }}
          >
            Code becomes understanding.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.12 }}
            style={{ fontSize: "1rem", color: "var(--fg-secondary)", lineHeight: 1.65 }}
          >
            A real execution pipeline — not pre-recorded animations. Your code runs, every
            operation is captured, and the result is replayed visually on demand.
          </motion.p>
        </div>

        {/* Four stages — 2×2 grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAGES.map((stage, idx) => (
            <motion.div
              key={stage.num}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: prefersReduced ? 0 : 0.55,
                delay: prefersReduced ? 0 : idx * 0.09 + 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-md p-6"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Stage number */}
              <div
                className="font-mono text-[10px] mb-4 uppercase tracking-widest"
                style={{ color: "var(--fg-disabled)" }}
              >
                {stage.num}
              </div>

              {/* Label + subtitle */}
              <h3
                className="text-[15px] font-semibold mb-0.5"
                style={{
                  color: "var(--fg-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {stage.label}
              </h3>
              <p
                className="font-mono text-[11px] mb-4"
                style={{ color: "var(--fg-tertiary)" }}
              >
                {stage.subtitle}
              </p>

              {/* Description */}
              <p
                className="text-[13px] mb-5 leading-relaxed"
                style={{ color: "var(--fg-secondary)" }}
              >
                {stage.desc}
              </p>

              {/* Preview */}
              <div
                className="rounded p-3"
                style={{
                  background: "var(--bg-code)",
                  border: "1px solid var(--border-code)",
                }}
              >
                {stage.preview}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-10 text-[13px] leading-relaxed text-center"
          style={{ color: "var(--fg-tertiary)" }}
        >
          Every step of execution is captured and can be replayed forwards, backwards, or
          jumped to at any point in time.
        </motion.p>
      </div>
    </section>
  );
}
