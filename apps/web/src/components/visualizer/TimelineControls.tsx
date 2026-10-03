"use client";

import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
} from "lucide-react";

// Shared theme
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
} as const;

const iconBtn = (disabled = false, active = false) => ({
  padding: "7px",
  borderRadius: 6,
  background: active ? C.amberFg : C.raised,
  color: active ? C.amber : disabled ? C.textMut : C.textSec,
  border: `1px solid ${active ? "rgba(180,83,9,0.3)" : C.border}`,
  opacity: disabled ? 0.35 : 1,
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "background 0.12s ease, color 0.12s ease",
});

interface TimelineControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  onRestart: () => void;
  onSeek: (step: number) => void;
  onSetSpeed: (speed: number) => void;
  onAskAI: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPlayPause,
  onNext,
  onPrevious,
  onFirst,
  onLast,
  onRestart,
  onSeek,
  onSetSpeed,
  onAskAI,
}) => {
  const hasSteps = totalSteps > 0;
  const progress = hasSteps ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3" role="group" aria-label="Playback controls">
      {/* Transport buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Restart / First */}
        <button
          onClick={onFirst || onRestart}
          disabled={!hasSteps || currentStep === 0}
          title="First Step (Home)"
          aria-label="First step"
          style={iconBtn(!hasSteps || currentStep === 0)}
        >
          <ChevronsLeft className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrevious}
          disabled={!hasSteps || currentStep === 0}
          title="Previous Step (Left Arrow)"
          aria-label="Previous step"
          style={iconBtn(!hasSteps || currentStep === 0)}
        >
          <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Play/Pause — primary action */}
        <button
          onClick={onPlayPause}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          aria-label={isPlaying ? "Pause" : "Play"}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: C.textPri,
            color: C.bg,
            border: "1px solid transparent",
            cursor: "pointer",
            transition: "opacity 0.12s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={!hasSteps || currentStep >= totalSteps - 1}
          title="Next Step (Right Arrow)"
          aria-label="Next step"
          style={iconBtn(!hasSteps || currentStep >= totalSteps - 1)}
        >
          <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        {/* Last */}
        <button
          onClick={onLast || (() => onSeek(Math.max(0, totalSteps - 1)))}
          disabled={!hasSteps || currentStep >= totalSteps - 1}
          title="Last Step (End)"
          aria-label="Last step"
          style={iconBtn(!hasSteps || currentStep >= totalSteps - 1)}
        >
          <ChevronsRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Progress scrubber */}
      <div className="flex-1 w-full flex items-center gap-2.5 min-w-0">
        <span
          className="font-mono text-[10px] shrink-0 w-[72px]"
          style={{ color: C.textMut }}
        >
          {hasSteps ? `Step ${currentStep + 1}/${totalSteps}` : "— / —"}
        </span>
        <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, background: C.textSec }}
          />
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => onSeek(Number(e.target.value))}
            disabled={!hasSteps}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
          />
        </div>
      </div>

      {/* Speed + AI */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Speed */}
        <div
          className="flex items-center p-0.5 rounded"
          style={{ background: C.raised, border: `1px solid ${C.border}` }}
          role="group"
          aria-label="Playback speed"
        >
          {[0.25, 0.5, 1, 1.5, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              aria-pressed={speed === s}
              className="px-1.5 py-1 text-[10px] rounded font-mono transition-all"
              style={{
                background: speed === s ? C.textPri : "transparent",
                color: speed === s ? C.bg : C.textMut,
                fontWeight: speed === s ? 600 : 400,
              }}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Ask AI */}
        <button
          onClick={onAskAI}
          aria-label="Ask AI to explain this step"
          className="flex items-center gap-1.5 text-[11px] font-medium rounded transition-opacity"
          style={{
            padding: "6px 10px",
            background: C.raised,
            color: C.textSec,
            border: `1px solid ${C.border}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = C.textPri;
            (e.currentTarget as HTMLElement).style.borderColor = C.borderStr;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = C.textSec;
            (e.currentTarget as HTMLElement).style.borderColor = C.border;
          }}
        >
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </div>
    </div>
  );
};
