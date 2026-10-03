"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrayVisualizationState } from "@algoviz/visualizer-core";

// ── Theme constants ───────────────────────────────────────────────────────────
const C = {
  // Base surfaces
  bg:         "#141412",
  surface:    "#1E1E1C",
  raised:     "#252522",
  // Borders
  border:     "#2E2E2C",
  borderStr:  "#3E3E3A",
  // Text
  textPri:    "#E8E6E0",
  textSec:    "#9E9E98",
  textMut:    "#5E5E58",
  // Semantic accents — warm-neutral theme
  amber:      "#B45309",
  amberFg:    "#F5E6D0",
  amberBg:    "rgba(180,83,9,0.12)",
  amberBord:  "rgba(180,83,9,0.28)",
  green:      "#2D6A30",
  greenFg:    "#D0F0D0",
  greenBg:    "rgba(45,106,48,0.14)",
  greenBord:  "rgba(45,106,48,0.28)",
  red:        "#B91C1C",
  redFg:      "#FFE4E4",
  redBg:      "rgba(185,28,28,0.12)",
  redBord:    "rgba(185,28,28,0.28)",
} as const;

interface ArrayVisualizerProps {
  arrayState: ArrayVisualizationState;
  availableArrays?: string[];
  selectedArray?: string;
  onSelectArray?: (name: string) => void;
  activeArrayNames?: string[];
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  arrayState,
  availableArrays = [],
  selectedArray,
  onSelectArray,
  activeArrayNames = [],
}) => {
  const { targetName, elements, pointerLabels } = arrayState;

  if (!elements || elements.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-3"
        style={{ color: C.textMut, fontFamily: "var(--font-mono)" }}
      >
        <span className="text-[13px]">No array data in scope.</span>
        {availableArrays.length > 0 && onSelectArray && (
          <div className="flex items-center gap-2">
            <span className="text-[11px]">Switch to:</span>
            {availableArrays.map((name) => (
              <button
                key={name}
                onClick={() => onSelectArray(name)}
                className="text-[11px] font-mono px-2 py-0.5 rounded transition-colors"
                style={{
                  background: C.raised,
                  color: C.amber,
                  border: `1px solid ${C.amberBord}`,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = C.surface)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = C.raised)
                }
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const maxVal = Math.max(
    ...elements.map((e) => (typeof e.value === "number" ? Math.abs(e.value) : 10)),
    1
  );

  // Current operation state
  const swapActive = !!arrayState.swapIndices;
  const compareActive = !!arrayState.comparingIndices && !swapActive;

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}
    >
      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{
          background: C.raised,
          borderBottom: `1px solid ${C.border}`,
          borderRadius: "8px 8px 0 0",
        }}
      >
        {/* Array selector / label */}
        <div className="flex items-center gap-2">
          {availableArrays.length > 1 && onSelectArray ? (
            <div
              className="flex items-center gap-1 p-0.5 rounded"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}
            >
              <span
                className="text-[10px] font-mono px-1.5 uppercase"
                style={{ color: C.textMut }}
              >
                Arrays:
              </span>
              {availableArrays.map((name) => {
                const isSelected = (selectedArray || targetName) === name;
                const isActive = activeArrayNames.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => onSelectArray(name)}
                    className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded transition-all"
                    style={{
                      background: isSelected ? C.amber : "transparent",
                      color: isSelected ? "#fff" : C.textSec,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {name}
                    {isActive && (
                      <span
                        className="w-1 h-1 rounded-full animate-pulse"
                        style={{ background: C.amberFg }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded"
              style={{ background: C.bg, color: C.amber, border: `1px solid ${C.amberBord}` }}
            >
              {targetName}
            </span>
          )}
          <span className="text-[10px] font-mono" style={{ color: C.textMut }}>
            [{elements.length}]
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: C.red }}
            />
            <span style={{ color: C.textSec }}>Active</span>
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: C.amber }}
            />
            <span style={{ color: C.textSec }}>Compare</span>
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: C.green }}
            />
            <span style={{ color: C.textSec }}>Swap</span>
          </span>
        </div>
      </div>

      {/* ── State status bar ───────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0 text-[11px] font-mono"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        {swapActive ? (
          <span className="flex items-center gap-2" style={{ color: C.greenFg }}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ background: C.green }}
            />
            Swapping [{arrayState.swapIndices![0]}] ⇄ [{arrayState.swapIndices![1]}]
          </span>
        ) : compareActive ? (
          <span className="flex items-center gap-2" style={{ color: C.amberFg }}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: C.amber }}
            />
            Comparing [{arrayState.comparingIndices![0]}] vs [{arrayState.comparingIndices![1]}]
          </span>
        ) : arrayState.activeIndices.length > 0 ? (
          <span className="flex items-center gap-2" style={{ color: C.redFg }}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: C.red }}
            />
            Active at [{arrayState.activeIndices.join(", ")}]
          </span>
        ) : Object.keys(pointerLabels).length > 0 ? (
          <span className="flex items-center gap-2" style={{ color: C.textSec }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.textMut }} />
            Pointers: {Object.entries(pointerLabels).map(([i, n]) => `${n}→[${i}]`).join(", ")}
          </span>
        ) : (
          <span style={{ color: C.textMut }}>Ready</span>
        )}

        <span style={{ color: C.textMut }}>
          {elements.length} elements
        </span>
      </div>

      {/* ── Array bars ─────────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-end justify-center gap-2 px-6 py-8 overflow-x-auto"
        style={{ minHeight: 190 }}
      >
        {elements.map((elem, idx) => {
          const heightPct = typeof elem.value === "number"
            ? Math.max(14, (Math.abs(elem.value) / maxVal) * 100)
            : 40;

          const isSwapping  = elem.status === "swapping";
          const isComparing = elem.status === "comparing";
          const isActive    = elem.status === "active";
          const ptrName     = pointerLabels[idx];

          // Determine styling
          let barBg: string;
          let barBorder: string;
          let barColor: string;
          let badge: string | null = null;
          let yOffset = 0;
          let scale = 1;

          if (isSwapping) {
            barBg     = C.greenBg;
            barBorder = C.greenBord;
            barColor  = C.greenFg;
            badge     = "⇄";
            // Stagger elevation so swapping elements glide past each other on distinct visual planes
            const isFirstSwapper = arrayState.swapIndices && arrayState.swapIndices[0] === idx;
            yOffset   = isFirstSwapper ? -18 : -10;
            scale     = 1.05;
          } else if (isComparing) {
            barBg     = C.amberBg;
            barBorder = C.amberBord;
            barColor  = C.amberFg;
            badge     = "VS";
            yOffset   = -7;
            scale     = 1.03;
          } else if (isActive) {
            barBg     = C.redBg;
            barBorder = C.redBord;
            barColor  = C.redFg;
            badge     = ptrName ? `[${ptrName}]` : "↑";
            yOffset   = -4;
            scale     = 1.02;
          } else {
            barBg     = C.raised;
            barBorder = C.border;
            barColor  = C.textSec;
          }

          return (
            <motion.div
              key={elem.id || `idx_${idx}`}
              layout="position"
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                  mass: 0.9,
                },
              }}
              className="flex flex-col items-center relative"
              style={{
                minWidth: 42,
                flex: "1 1 0%",
                maxWidth: 74,
                zIndex: isSwapping ? 20 : isComparing ? 10 : isActive ? 5 : 1,
              }}
            >
              {/* Badge */}
              <AnimatePresence>
                {badge && (
                  <motion.span
                    key={badge}
                    initial={{ opacity: 0, y: 6, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.22 }}
                    className="absolute font-mono text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none shadow-sm"
                    style={{
                      top: -24,
                      background: isSwapping ? C.greenBg : isComparing ? C.amberBg : C.redBg,
                      color: isSwapping ? C.greenFg : isComparing ? C.amberFg : C.redFg,
                      border: `1px solid ${isSwapping ? C.greenBord : isComparing ? C.amberBord : C.redBord}`,
                      zIndex: 30,
                    }}
                  >
                    {badge}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Bar */}
              <motion.div
                animate={{
                  y: yOffset,
                  scale,
                  height: `${heightPct}%`,
                  backgroundColor: barBg,
                  borderColor: barBorder,
                  boxShadow: isSwapping
                    ? "0 0 22px rgba(45,106,48,0.45), 0 8px 16px rgba(0,0,0,0.3)"
                    : isComparing
                    ? "0 0 16px rgba(180,83,9,0.35), 0 4px 10px rgba(0,0,0,0.2)"
                    : isActive
                    ? "0 0 14px rgba(185,28,28,0.35)"
                    : "0 2px 4px rgba(0,0,0,0.15)",
                }}
                transition={{
                  y: { type: "spring", stiffness: 180, damping: 20 },
                  scale: { duration: 0.3 },
                  height: { duration: 0.45, ease: "easeInOut" },
                  backgroundColor: { duration: 0.28 },
                  borderColor: { duration: 0.28 },
                  boxShadow: { duration: 0.35 },
                }}
                className="w-full rounded-md flex items-end justify-center select-none relative"
                style={{
                  minHeight: 48,
                  borderWidth: 1,
                  borderStyle: "solid",
                  paddingBottom: 6,
                }}
              >
                <span
                  className="font-mono text-[11px] font-semibold select-none"
                  style={{ color: barColor }}
                >
                  {elem.value}
                </span>
              </motion.div>

              {/* Index */}
              <span
                className="font-mono text-[10px] mt-2 select-none"
                style={{ color: isActive ? C.redFg : C.textMut }}
              >
                [{idx}]
              </span>

              {/* Pointer label */}
              {ptrName && (
                <motion.span
                  initial={{ opacity: 0, y: 3, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-[9px] font-semibold mt-0.5 px-1.5 py-0.5 rounded select-none shadow-sm"
                  style={{
                    background: C.amberBg,
                    color: C.amber,
                    border: `1px solid ${C.amberBord}`,
                  }}
                >
                  ↑ {ptrName}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
