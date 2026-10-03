"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CallStackFrame {
  name: string;
  frameId: string;
  args: Record<string, any>;
}

interface CallStackPanelProps {
  callStack: CallStackFrame[];
}

export const CallStackPanel: React.FC<CallStackPanelProps> = ({ callStack }) => {
  return (
    <div className="h-full w-full p-3 overflow-y-auto">
      {callStack.length === 0 ? (
        <div
          className="flex items-center gap-2 text-[11px] font-mono p-2 rounded"
          style={{
            background: "rgba(45,106,48,0.08)",
            border: "1px solid rgba(45,106,48,0.18)",
            color: "#D0F0D0",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "#2D6A30" }}
            aria-hidden="true"
          />
          {"<global scope>"}
        </div>
      ) : (
        <div className="space-y-1 font-mono text-[10px]">
          <AnimatePresence>
            {[...callStack].reverse().map((frame, idx) => {
              const isTop = idx === 0;
              return (
                <motion.div
                  key={frame.frameId || idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-2 p-2 rounded"
                  style={{
                    background: isTop ? "rgba(180,83,9,0.08)" : "#141412",
                    border: `1px solid ${isTop ? "rgba(180,83,9,0.2)" : "#2E2E2C"}`,
                  }}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className="font-semibold"
                      style={{ color: isTop ? "#F5E6D0" : "#9E9E98" }}
                    >
                      {frame.name}()
                    </span>
                    {Object.keys(frame.args || {}).length > 0 && (
                      <span
                        className="text-[9px] mt-0.5 truncate"
                        style={{ color: "#5E5E58" }}
                      >
                        {Object.entries(frame.args)
                          .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                  {isTop && (
                    <span
                      className="text-[9px] font-sans px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        background: "rgba(180,83,9,0.12)",
                        color: "#B45309",
                        border: "1px solid rgba(180,83,9,0.2)",
                      }}
                    >
                      active
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
