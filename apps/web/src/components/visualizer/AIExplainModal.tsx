"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Brain, Clock, HardDrive } from "lucide-react";

const C = {
  bg:        "#141412",
  surface:   "#1E1E1C",
  raised:    "#252522",
  border:    "#2E2E2C",
  borderStr: "#3E3E3A",
  textPri:   "#E8E6E0",
  textSec:   "#9E9E98",
  textMut:   "#5E5E58",
  amber:     "#B45309",
  amberFg:   "#F5E6D0",
  amberBg:   "rgba(180,83,9,0.10)",
  green:     "#2D6A30",
  greenFg:   "#D0F0D0",
} as const;

interface AIExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  stepIndex: number;
  currentEvent: any;
  variables: Record<string, any>;
}

export const AIExplainModal: React.FC<AIExplainModalProps> = ({
  isOpen,
  onClose,
  code,
  stepIndex,
  currentEvent,
  variables,
}) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);

  const fetchExplanation = async () => {
    setLoading(true);
    setExplanation(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/v1/ai/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          step_index: stepIndex,
          current_event: currentEvent || {},
          variables,
        }),
      });
      if (res.ok) setExplanation(await res.json());
    } catch {
      // Silent fail — UI shows fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchExplanation();
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.72)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg overflow-hidden rounded-lg shadow-2xl"
            style={{
              background: C.surface,
              border: `1px solid ${C.borderStr}`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${C.border}`, background: C.raised }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: C.amberBg,
                    border: `1px solid rgba(180,83,9,0.2)`,
                  }}
                >
                  <Brain className="w-3.5 h-3.5" style={{ color: C.amber }} aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="ai-modal-title"
                    className="text-[13px] font-semibold"
                    style={{ color: C.textPri, letterSpacing: "-0.01em" }}
                  >
                    AI Explanation
                  </h2>
                  <p className="text-[10px] font-mono" style={{ color: C.textMut }}>
                    Step {stepIndex + 1}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded transition-colors focus-visible:outline-none"
                style={{ color: C.textMut }}
                aria-label="Close AI explanation"
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = C.textPri)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = C.textMut)}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="relative w-10 h-10">
                    <div
                      className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: `${C.border} ${C.border} ${C.border} ${C.amber}` }}
                    />
                    <Sparkles
                      className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ color: C.amber }}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-[11px] font-mono" style={{ color: C.textMut }}>
                    Analyzing execution trace...
                  </p>
                </div>
              ) : explanation ? (
                <div className="space-y-3 text-[13px]" aria-live="polite">
                  {/* Summary */}
                  <div
                    className="p-4 rounded"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}
                  >
                    <h3
                      className="text-[10px] font-semibold uppercase tracking-wider mb-2 font-mono"
                      style={{ color: C.amber }}
                    >
                      Step Summary
                    </h3>
                    <p className="leading-relaxed" style={{ color: C.textSec }}>
                      {explanation.summary}
                    </p>
                  </div>

                  {/* Reasoning */}
                  {explanation.reasoning && (
                    <div
                      className="p-4 rounded"
                      style={{ background: C.bg, border: `1px solid ${C.border}` }}
                    >
                      <h3
                        className="text-[10px] font-semibold uppercase tracking-wider mb-2 font-mono"
                        style={{ color: C.textSec }}
                      >
                        Algorithmic Reasoning
                      </h3>
                      <p className="text-[12px] leading-relaxed" style={{ color: C.textSec }}>
                        {explanation.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Complexity */}
                  <div className="grid grid-cols-2 gap-3">
                    {explanation.time_complexity && (
                      <div
                        className="flex items-center gap-3 p-3 rounded"
                        style={{ background: C.bg, border: `1px solid ${C.border}` }}
                      >
                        <Clock
                          className="w-4 h-4 shrink-0"
                          style={{ color: C.amber }}
                          aria-hidden="true"
                        />
                        <div>
                          <div
                            className="text-[9px] uppercase font-semibold tracking-wider mb-0.5 font-mono"
                            style={{ color: C.textMut }}
                          >
                            Time
                          </div>
                          <div
                            className="font-mono text-[12px] font-semibold"
                            style={{ color: C.textPri }}
                          >
                            {explanation.time_complexity}
                          </div>
                        </div>
                      </div>
                    )}
                    {explanation.space_complexity && (
                      <div
                        className="flex items-center gap-3 p-3 rounded"
                        style={{ background: C.bg, border: `1px solid ${C.border}` }}
                      >
                        <HardDrive
                          className="w-4 h-4 shrink-0"
                          style={{ color: C.green }}
                          aria-hidden="true"
                        />
                        <div>
                          <div
                            className="text-[9px] uppercase font-semibold tracking-wider mb-0.5 font-mono"
                            style={{ color: C.textMut }}
                          >
                            Space
                          </div>
                          <div
                            className="font-mono text-[12px] font-semibold"
                            style={{ color: C.textPri }}
                          >
                            {explanation.space_complexity}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="text-center py-8 text-[12px] font-mono"
                  aria-live="polite"
                  style={{ color: C.textMut }}
                >
                  Unable to load explanation. Is the API server running?
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
