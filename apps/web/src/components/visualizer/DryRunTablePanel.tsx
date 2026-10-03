"use client";

import React, { useRef, useEffect } from "react";
import { DryRunTable, DryRunRow } from "@algoviz/dvir";
import { Table, MousePointerClick } from "lucide-react";

interface DryRunTablePanelProps {
  table: DryRunTable;
  currentStepIndex: number;
  onSeek: (stepIndex: number) => void;
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
  amberBorder: "rgba(180,83,9,0.35)",
} as const;

export const DryRunTablePanel: React.FC<DryRunTablePanelProps> = ({
  table,
  currentStepIndex,
  onSeek,
}) => {
  const activeRowRef = useRef<HTMLTableRowElement>(null);

  // Auto-scroll active row into view smoothly
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentStepIndex]);

  if (!table || table.rows.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
        <Table className="w-6 h-6" style={{ color: C.textMut }} aria-hidden="true" />
        <span className="text-[12px] font-medium" style={{ color: C.textSec }}>
          No Dry-Run Table
        </span>
        <span className="text-[10px] max-w-xs" style={{ color: C.textMut }}>
          Execute an algorithm to automatically generate an evidence-based dry-run trace table.
        </span>
      </div>
    );
  }

  // Find nearest row for current step
  let activeRowIdx = -1;
  for (let i = 0; i < table.rows.length; i++) {
    if (table.rows[i].stepIndex <= currentStepIndex) {
      activeRowIdx = i;
    } else {
      break;
    }
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden text-[11px] font-mono">
      {/* Table header bar */}
      <div
        className="px-3 py-1.5 flex items-center justify-between border-b shrink-0 text-[10px]"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <span style={{ color: C.textSec }}>
          Showing {table.rows.length} steps · Click any row to jump
        </span>
        <span className="flex items-center gap-1" style={{ color: C.textMut }}>
          <MousePointerClick className="w-3 h-3" />
          Interactive timeline
        </span>
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead
            className="sticky top-0 z-10 text-[10px] uppercase font-semibold"
            style={{ background: C.raised, borderBottom: `1px solid ${C.border}` }}
          >
            <tr>
              {table.columns.map((col) => (
                <th
                  key={col.id}
                  className="px-2.5 py-1.5 whitespace-nowrap"
                  style={{
                    color: col.importance === "primary" ? C.textPri : C.textMut,
                    borderRight: `1px solid ${C.border}`,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, idx) => {
              const isActive = idx === activeRowIdx;
              return (
                <tr
                  key={row.stepId || idx}
                  ref={isActive ? activeRowRef : null}
                  onClick={() => onSeek(row.stepIndex)}
                  title={`Jump to Step ${row.stepIndex + 1}: ${row.description}`}
                  className="cursor-pointer transition-colors"
                  style={{
                    background: isActive ? C.amberBg : idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                    borderBottom: `1px solid ${C.border}`,
                    outline: isActive ? `1px solid ${C.amberBorder}` : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = C.raised;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)";
                  }}
                >
                  {table.columns.map((col) => {
                    const val = row.values[col.id];
                    const isChanged = row.changedKeys.includes(col.id);

                    let displayVal: React.ReactNode = "-";
                    if (val !== undefined && val !== null) {
                      if (Array.isArray(val)) {
                        displayVal = `[${val.slice(0, 4).join(",")}${val.length > 4 ? "…" : ""}]`;
                      } else {
                        displayVal = String(val);
                      }
                    }

                    return (
                      <td
                        key={col.id}
                        className="px-2.5 py-1.5 whitespace-nowrap"
                        style={{
                          color: isActive
                            ? col.id === "action"
                              ? C.amberFg
                              : C.textPri
                            : isChanged
                            ? C.amberFg
                            : col.importance === "primary"
                            ? C.textPri
                            : C.textSec,
                          fontWeight: isChanged || isActive ? 600 : 400,
                          borderRight: `1px solid ${C.border}`,
                        }}
                      >
                        {isChanged && !isActive && (
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                            style={{ background: C.amber }}
                          />
                        )}
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
