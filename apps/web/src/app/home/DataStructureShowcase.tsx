"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";

// ── Data structure definitions ────────────────────────────────────────────────

const DS_ITEMS = [
  {
    id: "arrays",
    label: "Arrays",
    desc: "Index-based access, comparisons, swaps",
    visual: (
      <div className="flex items-center gap-1.5">
        {[4, 7, 2, 9, 1, 5].map((v, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded flex items-center justify-center font-mono text-[10px] font-semibold"
            style={{
              background: i === 2 ? "rgba(180,83,9,0.15)" : "var(--bg-raised)",
              color: i === 2 ? "var(--accent-amber)" : "var(--fg-secondary)",
              border: `1px solid ${
                i === 2 ? "rgba(180,83,9,0.25)" : "var(--border)"
              }`,
            }}
          >
            {v}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "sorting",
    label: "Sorting",
    desc: "Bubble, merge, quick, insertion sort",
    visual: (
      <div className="flex items-end gap-1 h-8">
        {[1, 3, 5, 7, 9, 11].map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${(v / 11) * 100}%`,
              background: i === 3 ? "rgba(45,106,48,0.4)" : "var(--bg-raised)",
              border: `1px solid ${
                i === 3 ? "rgba(45,106,48,0.3)" : "var(--border)"
              }`,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    id: "binary-search",
    label: "Binary Search",
    desc: "Left, right, mid pointer tracking",
    visual: (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {[2, 5, 8, 12, 17, 21, 30].map((v, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded flex items-center justify-center font-mono text-[9px] font-medium"
              style={{
                background: i === 3 ? "rgba(180,83,9,0.15)" : "var(--bg-raised)",
                color: i === 3 ? "var(--accent-amber)" : "var(--fg-tertiary)",
                border: `1px solid ${
                  i === 3 ? "rgba(180,83,9,0.25)" : "var(--border)"
                }`,
              }}
            >
              {v}
            </div>
          ))}
        </div>
        <div className="flex gap-1 font-mono text-[8px]" style={{ color: "var(--fg-disabled)" }}>
          <span style={{ marginLeft: 0 }}>L</span>
          <span style={{ marginLeft: 52 }}>M</span>
          <span style={{ marginLeft: 36 }}>R</span>
        </div>
      </div>
    ),
  },
  {
    id: "linked-lists",
    label: "Linked Lists",
    desc: "Node traversal, pointer manipulation",
    visual: (
      <div className="flex items-center gap-1">
        {[3, 7, 1, 9].map((v, i) => (
          <React.Fragment key={i}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-semibold"
              style={{
                background: "var(--bg-raised)",
                color: "var(--fg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {v}
            </div>
            {i < 3 && (
              <span className="font-mono text-[11px]" style={{ color: "var(--fg-disabled)" }}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
        <span className="font-mono text-[11px]" style={{ color: "var(--fg-disabled)" }}>
          ∅
        </span>
      </div>
    ),
  },
  {
    id: "stacks",
    label: "Stacks",
    desc: "LIFO push/pop operations",
    visual: (
      <div className="flex flex-col gap-0.5">
        {["TOP →  C", "        B", "        A"].map((v, i) => (
          <div
            key={i}
            className="h-5 px-3 flex items-center rounded font-mono text-[9px]"
            style={{
              background: i === 0 ? "var(--bg-raised)" : "var(--bg-surface)",
              color: i === 0 ? "var(--fg-secondary)" : "var(--fg-disabled)",
              border: `1px solid ${i === 0 ? "var(--border-strong)" : "var(--border)"}`,
            }}
          >
            {v}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "queues",
    label: "Queues",
    desc: "FIFO enqueue/dequeue",
    visual: (
      <div className="flex items-center gap-1">
        <span className="font-mono text-[9px]" style={{ color: "var(--fg-disabled)" }}>
          IN→
        </span>
        {["A", "B", "C", "D"].map((v, i) => (
          <div
            key={i}
            className="w-6 h-6 flex items-center justify-center rounded font-mono text-[10px] font-semibold"
            style={{
              background: "var(--bg-raised)",
              color: "var(--fg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {v}
          </div>
        ))}
        <span className="font-mono text-[9px]" style={{ color: "var(--fg-disabled)" }}>
          →OUT
        </span>
      </div>
    ),
  },
  {
    id: "trees",
    label: "Binary Trees",
    desc: "BST, traversals (in/pre/post-order)",
    visual: (
      <svg viewBox="0 0 80 48" className="w-full h-10" aria-hidden="true">
        {/* Edges */}
        <line x1="40" y1="10" x2="20" y2="30" stroke="var(--border-strong)" strokeWidth="1" />
        <line x1="40" y1="10" x2="60" y2="30" stroke="var(--border-strong)" strokeWidth="1" />
        <line x1="20" y1="34" x2="10" y2="46" stroke="var(--border)" strokeWidth="1" />
        <line x1="20" y1="34" x2="30" y2="46" stroke="var(--border)" strokeWidth="1" />
        {/* Nodes */}
        <circle cx="40" cy="8" r="7" fill="var(--bg-raised)" stroke="var(--border-strong)" strokeWidth="1" />
        <text x="40" y="12" textAnchor="middle" fontSize="7" fill="var(--fg-secondary)">5</text>
        <circle cx="20" cy="32" r="6" fill="var(--bg-raised)" stroke="var(--border)" strokeWidth="1" />
        <text x="20" y="36" textAnchor="middle" fontSize="7" fill="var(--fg-tertiary)">3</text>
        <circle cx="60" cy="32" r="6" fill="var(--bg-raised)" stroke="var(--border)" strokeWidth="1" />
        <text x="60" y="36" textAnchor="middle" fontSize="7" fill="var(--fg-tertiary)">8</text>
      </svg>
    ),
  },
  {
    id: "graphs",
    label: "Graphs",
    desc: "BFS, DFS, shortest path",
    visual: (
      <svg viewBox="0 0 80 48" className="w-full h-10" aria-hidden="true">
        <line x1="15" y1="12" x2="40" y2="35" stroke="var(--border)" strokeWidth="1" />
        <line x1="65" y1="12" x2="40" y2="35" stroke="var(--border)" strokeWidth="1" />
        <line x1="15" y1="12" x2="65" y2="12" stroke="var(--border)" strokeWidth="1" />
        <line x1="40" y1="35" x2="55" y2="44" stroke="var(--border)" strokeWidth="1" />
        {[
          { cx: 15, cy: 12 },
          { cx: 65, cy: 12 },
          { cx: 40, cy: 35 },
          { cx: 55, cy: 44 },
        ].map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r="5"
            fill={i === 2 ? "rgba(45,106,48,0.15)" : "var(--bg-raised)"}
            stroke={i === 2 ? "rgba(45,106,48,0.3)" : "var(--border-strong)"}
            strokeWidth="1"
          />
        ))}
      </svg>
    ),
  },
] as const;

// ── Showcase item ─────────────────────────────────────────────────────────────
function DSItem({
  item,
  index,
  isInView,
  isSelected,
  onSelect,
}: {
  item: (typeof DS_ITEMS)[number];
  index: number;
  isInView: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: prefersReduced ? 0 : 0.45,
        delay: prefersReduced ? 0 : index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onSelect}
      className="w-full text-left p-4 rounded transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
      style={{
        background: isSelected ? "var(--bg-raised)" : "var(--bg-surface)",
        border: `1px solid ${isSelected ? "var(--border-strong)" : "var(--border)"}`,
        borderLeft: `3px solid ${isSelected ? "var(--accent-amber)" : "transparent"}`,
        cursor: "pointer",
      }}
      aria-selected={isSelected}
    >
      <div
        className="text-[13px] font-medium mb-0.5"
        style={{ color: "var(--fg-primary)" }}
      >
        {item.label}
      </div>
      <div className="text-[11px]" style={{ color: "var(--fg-tertiary)" }}>
        {item.desc}
      </div>
    </motion.button>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export function DataStructureShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const prefersReduced = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>("arrays");

  const selectedItem = DS_ITEMS.find((i) => i.id === selectedId) ?? DS_ITEMS[0];

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="relative"
      style={{
        background: "var(--bg-page)",
        color: "var(--fg-primary)",
        padding: "var(--section-py) 1.5rem",
      }}
      aria-labelledby="showcase-heading"
    >
      <div className="section-sep absolute top-0 left-0 right-0" />
      <div className="section-sep absolute bottom-0 left-0 right-0" />

      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] uppercase tracking-widest mb-6"
            style={{ color: "var(--fg-tertiary)" }}
          >
            04 — What You Can Visualize
          </motion.p>

          <motion.h2
            id="showcase-heading"
            initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading mb-4"
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--fg-primary)",
            }}
          >
            Every data structure.
            <br />
            <span style={{ color: "var(--fg-secondary)" }}>Your implementation.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.12 }}
            style={{ fontSize: "1rem", color: "var(--fg-secondary)", lineHeight: 1.65 }}
          >
            Write your own implementation and watch it come alive. Not pre-recorded
            demos — your actual code, your actual data.
          </motion.p>
        </div>

        {/* Two-column: list left, preview right */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left: DS list */}
          <div className="space-y-1.5">
            {DS_ITEMS.map((item, idx) => (
              <DSItem
                key={item.id}
                item={item}
                index={idx}
                isInView={isInView}
                isSelected={selectedId === item.id}
                onSelect={() => setSelectedId(item.id)}
              />
            ))}
          </div>

          {/* Right: Selected visual preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="rounded-md p-8 flex flex-col justify-between"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              minHeight: 280,
            }}
          >
            <div>
              <p
                className="font-mono text-[11px] uppercase tracking-wider mb-2"
                style={{ color: "var(--fg-tertiary)" }}
              >
                {selectedItem.label}
              </p>
              <p
                className="text-[13px] mb-8"
                style={{ color: "var(--fg-secondary)" }}
              >
                {selectedItem.desc}
              </p>

              {/* Visual */}
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center py-8"
                style={{
                  background: "var(--bg-page)",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                {selectedItem.visual}
              </motion.div>
            </div>

            <div className="mt-6">
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 text-[13px] font-medium transition-opacity"
                style={{ color: "var(--fg-secondary)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--fg-primary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--fg-secondary)")
                }
              >
                Visualize {selectedItem.label} in the playground
                <span style={{ color: "var(--fg-disabled)" }}>→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
