"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const ARCH_STAGES = [
  {
    id: "code",
    num: "01",
    label: "Source Code",
    desc: "Standard Python — no special syntax required.",
    detail:
      "You write normal Python code. No decorators, no imports, no modifications. The same code you'd run anywhere.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M5 5l-3 4 3 4M13 5l3 4-3 4M10 3l-2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "ast",
    num: "02",
    label: "AST Parser",
    desc: "Abstract Syntax Tree instrumentation.",
    detail:
      "Python's ast module parses source into a syntax tree. Execution hooks are injected at every meaningful node — without altering program logic or output.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="4" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 6v4M9 10l-3 2M9 10l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "sandbox",
    num: "03",
    label: "Secure Sandbox",
    desc: "Isolated execution with resource limits.",
    detail:
      "Execution runs in an isolated container with strict import blocking, CPU and memory cgroup limits, and timeout enforcement. Your code cannot escape.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2L3 5v4c0 3.3 2.4 6.4 6 7 3.6-.6 6-3.7 6-7V5l-6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6.5 9l2 2L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "trace",
    num: "04",
    label: "Runtime Trace",
    desc: "Deterministic DVIR event stream.",
    detail:
      "Every variable assignment, array mutation, function call, and line execution is captured as a typed event in the DVIR (Data Visualizer Intermediate Representation) format.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <polyline points="2,12 5,8 8,10 11,5 14,7 16,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "state",
    num: "05",
    label: "State Model",
    desc: "Computed replay snapshot at any step.",
    detail:
      "The trace is replayed from step 0 to N to compute the exact program state at any point in time — variables, arrays, call stack, and current line.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2" y="6" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 9h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "viz",
    num: "06",
    label: "Visualization",
    desc: "Animated, interactive step playback.",
    detail:
      "React components render the state model — array bars animate, variable panels update, code lines highlight, and the timeline advances. All synchronized to the trace.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2" y="10" width="3" height="6" rx="1" fill="currentColor" opacity=".35" />
        <rect x="7" y="6" width="3" height="10" rx="1" fill="currentColor" opacity=".65" />
        <rect x="12" y="2" width="3" height="14" rx="1" fill="currentColor" />
      </svg>
    ),
  },
] as const;

export function EngineeringSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const active = ARCH_STAGES.find((s) => s.id === activeStage);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        background: "var(--bg-code)",
        color: "var(--fg-code-primary)",
        padding: "var(--section-py) 1.5rem",
      }}
      aria-labelledby="engineering-heading"
    >
      <div className="section-sep-dark absolute top-0 left-0 right-0" />

      <div style={{ maxWidth: "68rem", margin: "0 auto" }}>
        {/* Header */}
        <div className="max-w-xl mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] uppercase tracking-widest mb-6"
            style={{ color: "var(--fg-code-muted)" }}
          >
            07 — Engineering
          </motion.p>

          <motion.h2
            id="engineering-heading"
            initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="font-heading mb-4"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--fg-code-primary)",
            }}
          >
            Built on a real
            <br />
            <span style={{ color: "var(--fg-code-secondary)" }}>
              execution engine.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.12 }}
            className="text-[13px] leading-relaxed"
            style={{ color: "var(--fg-code-secondary)" }}
          >
            Hover any stage to understand how the pipeline works.
          </motion.p>
        </div>

        {/* Pipeline + detail panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          {/* Pipeline */}
          <div className="space-y-1.5">
            {ARCH_STAGES.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <motion.button
                  initial={{ opacity: 0, x: prefersReduced ? 0 : -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: prefersReduced ? 0 : 0.45,
                    delay: prefersReduced ? 0 : idx * 0.06 + 0.1,
                  }}
                  onMouseEnter={() => setActiveStage(stage.id)}
                  onMouseLeave={() => setActiveStage(null)}
                  onFocus={() => setActiveStage(stage.id)}
                  onBlur={() => setActiveStage(null)}
                  className="w-full flex items-center gap-4 p-3.5 rounded text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  style={{
                    background:
                      activeStage === stage.id
                        ? "var(--bg-code-surface)"
                        : "var(--bg-code-raised)",
                    border: `1px solid ${
                      activeStage === stage.id
                        ? "var(--border-code-strong)"
                        : "var(--border-code)"
                    }`,
                    borderLeft: `3px solid ${
                      activeStage === stage.id
                        ? "var(--accent-amber)"
                        : "transparent"
                    }`,
                  }}
                  aria-label={`${stage.label}: ${stage.desc}`}
                >
                  {/* Number + icon */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="font-mono text-[10px] w-5 text-right shrink-0"
                      style={{ color: "var(--fg-code-muted)" }}
                    >
                      {stage.num}
                    </span>
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        background:
                          activeStage === stage.id
                            ? "rgba(180,83,9,0.12)"
                            : "var(--bg-code)",
                        color:
                          activeStage === stage.id
                            ? "var(--accent-amber)"
                            : "var(--fg-code-muted)",
                        border: `1px solid ${
                          activeStage === stage.id
                            ? "rgba(180,83,9,0.2)"
                            : "var(--border-code)"
                        }`,
                      }}
                    >
                      {stage.icon}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-medium"
                      style={{
                        color:
                          activeStage === stage.id
                            ? "var(--fg-code-primary)"
                            : "var(--fg-code-secondary)",
                      }}
                    >
                      {stage.label}
                    </div>
                    <div
                      className="text-[11px] mt-0.5"
                      style={{ color: "var(--fg-code-muted)" }}
                    >
                      {stage.desc}
                    </div>
                  </div>

                  {/* Arrow */}
                  <span
                    className="text-[13px] shrink-0 transition-colors"
                    style={{
                      color:
                        activeStage === stage.id
                          ? "var(--accent-amber)"
                          : "var(--fg-code-muted)",
                    }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </motion.button>

                {/* Connector line */}
                {idx < ARCH_STAGES.length - 1 && (
                  <div
                    className="flex items-center pl-[52px]"
                    aria-hidden="true"
                  >
                    <div
                      className="w-px h-2.5"
                      style={{ background: "var(--border-code)" }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div
              className="rounded-md p-5 flex flex-col justify-center"
              style={{
                background: "var(--bg-code-surface)",
                border: "1px solid var(--border-code-strong)",
                minHeight: 180,
              }}
            >
              {active ? (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center mb-4"
                    style={{
                      background: "rgba(180,83,9,0.1)",
                      color: "var(--accent-amber)",
                      border: "1px solid rgba(180,83,9,0.2)",
                    }}
                    aria-hidden="true"
                  >
                    {active.icon}
                  </div>
                  <h3
                    className="text-[13px] font-semibold mb-2"
                    style={{ color: "var(--fg-code-primary)" }}
                  >
                    {active.label}
                  </h3>
                  <p
                    className="text-[12.5px] leading-relaxed"
                    style={{ color: "var(--fg-code-secondary)" }}
                  >
                    {active.detail}
                  </p>
                </motion.div>
              ) : (
                <div className="text-center">
                  <p
                    className="font-mono text-[11px]"
                    style={{ color: "var(--fg-code-muted)" }}
                  >
                    Hover a stage
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
