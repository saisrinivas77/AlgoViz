"use client";

import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Diagnostic } from "@algoviz/dvir";

interface MonacoEditorProps {
  code: string;
  onChange?: (val: string | undefined) => void;
  readOnly?: boolean;
  highlightedLine?: number | null;
  focusLine?: number | null;
  diagnostics?: Diagnostic[];
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  code,
  onChange,
  readOnly = false,
  highlightedLine,
  focusLine,
  diagnostics = [],
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Warm-neutral theme matching site identity
    monaco.editor.defineTheme("algoviz-warm", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "9DCBCB" },
        { token: "keyword.control", foreground: "9DCBCB" },
        { token: "entity.name.function", foreground: "C8956C" },
        { token: "support.function", foreground: "C8956C" },
        { token: "string", foreground: "88B06A" },
        { token: "constant.numeric", foreground: "9DCBCB" },
        { token: "comment", foreground: "5E5E58", fontStyle: "italic" },
        { token: "delimiter", foreground: "9E9E98" },
      ],
      colors: {
        "editor.background": "#141412",
        "editor.foreground": "#E8E6E0",
        "editor.lineHighlightBackground": "#1E1E1C",
        "editor.selectionBackground": "#3E3E3A50",
        "editorLineNumber.foreground": "#3E3E3A",
        "editorLineNumber.activeForeground": "#9E9E98",
        "editorGutter.background": "#141412",
        "editor.inactiveSelectionBackground": "#2E2E2C40",
        "editorCursor.foreground": "#E8E6E0",
        "scrollbar.shadow": "#00000000",
        "scrollbarSlider.background": "#3E3E3A60",
        "scrollbarSlider.hoverBackground": "#5E5E5880",
        "editorIndentGuide.background1": "#2E2E2C",
        "editorIndentGuide.activeBackground1": "#3E3E3A",
        "editor.findMatchBackground": "rgba(180,83,9,0.25)",
        "editor.findMatchHighlightBackground": "rgba(180,83,9,0.12)",
      },
    });

    monaco.editor.setTheme("algoviz-warm");
  };

  // Scroll to focusLine when explicitly requested
  useEffect(() => {
    if (editorRef.current && focusLine && focusLine > 0) {
      editorRef.current.revealLineInCenter(focusLine);
    }
  }, [focusLine]);

  // Apply decorations for active line and diagnostics
  useEffect(() => {
    if (!editorRef.current) return;

    const newDecorations: any[] = [];

    // Active execution line highlight
    if (highlightedLine && highlightedLine > 0) {
      newDecorations.push({
        range: {
          startLineNumber: highlightedLine,
          startColumn: 1,
          endLineNumber: highlightedLine,
          endColumn: 1000,
        },
        options: {
          isWholeLine: true,
          className: "editor-line-highlight",
          glyphMarginClassName: "editor-glyph-highlight",
        },
      });
    }

    // Diagnostic markers
    for (const diag of diagnostics) {
      if (diag.line && diag.line > 0) {
        const isErr = diag.severity === "error";
        newDecorations.push({
          range: {
            startLineNumber: diag.line,
            startColumn: diag.column || 1,
            endLineNumber: diag.line,
            endColumn: 1000,
          },
          options: {
            isWholeLine: false,
            inlineClassName: isErr ? "underline decoration-red-500 decoration-wavy" : "underline decoration-amber-500 decoration-wavy",
            hoverMessage: {
              value: `**${diag.severity.toUpperCase()}: ${diag.category}**\n\n${diag.message}\n\n*${diag.explanation}*`,
            },
          },
        });
      }
    }

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );

    if (highlightedLine && highlightedLine > 0) {
      editorRef.current.revealLineInCenterIfOutsideViewport(highlightedLine);
    }
  }, [highlightedLine, diagnostics]);

  return (
    <div className="w-full h-full overflow-hidden" style={{ background: "#141412" }}>
      <Editor
        height="100%"
        defaultLanguage="python"
        theme="algoviz-warm"
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13.5,
          fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
          fontLigatures: true,
          lineNumbers: "on",
          glyphMargin: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          padding: { top: 14, bottom: 14 },
          lineHeight: 1.75,
          letterSpacing: 0.2,
          renderLineHighlight: "none",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 5,
            horizontalScrollbarSize: 5,
          },
        }}
      />
    </div>
  );
};
