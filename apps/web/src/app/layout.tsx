import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoViz — DSA Code Visualizer",
  description:
    "Write Python code, run it, and watch every step of execution come alive. Variables, comparisons, swaps, and data structure changes — visualized in real time.",
  keywords: ["DSA visualizer", "algorithm visualization", "Python code tracer", "data structures", "binary search", "bubble sort"],
  openGraph: {
    title: "AlgoViz — DSA Code Visualizer",
    description:
      "Run your code. See what actually happens. A real execution engine that turns Python code into step-by-step visualizations.",
    type: "website",
    siteName: "AlgoViz",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoViz — DSA Code Visualizer",
    description:
      "Run your code. See what actually happens. A real execution engine that turns Python code into step-by-step visualizations.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
