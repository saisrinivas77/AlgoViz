"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";

const PIPELINE_STEPS = [
  {
    id: "code",
    label: "Your Code",
    badge: "Python source",
    content: (
      <div className="font-mono text-[11.5px] leading-[1.7]">
        <div style={{ color: "#C8956C" }}>def bubble_sort(nums):</div>
        <div style={{ color: "#9DCBCB" }}>    for i in range(n):</div>
        <div style={{ color: "#9DCBCB" }}>        for j in range(0, n-i-1):</div>
        <div
          style={{
            color: "rgba(180,83,9,0.9)",
            background: "rgba(180,83,9,0.08)",
            borderLeft: "2px solid rgba(180,83,9,0.4)",
            paddingLeft: 6,
            marginLeft: -6,
          }}
        >
            if nums[j] {">"} nums[j+1]:
        </div>
        <div style={{ color: "rgba(45,106,48,0.9)" }}>
            nums[j], nums[j+1] = nums[j+1], nums[j]
        </div>
      </div>
    ),
  },
  {
    id: "trace",
    label: "Execution Trace",
    badge: "DVIR event stream",
    content: (
      <div className="font-mono text-[11px] leading-[1.8] space-y-0.5">
        {[
          { type: "line.execute", detail: "line: 5", col: "var(--fg-code-secondary)" },
          { type: "array.access", detail: "nums[2] → 25", col: "var(--fg-code-secondary)" },
          { type: "array.compare", detail: "nums[2] > nums[3]", col: "rgba(180,83,9,0.85)" },
          { type: "array.swap", detail: "[2] ↔ [3]", col: "rgba(45,106,48,0.9)" },
          { type: "variable.update", detail: "j = 3", col: "var(--fg-code-secondary)" },
        ].map(({ type, detail, col }) => (
          <div key={type} className="flex gap-3 items-start">
            <span className="shrink-0" style={{ color: "var(--fg-code-muted)", minWidth: 110 }}>
              {type}:
            </span>
            <span style={{ color: col }}>{detail}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "visual",
    label: "Visual State",
    badge: "Step visualization",
    content: (
      <div className="flex flex-col gap-2">
        {/* Array bars */}
        <div className="flex items-end gap-1.5 h-12">
          {[
            { v: 12, state: "sorted" },
            { v: 22, state: "sorted" },
            { v: 25, state: "compare" },
            { v: 34, state: "compare" },
            { v: 64, state: "default" },
            { v: 11, state: "default" },
            { v: 90, state: "default" },
          ].map(({ v, state }, i) => {
            let bg = "var(--bg-code-raised)";
            let border = "var(--border-code)";
            if (state === "compare") {
              bg = "rgba(180,83,9,0.3)";
              border = "rgba(180,83,9,0.4)";
            } else if (state === "sorted") {
              bg = "rgba(45,106,48,0.3)";
              border = "rgba(45,106,48,0.3)";
            }
            return (
              <div
                key={i}
                className="flex-1 rounded-sm flex items-end justify-center"
                style={{
                  height: `${Math.max(15, (v / 90) * 100)}%`,
                  background: bg,
                  border: `1px solid ${border}`,
                }}
              >
                <span
                  className="font-mono text-[8px] pb-0.5"
                  style={{
                    color:
                      state === "compare"
                        ? "rgba(180,83,9,0.9)"
                        : state === "sorted"
                        ? "rgba(45,106,48,0.9)"
                        : "var(--fg-code-muted)",
                  }}
                >
                  {v}
                </span>
              </div>
            );
          })}
        </div>
        <div className="font-mono text-[9px]" style={{ color: "rgba(180,83,9,0.8)" }}>
          Comparing nums[2]=25 vs nums[3]=34
        </div>
      </div>
    ),
  },
] as const;

export function CodeBecomesViz() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        background: "var(--bg-code)",
        color: "var(--fg-code-primary)",
        padding: "var(--section-py) 1.5rem",
      }}
      aria-labelledby="code-becomes-viz-heading"
    >
      <div className="section-sep-dark absolute top-0 left-0 right-0" />

      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="font-mono text-[11px] uppercase tracking-widest mb-6"
              style={{ color: "var(--fg-code-muted)" }}
            >
              05 — Core Philosophy
            </motion.p>

            <motion.h2
              id="code-becomes-viz-heading"
              initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-heading mb-6"
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                color: "var(--fg-code-primary)",
              }}
            >
              Your code.
              <br />
              <span style={{ color: "var(--fg-code-secondary)" }}>
                Your execution.
                <br />
                Your visualization.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: prefersReduced ? 0 : 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mb-8 leading-relaxed"
              style={{
                fontSize: "1rem",
                color: "var(--fg-code-secondary)",
                lineHeight: 1.7,
              }}
            >
              This is not a library of pre-recorded algorithm animations. We
              execute{" "}
              <span style={{ color: "var(--fg-code-primary)", fontWeight: 500 }}>
                your code
              </span>
              , capture every operation in a deterministic trace, and replay it
              visually — step by step.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {[
                "Paste your own implementation",
                "Run it in an isolated sandbox",
                "Watch your exact execution unfold",
                "Time-travel through every state",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[14px]"
                  style={{ color: "var(--fg-code-secondary)" }}
                >
                  <span
                    className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                    style={{ background: "var(--accent-green)" }}
                  />
                  {item}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.35 }}
              className="mt-8"
            >
              <Link
                href="/playground"
                className="btn-ghost-dark text-[13px]"
                style={{ display: "inline-flex" }}
              >
                Try it now
                <span className="ml-2">→</span>
              </Link>
            </motion.div>
          </div>

          {/* Right: Three-step pipeline */}
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <motion.div
                  initial={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: prefersReduced ? 0 : 0.5,
                    delay: prefersReduced ? 0 : idx * 0.12 + 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-md p-4"
                  style={{
                    background: "var(--bg-code-surface)",
                    border: "1px solid var(--border-code-strong)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: "var(--fg-code-primary)" }}
                    >
                      {step.label}
                    </span>
                    <span
                      className="font-mono text-[9px] px-2 py-0.5 rounded"
                      style={{
                        background: "var(--bg-code-raised)",
                        color: "var(--fg-code-muted)",
                        border: "1px solid var(--border-code-strong)",
                      }}
                    >
                      {step.badge}
                    </span>
                  </div>
                  {/* Content */}
                  {step.content}
                </motion.div>

                {/* Connector */}
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    className="flex justify-start pl-4"
                    aria-hidden="true"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <div
                        className="w-px h-2"
                        style={{ background: "var(--border-code-strong)" }}
                      />
                      <div
                        className="font-mono text-[10px]"
                        style={{ color: "var(--border-code-strong)" }}
                      >
                        ↓
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
