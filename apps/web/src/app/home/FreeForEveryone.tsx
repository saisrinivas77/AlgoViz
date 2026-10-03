"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";

const PRINCIPLES = [
  {
    num: "01",
    headline: "No login required",
    body: "Open the playground and start immediately. No account, no setup, no friction. The tool is ready when you are.",
  },
  {
    num: "02",
    headline: "The core experience is free",
    body: "Code execution, step replay, variable tracking, and data structure visualization — the fundamental learning tools remain accessible.",
  },
  {
    num: "03",
    headline: "Built for developers, not marketers",
    body: "Write real Python code and get real execution traces. Not a drag-and-drop toy. Not a curated demo library.",
  },
] as const;

export function FreeForEveryone() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        background: "var(--bg-page)",
        color: "var(--fg-primary)",
        padding: "var(--section-py) 1.5rem",
      }}
      aria-labelledby="free-heading"
    >
      <div className="section-sep absolute top-0 left-0 right-0" />
      <div className="section-sep absolute bottom-0 left-0 right-0" />

      <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
        {/* Header */}
        <div className="max-w-xl mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] uppercase tracking-widest mb-6"
            style={{ color: "var(--fg-tertiary)" }}
          >
            06 — Our Philosophy
          </motion.p>

          <motion.h2
            id="free-heading"
            initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.65,
              delay: 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="font-heading mb-5"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--fg-primary)",
            }}
          >
            Understanding how your
            <br />
            code runs should be free.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.12 }}
            style={{ fontSize: "1rem", color: "var(--fg-secondary)", lineHeight: 1.65 }}
          >
            We're building this for students and developers who want to understand
            algorithms deeply. Core learning shouldn't start with a paywall.
          </motion.p>
        </div>

        {/* Three principles — editorial list */}
        <div className="space-y-0">
          {PRINCIPLES.map((p, idx) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: prefersReduced ? 0 : 0.5,
                delay: prefersReduced ? 0 : idx * 0.1 + 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="grid grid-cols-[48px_1fr] gap-8 py-8"
              style={{
                borderTop: "1px solid var(--border)",
              }}
            >
              {/* Number */}
              <div
                className="font-mono text-[11px] pt-0.5"
                style={{ color: "var(--fg-disabled)" }}
              >
                {p.num}
              </div>

              {/* Text */}
              <div>
                <h3
                  className="text-[16px] font-semibold mb-2"
                  style={{
                    color: "var(--fg-primary)",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {p.headline}
                </h3>
                <p
                  className="text-[14px] leading-relaxed max-w-lg"
                  style={{ color: "var(--fg-secondary)" }}
                >
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Final separator */}
          <div style={{ borderTop: "1px solid var(--border)" }} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <Link href="/playground" className="btn-primary text-[14px]">
            Try it — no account needed
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
