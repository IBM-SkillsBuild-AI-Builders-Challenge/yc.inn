import { useState, useCallback, useRef, useEffect } from "react";
import { BaseNode } from "../BaseNode";
import { useFlowStore } from "../../../store/useFlowStore";
import { FileOutput, Eye, X } from "lucide-react";

function mdToHtml(text) {
  let html = String(text);

  html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const cls = lang ? ` class="lang-${lang}"` : "";
    return `<pre${cls}><code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/^(\d+)\.\s+(.+)$/gm, "<li>$2</li>");
  html = html.replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  const lines = html.split("\n");
  const result = [];
  let inList = false;
  let listType = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
      result.push(i < lines.length - 1 ? "<br>" : "");
      continue;
    }

    if (trimmed.startsWith("<h") || trimmed.startsWith("<pre") || trimmed.startsWith("<li") || trimmed.startsWith("<table")) {
      if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
      result.push(trimmed);
      continue;
    }

    if (trimmed.startsWith("<li")) {
      if (!inList) {
        const prev = lines[i - 1] || "";
        const isOrdered = /^\d+\.\s/.test(prev);
        listType = isOrdered ? "ol" : "ul";
        result.push(`<${listType}>`);
        inList = true;
      }
      result.push(trimmed);
      const next = lines[i + 1] || "";
      if (!next.trim().startsWith("<li")) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      continue;
    }

    if (inList) { result.push(`</${listType}>`); inList = false; listType = null; }
    result.push(`<p>${trimmed}</p>`);
  }

  if (inList) result.push(`</${listType}>`);

  return result.join("\n");
}

function OutputDialog({ output, onClose }) {
  const headerRef = useRef(null);
  const dialogRef = useRef(null);
  const bodyRef = useRef(null);
  const posRef = useRef({ x: 80, y: 60 });
  const sizeRef = useRef({ w: 680, h: 520 });
  const [, forceRender] = useState(0);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const handler = (e) => e.stopPropagation();
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const handleHeaderDown = useCallback((e) => {
    if (e.target.tagName === "BUTTON") return;
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;

    const onMove = (ev) => {
      posRef.current = { x: startLeft + ev.clientX - startX, y: startTop + ev.clientY - startY };
      forceRender((n) => n + 1);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const handleResizeDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const sw = sizeRef.current.w;
    const sh = sizeRef.current.h;

    const onMove = (ev) => {
      sizeRef.current = { w: Math.max(360, sw + ev.clientX - startX), h: Math.max(240, sh + ev.clientY - startY) };
      forceRender((n) => n + 1);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const text = typeof output === "object" ? JSON.stringify(output, null, 2) : String(output);
  const html = mdToHtml(text);

  return (
    <div
      ref={dialogRef}
      className="output-dialog"
      style={{ left: posRef.current.x, top: posRef.current.y, width: sizeRef.current.w, height: sizeRef.current.h }}
    >
      <div className="output-dialog-header" ref={headerRef} onMouseDown={handleHeaderDown}>
        <div className="output-dialog-title-wrap">
          <span className="output-dialog-title">Output</span>
        </div>
        <button className="output-dialog-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="output-dialog-body" ref={bodyRef}>
        <div className="output-dialog-md" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="output-dialog-resize" onMouseDown={handleResizeDown} />
    </div>
  );
}

export function OutputNode({ id, data }) {
  const updateNodeField = useFlowStore((s) => s.updateNodeField);
  const nodeOutputs = useFlowStore((s) => s.nodeOutputs);
  const [name, setName] = useState(data?.outputName || "output_" + id.split("-").pop());
  const [dialogOpen, setDialogOpen] = useState(false);

  const output = nodeOutputs[id];

  const openDialog = useCallback(() => {
    if (output !== undefined) setDialogOpen(true);
  }, [output]);

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  return (
    <>
      <BaseNode id={id} title="Output" icon={FileOutput} inputs={[{ id: `${id}-value` }]}>
        <div className="field">
          <label className="field-label">Name</label>
          <input className="field-input" value={name}
            onChange={(e) => { setName(e.target.value); updateNodeField(id, "outputName", e.target.value); }}
            placeholder="output name" />
        </div>

        <button className="field-btn" onClick={openDialog} disabled={output === undefined}>
          <Eye size={12} />
          {output !== undefined ? "View Output" : "No Output"}
        </button>
      </BaseNode>

      {dialogOpen && <OutputDialog output={output} onClose={closeDialog} />}
    </>
  );
}
