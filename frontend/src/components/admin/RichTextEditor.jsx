import { useEffect, useRef } from "react";
import styled from "styled-components";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Heading2, Heading3, Quote, Link2, RemoveFormatting,
} from "lucide-react";
import { sanitizeHtml } from "../../lib/sanitizeHtml";

const FONTS = [
  { label: "Default font", value: "" },
  { label: "Inter", value: "Inter" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
  { label: "Noto Sans Devanagari", value: "Noto Sans Devanagari" },
  { label: "Georgia", value: "Georgia" },
  { label: "Courier New", value: "Courier New" },
];
const FONT_SIZES = ["12", "14", "16", "20", "24", "32"];

/**
 * Dependency-free rich-text editor built on contentEditable + execCommand.
 * Emits sanitized HTML through onChange. Supports bold/italic/underline/strike,
 * H2/H3, blockquote, bullet & numbered lists, font family, links, clear format.
 */
export function RichTextEditor({ value, onChange, placeholder = "Write here…" }) {
  const ref = useRef(null);
  const selectionRef = useRef(null);

  // Keep the DOM in sync with the value prop without stealing the caret.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const incoming = value || "";
    if (document.activeElement !== el && el.innerHTML !== incoming) {
      el.innerHTML = incoming;
    }
  }, [value]);

  const emit = () => {
    if (ref.current) onChange?.(sanitizeHtml(ref.current.innerHTML));
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !ref.current) return;
    const range = selection.getRangeAt(0);
    if (ref.current.contains(range.commonAncestorContainer)) selectionRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const range = selectionRef.current;
    if (!range) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const exec = (command, arg = null) => {
    ref.current?.focus();
    restoreSelection();
    document.execCommand(command, false, arg);
    saveSelection();
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Link URL (https://…)");
    if (url) exec("createLink", url);
  };

  const applyFontSize = (size) => {
    if (!size) return;
    ref.current?.focus();
    restoreSelection();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("fontSize", false, "7");
    ref.current?.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;
      while (font.firstChild) span.appendChild(font.firstChild);
      font.replaceWith(span);
    });
    saveSelection();
    emit();
  };

  const btn = (Icon, label, onClick) => (
    <ToolBtn
      type="button"
      title={label}
      aria-label={label}
      // preventDefault keeps the editor's text selection while clicking a tool
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Icon size={16} />
    </ToolBtn>
  );

  return (
    <Wrap>
      <Toolbar>
        {btn(Bold, "Bold", () => exec("bold"))}
        {btn(Italic, "Italic", () => exec("italic"))}
        {btn(Underline, "Underline", () => exec("underline"))}
        {btn(Strikethrough, "Strikethrough", () => exec("strikeThrough"))}
        <Divider />
        {btn(Heading2, "Heading", () => exec("formatBlock", "H2"))}
        {btn(Heading3, "Subheading", () => exec("formatBlock", "H3"))}
        {btn(Quote, "Quote", () => exec("formatBlock", "BLOCKQUOTE"))}
        <Divider />
        {btn(List, "Bullet list", () => exec("insertUnorderedList"))}
        {btn(ListOrdered, "Numbered list", () => exec("insertOrderedList"))}
        <Divider />
        {btn(Link2, "Add link", addLink)}
        {btn(RemoveFormatting, "Clear formatting", () => { exec("removeFormat"); exec("formatBlock", "P"); })}
        <ColorLabel title="Text colour" aria-label="Text colour" onMouseDown={saveSelection}>
          A<input type="color" defaultValue="#1f2937" onChange={(e) => exec("foreColor", e.target.value)} />
        </ColorLabel>
        <FontSelect aria-label="Font size" defaultValue="" onMouseDown={saveSelection}
          onChange={(e) => { applyFontSize(e.target.value); e.target.value = ""; }}>
          <option value="">Size</option>
          {FONT_SIZES.map((size) => <option key={size} value={size}>{size}px</option>)}
        </FontSelect>
        <FontSelect
          aria-label="Font family"
          defaultValue=""
          onMouseDown={saveSelection}
          onChange={(e) => { exec("fontName", e.target.value || "inherit"); e.target.value = ""; }}
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </FontSelect>
      </Toolbar>

      <Editable
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => { saveSelection(); emit(); }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={() => { saveSelection(); emit(); }}
      />
    </Wrap>
  );
}

const Wrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  &:focus-within { border-color: ${({ theme }) => theme.colors.secondary}; box-shadow: ${({ theme }) => theme.shadows.focus}; }
`;

const Toolbar = styled.div`
  display: flex; align-items: center; flex-wrap: wrap; gap: 2px;
  padding: ${({ theme }) => theme.space[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

const ToolBtn = styled.button`
  width: 32px; height: 32px; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textBody};
  &:hover { background: ${({ theme }) => theme.colors.secondarySoft}; color: ${({ theme }) => theme.colors.secondary}; }
`;
const ColorLabel = styled.label`
  width: 32px; height: 32px; position: relative; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.sm}; color: ${({ theme }) => theme.colors.textBody};
  font-weight: 800; font-size: 14px; cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.secondarySoft}; }
  input { position: absolute; inset: auto 5px 3px; width: 22px; height: 5px; padding: 0; border: 0; opacity: .9; cursor: pointer; }
`;

const Divider = styled.span`
  width: 1px; height: 20px; background: ${({ theme }) => theme.colors.border}; margin: 0 4px;
`;

const FontSelect = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: 4px 6px;
`;

const Editable = styled.div`
  min-height: 140px;
  max-height: 360px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.space[4]};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  outline: none;

  &:empty:before {
    content: attr(data-placeholder);
    color: ${({ theme }) => theme.colors.textMuted};
  }

  ul { list-style: disc; padding-left: 1.35rem; }
  ol { list-style: decimal; padding-left: 1.35rem; }
  li { margin-bottom: 2px; }
  h2 { font-size: ${({ theme }) => theme.fontSizes["2xl"]}; margin: 0.5rem 0; }
  h3 { font-size: ${({ theme }) => theme.fontSizes.xl}; margin: 0.5rem 0; }
  blockquote { border-left: 3px solid ${({ theme }) => theme.colors.primary}; padding-left: 0.75rem; color: ${({ theme }) => theme.colors.textMuted}; font-style: italic; }
  a { color: ${({ theme }) => theme.colors.secondary}; text-decoration: underline; }
  p { margin-bottom: 0.5rem; }
`;

export default RichTextEditor;
