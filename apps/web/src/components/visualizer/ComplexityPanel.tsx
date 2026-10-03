"use client";

import React, { useState } from "react";
import { ComplexityAnalysis } from "@algoviz/dvir";
import { Cpu, CheckCircle2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface ComplexityPanelProps {
  complexity: ComplexityAnalysis | null;
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
  green: "#2D6A30",
  greenFg: "#D0F0D0",
} as const;

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ complexity }) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  if (!complexity) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Cpu className="w-6 h-6 mb-2" style={{ color: C.textMut }} />
        <span className="text-[12px] font-medium" style={{ color: C.textSec }}>
          Complexity Analysis Ready
        </span>
        <span className="text-[10px] max-w-xs mt-1" style={{ color: C.textMut }}>
          Execute code to perform AST static and empirical runtime complexity analysis.
        </span>
      </div>
    );
  }

  const isHighConf = complexity.confidence === "high";
  const isMedConf = complexity.confidence === "medium";

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto p-3 text-[11px]">
      {/* Top summary row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Time Complexity Card */}
        <div
          className="p-3 rounded flex flex-col justify-between border"
          style={{ background: C.raised, borderColor: C.border }}
        >
          <span className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: C.textMut }}>
            Time Complexity
          </span>
          <span className="text-xl font-bold font-mono my-1" style={{ color: C.amberFg }}>
            {complexity.timeComplexity}
          </span>
          <span className="text-[11px] leading-snug" style={{ color: C.textSec }}>
            {complexity.timeExplanation}
          </span>
        </div>

        {/* Space Complexity Card */}
        <div
          className="p-3 rounded flex flex-col justify-between border"
          style={{ background: C.raised, borderColor: C.border }}
        >
          <span className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: C.textMut }}>
            Auxiliary Space
          </span>
          <span className="text-xl font-bold font-mono my-1" style={{ color: C.greenFg }}>
            {complexity.spaceComplexity}
          </span>
          <span className="text-[11px] leading-snug" style={{ color: C.textSec }}>
            {complexity.spaceExplanation}
          </span>
        </div>
      </div>

      {/* Confidence & Evidence Drawer */}
      <div
        className="rounded border p-2.5 flex flex-col gap-2"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider">
            {isHighConf ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : isMedConf ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span style={{ color: C.textPri }}>
              Confidence: <span className="capitalize">{complexity.confidence}</span>
            </span>
          </div>

          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1 text-[10px] hover:underline"
            style={{ color: C.textSec }}
          >
            <span>{expanded ? "Hide Evidence" : "Show Evidence"}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {expanded && complexity.evidence && (
          <div className="pt-2 border-t font-mono text-[10px] flex flex-col gap-1.5" style={{ borderColor: C.border }}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span style={{ color: C.textMut }}>Loop Nesting Depth: </span>
                <span style={{ color: C.textPri }}>{complexity.evidence.loopCount ?? 0}</span>
              </div>
              <div>
                <span style={{ color: C.textMut }}>Max Recursion Depth: </span>
                <span style={{ color: C.textPri }}>{complexity.evidence.maxDepth ?? 0}</span>
              </div>
              <div>
                <span style={{ color: C.textMut }}>Total Operations: </span>
                <span style={{ color: C.textPri }}>{complexity.evidence.totalOperations ?? 0}</span>
              </div>
              <div>
                <span style={{ color: C.textMut }}>Search Reduction: </span>
                <span style={{ color: C.textPri }}>{complexity.evidence.reductionRatio ?? "N/A"}</span>
              </div>
            </div>

            {complexity.evidence.observations && complexity.evidence.observations.length > 0 && (
              <div className="mt-1 pt-1 border-t" style={{ borderColor: C.border }}>
                <span className="font-semibold block mb-1" style={{ color: C.textSec }}>
                  Runtime Observations:
                </span>
                <ul className="list-disc list-inside space-y-0.5">
                  {complexity.evidence.observations.map((obs, idx) => (
                    <li key={idx} style={{ color: C.textMut }}>
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
