"use client";

import React, { useState } from "react";
import { ReplayStateSnapshot } from "@algoviz/visualizer-core";
import { HelpCircle, Sparkles, ArrowRight, Activity, GitCommit } from "lucide-react";

interface BeginnerExplanationPanelProps {
  snapshot: ReplayStateSnapshot;
}

type ExplanationLevel = "beginner" | "intermediate" | "detailed";

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
  greenFg: "#D0F0D0",
  blueFg: "#D0E6F0",
} as const;

export const BeginnerExplanationPanel: React.FC<BeginnerExplanationPanelProps> = ({ snapshot }) => {
  const [level, setLevel] = useState<ExplanationLevel>("beginner");

  const explanations = snapshot.explanation || {
    beginner: { what: "Step execution.", why: "Program sequence.", changed: "None.", next: "Next line." },
    intermediate: { what: "Step execution.", why: "Program sequence.", changed: "None.", next: "Next line." },
    detailed: { what: "Step execution.", why: "Program sequence.", changed: "None.", next: "Next line." },
  };

  const currentExp = explanations[level] || explanations.beginner;
  const lineNo = snapshot.highlightedLine?.line;
  const eventType = snapshot.currentEvent?.type || "line.execute";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header bar with Level selector and metadata */}
      <div
        className="px-3 py-1.5 flex items-center justify-between border-b shrink-0 gap-2"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="flex items-center gap-2">
          {lineNo && (
            <span
              className="px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold"
              style={{ background: C.raised, color: C.amberFg, border: `1px solid ${C.border}` }}
            >
              Line {lineNo}
            </span>
          )}
          <span
            className="px-1.5 py-0.5 rounded font-mono text-[10px]"
            style={{ background: C.raised, color: C.textSec }}
          >
            {eventType}
          </span>
        </div>

        {/* Level selector */}
        <div
          className="flex items-center p-0.5 rounded"
          style={{ background: C.raised, border: `1px solid ${C.border}` }}
          role="group"
          aria-label="Explanation detail level"
        >
          {(["beginner", "intermediate", "detailed"] as ExplanationLevel[]).map((lvl) => {
            const active = level === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                aria-pressed={active}
                className="px-2 py-0.5 text-[10px] capitalize rounded transition-all font-medium"
                style={{
                  background: active ? C.amber : "transparent",
                  color: active ? "#FFF" : C.textMut,
                }}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Core Questions Grid */}
      <div className="flex-1 p-3 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
        {/* 1. What is happening? */}
        <div
          className="p-2.5 rounded flex flex-col gap-1 border"
          style={{ background: C.raised, borderColor: C.border }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider" style={{ color: C.amberFg }}>
            <Activity className="w-3 h-3 text-amber-500" />
            <span>1. What is happening?</span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: C.textPri }}>
            {currentExp.what}
          </p>
        </div>

        {/* 2. Why? */}
        <div
          className="p-2.5 rounded flex flex-col gap-1 border"
          style={{ background: C.raised, borderColor: C.border }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider" style={{ color: C.blueFg }}>
            <HelpCircle className="w-3 h-3 text-blue-400" />
            <span>2. Why?</span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: C.textPri }}>
            {currentExp.why}
          </p>
        </div>

        {/* 3. What changed? */}
        <div
          className="p-2.5 rounded flex flex-col gap-1 border"
          style={{ background: C.raised, borderColor: C.border }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider" style={{ color: C.greenFg }}>
            <GitCommit className="w-3 h-3 text-green-400" />
            <span>3. What changed?</span>
          </div>
          <p className="text-[12px] font-mono leading-relaxed" style={{ color: C.textPri }}>
            {currentExp.changed}
          </p>
        </div>

        {/* 4. What happens next? */}
        <div
          className="p-2.5 rounded flex flex-col gap-1 border"
          style={{ background: C.raised, borderColor: C.border }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider" style={{ color: C.textSec }}>
            <ArrowRight className="w-3 h-3 text-zinc-400" />
            <span>4. What happens next?</span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: C.textPri }}>
            {currentExp.next}
          </p>
        </div>
      </div>
    </div>
  );
};
