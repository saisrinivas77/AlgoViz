"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function FinalCTA() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: "var(--bg-code)",
        color: "var(--fg-code-primary)",
        padding: "clamp(100px, 14vw, 180px) 1.5rem",
      }}
      aria-labelledby="final-cta-heading"
    >
      <div className="section-sep-dark absolute top-0 left-0 right-0" />

      {/* Subtle background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-code) 1px, transparent 1px), linear-gradient(90deg, var(--border-code) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.5,
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div
        className="relative text-center"
        style={{ maxWidth: "48rem", margin: "0 auto" }}
      >
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="font-mono text-[11px] uppercase tracking-widest mb-8"
          style={{ color: "var(--fg-code-muted)" }}
        >
          Ready
        </motion.p>

        {/* Headline */}
        <motion.h2
          id="final-cta-heading"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="font-display mb-6"
          style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            color: "var(--fg-code-primary)",
          }}
        >
          Run your code.
          <br />
          <span style={{ color: "var(--fg-code-secondary)" }}>
            See what actually happens.
          </span>
        </motion.h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: prefersReduced ? 0 : 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.14 }}
          className="mb-10 leading-relaxed mx-auto max-w-md"
          style={{
            fontSize: "1.0625rem",
            color: "var(--fg-code-secondary)",
            lineHeight: 1.65,
          }}
        >
          Stop imagining the execution. Open the playground and watch your
          algorithm step through its own logic.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.24, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/playground" className="btn-primary-dark w-full sm:w-auto">
            Open Visualizer
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-dark w-full sm:w-auto"
          >
            View on GitHub
          </a>
        </motion.div>

        {/* Small note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-8 font-mono text-[11px]"
          style={{ color: "var(--fg-code-muted)" }}
        >
          No account · No installation · Start immediately
        </motion.p>
      </div>
    </section>
  );
}
