"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Visualizer", href: "/playground" },
  { label: "How It Works", href: "#transformation" },
  { label: "Live Demo", href: "#demo" },
] as const;

// Minimal geometric logo mark — two overlapping square brackets forming an array
function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      {/* Array bracket left */}
      <path
        d="M7 4H4v14h3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Array bracket right */}
      <path
        d="M15 4h3v14h-3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner node dots representing elements */}
      <circle cx="11" cy="8" r="1.25" fill="currentColor" />
      <circle cx="11" cy="14" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Track whether we're on a dark section (for nav text color)
  const [onDarkSection, setOnDarkSection] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);

      // Detect if we're over a dark section (approximate by scroll position)
      // Hero is light (~100vh), then ProblemSection is dark
      const vh = window.innerHeight;
      const overDark =
        (y > vh * 0.85 && y < vh * 1.9) || // Problem section (dark)
        (y > vh * 2.7 && y < vh * 3.8) ||  // LiveDemo (dark)
        (y > vh * 4.5 && y < vh * 5.5) ||  // CodeBecomesViz (dark)
        (y > vh * 6.2);                      // Engineering + CTA (dark)

      setOnDarkSection(overDark);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      const el = document.getElementById(href.slice(1));
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Color logic based on scroll position
  const isDark = onDarkSection && !menuOpen;
  const textColor = isDark ? "var(--fg-code-secondary)" : "var(--fg-secondary)";
  const textHoverColor = isDark ? "var(--fg-code-primary)" : "var(--fg-primary)";
  const logoColor = isDark ? "var(--fg-code-primary)" : "var(--fg-primary)";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? isDark
              ? "rgba(20, 20, 18, 0.96)"
              : "rgba(245, 244, 240, 0.96)"
            : "transparent",
          borderBottom: scrolled
            ? isDark
              ? "1px solid var(--border-code)"
              : "1px solid var(--border)"
            : "1px solid transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
        }}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-sm"
            aria-label="AlgoViz — Home"
            style={{ color: logoColor }}
          >
            <div
              className="transition-opacity duration-200 group-hover:opacity-70"
              style={{ color: logoColor }}
            >
              <LogoMark size={20} />
            </div>
            <span
              className="font-medium tracking-tight text-[14px] transition-opacity duration-200 group-hover:opacity-70"
              style={{ color: logoColor, letterSpacing: "-0.02em" }}
            >
              AlgoViz
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((link) =>
              link.href.startsWith("#") ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-3 py-2 text-[13px] rounded transition-colors duration-200 focus-visible:outline-none"
                  style={{ color: textColor }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = textHoverColor)
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = textColor)
                  }
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 text-[13px] rounded transition-colors duration-200 focus-visible:outline-none"
                  style={{ color: textColor }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = textHoverColor)
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = textColor)
                  }
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/playground"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
              style={{
                background: isDark ? "var(--fg-code-primary)" : "var(--fg-primary)",
                color: isDark ? "var(--bg-code)" : "var(--bg-surface)",
                borderRadius: "5px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "0.85")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "1")
              }
            >
              Open Visualizer
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded transition focus-visible:outline-none focus-visible:ring-2"
              style={{ color: textColor }}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-x-0 top-14 z-40 md:hidden"
            style={{
              background: "rgba(245, 244, 240, 0.98)",
              borderBottom: "1px solid var(--border)",
              backdropFilter: "blur(12px)",
            }}
            role="dialog"
            aria-label="Mobile navigation"
          >
            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) =>
                link.href.startsWith("#") ? (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left px-4 py-3 text-[15px] rounded-md transition-colors focus-visible:outline-none"
                    style={{ color: "var(--fg-secondary)" }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.background = "var(--bg-raised)")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.background = "transparent")
                    }
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 text-[15px] rounded-md transition-colors focus-visible:outline-none"
                    style={{ color: "var(--fg-secondary)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "var(--bg-raised)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "transparent")
                    }
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div
                className="mt-2 pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <Link
                  href="/playground"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 text-[14px] font-medium rounded-md transition focus-visible:outline-none"
                  style={{
                    background: "var(--fg-primary)",
                    color: "var(--bg-surface)",
                    borderRadius: "6px",
                  }}
                >
                  Open Visualizer
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
