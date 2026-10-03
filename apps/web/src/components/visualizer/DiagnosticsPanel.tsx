"use client";

import React from "react";
import { Diagnostic } from "@algoviz/dvir";
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight } from "lucide-react";

interface DiagnosticsPanelProps {
  diagnostics: Diagnostic[];
  onSelectDiagnostic: (diag: Diagnostic) => void;
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
  red: "#B91C1C",
  redFg: "#FFE4E4",
  amber: "#B45309",
  amberFg: "#F5E6D0",
  green: "#2D6A30",
  greenFg: "#D0F0D0",
} as const;

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  diagnostics,
  onSelectDiagnostic,
}) => {
  if (!diagnostics || diagnostics.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 className="w-7 h-7 mb-2 text-green-500" />
        <span className="text-[12px] font-medium" style={{ color: C.textPri }}>
          No Bugs or Warnings Detected
        </span>
        <span className="text-[10px] max-w-xs mt-1" style={{ color: C.textMut }}>
          Execution terminated successfully with no runtime exceptions, boundary errors, or infinite loop patterns.
        </span>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto p-3 text-[11px] space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="font-semibold text-[11px] uppercase tracking-wider" style={{ color: C.textMut }}>
          {diagnostics.length} Diagnostic {diagnostics.length === 1 ? "Issue" : "Issues"} Found
        </span>
      </div>

      {diagnostics.map((diag) => {
        const isError = diag.severity === "error";
        const isWarning = diag.severity === "warning";

        const badgeBg = isError ? "rgba(185,28,28,0.15)" : isWarning ? "rgba(180,83,9,0.15)" : "rgba(100,100,100,0.15)";
        const badgeBorder = isError ? "rgba(185,28,28,0.3)" : isWarning ? "rgba(180,83,9,0.3)" : "rgba(100,100,100,0.3)";
        const badgeColor = isError ? C.redFg : isWarning ? C.amberFg : C.textSec;

        return (
          <div
            key={diag.id}
            className="p-3 rounded border flex flex-col gap-2 transition-all cursor-pointer"
            style={{
              background: C.raised,
              borderColor: isError ? "rgba(185,28,28,0.3)" : C.border,
            }}
            onClick={() => onSelectDiagnostic(diag)}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = C.borderStr)}
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = isError ? "rgba(185,28,28,0.3)" : C.border)
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {isError ? (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
                <span className="font-semibold truncate text-[12px]" style={{ color: C.textPri }}>
                  {diag.message}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase"
                  style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeColor }}
                >
                  {diag.category.replace("_", " ")}
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPri }}
                >
                  Line {diag.line}
                </span>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-[11px] leading-relaxed" style={{ color: C.textSec }}>
              {diag.explanation}
            </p>

            {/* Runtime Evidence */}
            {diag.evidence && (
              <div
                className="p-2 rounded font-mono text-[10px]"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <span className="font-semibold block mb-1" style={{ color: C.textMut }}>
                  Runtime Evidence:
                </span>
                <pre className="whitespace-pre-wrap overflow-x-auto" style={{ color: C.textPri }}>
                  {typeof diag.evidence === "string"
                    ? diag.evidence
                    : JSON.stringify(diag.evidence, null, 2)}
                </pre>
              </div>
            )}

            {/* Suggested Fix + Jump action */}
            <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: C.border }}>
              {diag.suggestedFix ? (
                <div className="text-[11px]" style={{ color: C.amberFg }}>
                  <span className="font-semibold">Suggested fix: </span>
                  <span>{diag.suggestedFix}</span>
                </div>
              ) : <div />}

              <button
                className="flex items-center gap-1 text-[10px] font-medium rounded px-2 py-1 transition-colors shrink-0 ml-2"
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPri }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDiagnostic(diag);
                }}
              >
                <span>Jump to line</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
