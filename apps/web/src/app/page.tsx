"use client";

/**
 * AlgoViz Home Page
 *
 * Premium production-grade landing page for the DSA Code Visualizer.
 * Light/dark alternating rhythm tells the algorithm execution story.
 *
 * Sections:
 * 1. Navbar          — Context-aware color, transparent → solid on scroll
 * 2. Hero            — Light. Live bubble sort preview, editorial headline
 * 3. ProblemSection  — Dark. Cognitive overload problem statement
 * 4. Transformation  — Light. Code → Events → State → Visualization pipeline
 * 5. LiveDemo        — Dark. Real TracePlayer + ArrayVisualizer
 * 6. DataStructure   — Light. Selectable DS list with visual preview
 * 7. CodeBecomesViz  — Dark. Core product philosophy
 * 8. FreeForEveryone — Light. Accessibility philosophy
 * 9. Engineering     — Dark. Architecture pipeline, hover-reveal detail
 * 10. FinalCTA       — Dark. Strong closing statement
 * 11. Footer         — Dark.
 */

import React from "react";
import { Navbar } from "./home/Navbar";
import { Hero } from "./home/Hero";
import { ProblemSection } from "./home/ProblemSection";
import { TransformationSection } from "./home/TransformationSection";
import { LiveDemo } from "./home/LiveDemo";
import { DataStructureShowcase } from "./home/DataStructureShowcase";
import { CodeBecomesViz } from "./home/CodeBecomesViz";
import { FreeForEveryone } from "./home/FreeForEveryone";
import { EngineeringSection } from "./home/EngineeringSection";
import { FinalCTA } from "./home/FinalCTA";
import { Footer } from "./home/Footer";

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)" }}>
      {/* Fixed navigation — context-aware */}
      <Navbar />

      <main id="main-content">
        {/* 01 Hero — Light — Product reveal */}
        <Hero />

        {/* 02 Problem — Dark — Cognitive challenge */}
        <ProblemSection />

        {/* 03 Transformation — Light — How code becomes insight */}
        <TransformationSection />

        {/* 04 Live Demo — Dark — Real execution */}
        <LiveDemo />

        {/* 05 Data Structures — Light — What can be visualized */}
        <DataStructureShowcase />

        {/* 06 Code Becomes Viz — Dark — Core philosophy */}
        <CodeBecomesViz />

        {/* 07 Free For Everyone — Light — Access philosophy */}
        <FreeForEveryone />

        {/* 08 Engineering — Dark — Technical depth */}
        <EngineeringSection />

        {/* 09 Final CTA — Dark — Closing statement */}
        <FinalCTA />
      </main>

      {/* Footer — Dark */}
      <Footer />
    </div>
  );
}
