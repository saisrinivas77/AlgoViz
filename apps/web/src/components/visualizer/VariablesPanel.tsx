"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, Clock, ArrowRight } from "lucide-react";

interface VariableHistoryItem {
  stepIndex: number;
  value: any;
  line: number;
}

interface VariablesPanelProps {
  variables: Record<string, any>;
  previousVariables?: Record<string, any>;
  changedVariables?: string[];
  variableTypes?: Record<string, string>;
  variableHistory?: Record<string, VariableHistoryItem[]>;
  currentStepIndex?: number;
  onSeek?: (stepIndex: number) => void;
}

const C = {
  bg: "#141412",
  surface: "#1E1E1C",
  raised: "#252522",
  border: "#2E2E2C",
  borderStr: "#3E3E3A",
  textPri: "#E8E6E0",
  textSec: "#9E9E98",
  textMut: "#5E5E58",
  amber: "#B45309",
  amberFg: "#F5E6D0",
  amberBg: "rgba(180,83,9,0.12)",
} as const;

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  variables,
  previousVariables = {},
  changedVariables = [],
  variableTypes = {},
  variableHistory = {},
  currentStepIndex = 0,
  onSeek,
}) => {
  const [selectedVarForHistory, setSelectedVarForHistory] = useState<string | null>(null);

  const entries = Object.entries(variables);

  if (entries.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full font-mono text-[11px]"
        style={{ color: C.textMut }}
      >
        No variables in scope
      </div>
    );
  }

  const selectedHistory = selectedVarForHistory ? variableHistory[selectedVarForHistory] || [] : [];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative">
      {/* Grid of variables */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1.5">
          <AnimatePresence>
            {entries.map(([key, val]) => {
              const isArray = Array.isArray(val);
              const isChanged = changedVariables.includes(key);
              const prevVal = previousVariables[key];
              const varType = variableTypes[key] || (isArray ? "list" : typeof val);
              const historyCount = variableHistory[key]?.length || 0;

              const displayVal = isArray
                ? `[${(val as any[]).slice(0, 5).join(", ")}${val.length > 5 ? "…" : ""}]`
                : JSON.stringify(val);

              const displayPrev = prevVal !== undefined && prevVal !== val
                ? Array.isArray(prevVal)
                  ? `[${(prevVal as any[]).slice(0, 3).join(",")}]`
                  : JSON.stringify(prevVal)
                : null;

              return (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col p-2 rounded font-mono text-[10px] min-w-0 transition-colors group cursor-pointer"
                  style={{
                    background: isChanged ? C.amberBg : C.bg,
                    border: `1px solid ${isChanged ? "rgba(180,83,9,0.35)" : C.border}`,
                  }}
                  onClick={() => setSelectedVarForHistory(key)}
                  title={`Click to view '${key}' history over time`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="font-semibold truncate"
                      style={{ color: isChanged ? C.amberFg : C.amber }}
                    >
                      {key}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className="px-1 py-0.2 rounded text-[9px]"
                        style={{ background: C.raised, color: C.textMut }}
                      >
                        {varType}
                      </span>
                      {historyCount > 1 && (
                        <span
                          className="flex items-center text-[9px] gap-0.5 opacity-60 group-hover:opacity-100"
                          style={{ color: C.textSec }}
                        >
                          <History className="w-2.5 h-2.5" />
                          {historyCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-1 truncate">
                    {displayPrev && (
                      <>
                        <span className="line-through truncate text-[9px]" style={{ color: C.textMut }}>
                          {displayPrev}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                      </>
                    )}
                    <span
                      className="truncate font-semibold"
                      style={{ color: isChanged ? C.amberFg : isArray ? C.textMut : C.textPri }}
                    >
                      {displayVal}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Variable History Drawer */}
      <AnimatePresence>
        {selectedVarForHistory && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 bottom-0 top-0 z-20 flex flex-col p-3 shadow-2xl"
            style={{
              background: C.surface,
              borderTop: `1px solid ${C.borderStr}`,
            }}
          >
            <div className="flex items-center justify-between border-b pb-2 mb-2" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold" style={{ color: C.textPri }}>
                  Timeline History: <span style={{ color: C.amberFg }}>{selectedVarForHistory}</span>
                </span>
                <span className="text-[10px]" style={{ color: C.textMut }}>
                  ({selectedHistory.length} states)
                </span>
              </div>
              <button
                onClick={() => setSelectedVarForHistory(null)}
                className="p-1 rounded hover:bg-zinc-800 transition-colors"
                style={{ color: C.textSec }}
                aria-label="Close history"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px]">
              {selectedHistory.length === 0 ? (
                <div className="text-center py-4" style={{ color: C.textMut }}>
                  No history recorded for this variable.
                </div>
              ) : (
                selectedHistory.map((item, idx) => {
                  const isCurrent = item.stepIndex === currentStepIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => onSeek && onSeek(item.stepIndex)}
                      className="p-1.5 rounded flex items-center justify-between cursor-pointer transition-colors border"
                      style={{
                        background: isCurrent ? C.amberBg : C.raised,
                        borderColor: isCurrent ? "rgba(180,83,9,0.4)" : C.border,
                        color: isCurrent ? C.amberFg : C.textPri,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: isCurrent ? C.amberFg : C.amber }}>
                          Step {item.stepIndex + 1}
                        </span>
                        <span className="text-[9px]" style={{ color: C.textMut }}>
                          Line {item.line}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-semibold truncate max-w-[180px]">
                        <span>=</span>
                        <span className="truncate">
                          {Array.isArray(item.value)
                            ? `[${(item.value as any[]).slice(0, 4).join(",")}]`
                            : JSON.stringify(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
