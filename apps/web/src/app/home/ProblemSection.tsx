"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// Simplified code snippet — what the developer stares at
const CODE_LINES = [
  { text: "def bubble_sort(nums):", type: "fn" },
  { text: "    n = len(nums)", type: "default" },
  { text: "    for i in range(n):", type: "keyword" },
  { text: "        for j in range(0, n-i-1):", type: "keyword" },
  { text: "            if nums[j] > nums[j+1]:", type: "compare" },
  { text: "                nums[j], nums[j+1] = \\", type: "swap" },
  { text: "                    nums[j+1], nums[j]", type: "swap" },
];

const MENTAL_VARS = [
  { name: "n", value: "7", color: "var(--fg-code-secondary)" },
  { name: "i", value: "?", color: "var(--fg-code-muted)" },
  { name: "j", value: "?", color: "var(--fg-code-muted)" },
  { name: "nums[j]", value: "?", color: "var(--fg-code-muted)" },
  { name: "nums[j+1]", value: "?", color: "var(--fg-code-muted)" },
  { name: "swap?", value: "?", color: "var(--fg-code-muted)" },
];

const CONCEPTS = [
  { label: "Two nested loop counters", icon: "i, j" },
  { label: "Array state at each step", icon: "[ ]" },
  { label: "Which elements are compared", icon: ">" },
  { label: "Whether a swap occurs", icon: "⇄" },
  { label: "Current loop bounds", icon: "n-i" },
  { label: "Call stack depth", icon: "ƒ()" },
];

export function ProblemSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-12%" });

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: prefersReduced ? 0 : 24 },
    animate: isInView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  });

  const colorForType = (type: string) => {
    switch (type) {
      case "fn":      return "#C8956C";
      case "keyword": return "#9DCBCB";
      case "compare": return "rgba(180, 83, 9, 0.9)";
      case "swap":    return "rgba(45, 106, 48, 0.9)";
      default:        return "var(--fg-code-secondary)";
    }
  };

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative"
      style={{
        background: "var(--bg-code)",
        color: "var(--fg-code-primary)",
        padding: "var(--section-py) 1.5rem",
      }}
      aria-labelledby="problem-heading"
    >
      <div className="section-sep-dark absolute top-0 left-0 right-0" />

      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
        {/* Section label */}
        <motion.p
          {...fadeUp(0)}
          className="font-mono text-[11px] uppercase tracking-widest mb-6"
          style={{ color: "var(--fg-code-muted)" }}
        >
          01 — The Problem
        </motion.p>

        {/* Headline */}
        <motion.h2
          id="problem-heading"
          {...fadeUp(0.06)}
          className="font-heading mb-5"
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            color: "var(--fg-code-primary)",
          }}
        >
          You can read the code.
          <br />
          <span style={{ color: "var(--fg-code-secondary)" }}>
            Harder to see what's happening.
          </span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.12)}
          className="mb-16 leading-relaxed max-w-xl"
          style={{
            fontSize: "1rem",
            color: "var(--fg-code-secondary)",
            lineHeight: 1.7,
          }}
        >
          When an algorithm executes, it manages dozens of invisible operations
          simultaneously. Reading the code forces your brain to simulate all of
          them at once — without any external feedback.
        </motion.p>

        {/* Two column content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Code block — what you see */}
          <motion.div {...fadeUp(0.1)}>
            <p
              className="font-mono text-[11px] uppercase tracking-wider mb-4"
              style={{ color: "var(--fg-code-muted)" }}
            >
              What you see
            </p>
            <div
              className="rounded-md overflow-hidden"
              style={{
                background: "var(--bg-code-surface)",
                border: "1px solid var(--border-code-strong)",
              }}
            >
              {/* Chrome */}
              <div
                className="flex items-center gap-3 px-4 py-2.5"
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
                  bubble_sort.py
                </span>
              </div>

              {/* Code */}
              <div className="p-5">
                {CODE_LINES.map((line, i) => (
                  <div
                    key={i}
                    className="flex items-start font-mono text-[12.5px] leading-[1.75]"
                  >
                    <span
                      className="select-none w-6 shrink-0 text-[10px] pt-px mr-3 text-right"
                      style={{ color: "var(--border-code-strong)" }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: colorForType(line.type) }}>
                      {line.text}
                    </span>
                  </div>
                ))}

                {/* Mental model required */}
                <div
                  className="mt-5 pt-4"
                  style={{ borderTop: "1px solid var(--border-code)" }}
                >
                  <p
                    className="font-mono text-[10px] uppercase tracking-wider mb-3"
                    style={{ color: "var(--fg-code-muted)" }}
                  >
                    Mental state required:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {MENTAL_VARS.map((v) => (
                      <span
                        key={v.name}
                        className="font-mono text-[10px] px-2 py-0.5 rounded"
                        style={{
                          background: "var(--bg-code-raised)",
                          color: v.color,
                          border: "1px solid var(--border-code-strong)",
                        }}
                      >
                        {v.name} = {v.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What your brain tracks */}
          <div>
            <motion.p
              {...fadeUp(0.1)}
              className="font-mono text-[11px] uppercase tracking-wider mb-4"
              style={{ color: "var(--fg-code-muted)" }}
            >
              What your brain tracks simultaneously
            </motion.p>

            <div className="space-y-2">
              {CONCEPTS.map((concept, idx) => (
                <motion.div
                  key={concept.label}
                  initial={{ opacity: 0, x: prefersReduced ? 0 : -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: prefersReduced ? 0 : 0.45,
                    delay: prefersReduced ? 0 : idx * 0.07 + 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-center gap-4 py-3 px-4 rounded-md"
                  style={{
                    background: "var(--bg-code-surface)",
                    border: "1px solid var(--border-code)",
                  }}
                >
                  <span
                    className="font-mono text-[11px] w-8 shrink-0 text-center"
                    style={{ color: "var(--accent-amber)" }}
                  >
                    {concept.icon}
                  </span>
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--fg-code-secondary)" }}
                  >
                    {concept.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Insight callout */}
            <motion.div
              {...fadeUp(0.55)}
              className="mt-6 p-4 rounded-md"
              style={{
                background: "rgba(180, 83, 9, 0.06)",
                border: "1px solid rgba(180, 83, 9, 0.15)",
              }}
            >
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--fg-code-secondary)" }}
              >
                <span style={{ color: "rgba(180, 83, 9, 0.9)" }}>
                  That's cognitive overload.
                </span>{" "}
                No debugger. No external reference. Just the code and your
                imagination — hoping you don't lose track.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
