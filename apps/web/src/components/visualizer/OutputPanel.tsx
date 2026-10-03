"use client";

import React, { useRef, useEffect } from "react";

interface OutputPanelProps {
  stdout: string[];
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ stdout }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stdout.length]);

  return (
    <div
      className="h-full w-full p-3 overflow-y-auto font-mono text-[11px]"
      aria-label="Standard output"
    >
      {stdout.length === 0 ? (
        <div style={{ color: "#5E5E58", fontStyle: "italic" }}>No output yet.</div>
      ) : (
        <div className="space-y-0.5">
          {stdout.map((line, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="select-none shrink-0" style={{ color: "#3E3E3A" }}>
                &gt;
              </span>
              <span style={{ color: "#D0F0D0" }} className="break-all">
                {line}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
