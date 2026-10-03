"use client";

import React from "react";
import Link from "next/link";

function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 4H4v14h3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 4h3v14h-3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="8" r="1.25" fill="currentColor" />
      <circle cx="11" cy="14" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      className="py-8 px-6"
      style={{
        background: "var(--bg-code)",
        borderTop: "1px solid var(--border-code)",
        color: "var(--fg-code-secondary)",
      }}
      role="contentinfo"
    >
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ maxWidth: "72rem", margin: "0 auto" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-sm"
          style={{ color: "var(--fg-code-secondary)" }}
          aria-label="AlgoViz — Home"
        >
          <LogoMark size={16} />
          <span className="text-[13px] font-medium" style={{ letterSpacing: "-0.01em" }}>
            AlgoViz
          </span>
        </Link>

        {/* Tech note */}
        <p
          className="font-mono text-[10px] text-center"
          style={{ color: "var(--fg-code-muted)" }}
        >
          Next.js · FastAPI · Python AST · Monaco · Framer Motion
        </p>

        {/* Nav links */}
        <nav className="flex items-center gap-4" aria-label="Footer navigation">
          <Link
            href="/playground"
            className="text-[12px] transition-opacity hover:opacity-80 focus-visible:outline-none"
            style={{ color: "var(--fg-code-secondary)" }}
          >
            Playground
          </Link>
          <span style={{ color: "var(--border-code-strong)" }} aria-hidden="true">
            ·
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] transition-opacity hover:opacity-80 focus-visible:outline-none"
            style={{ color: "var(--fg-code-secondary)" }}
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
