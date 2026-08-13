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

/**
 * Dependency-free rich-text editor built on contentEditable + execCommand.
 * Emits sanitized HTML through onChange. Supports bold/italic/underline/strike,
 * H2/H3, blockquote, bullet & numbered lists, font family, links, clear format.
 */
export function RichTextEditor({ value, onChange, placeholder = "Write here…" }) {
  const ref = useRef(null);

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

  const exec = (command, arg = null) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Link URL (https://…)");
    if (url) exec("createLink", url);
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
        <FontSelect
          aria-label="Font family"
          defaultValue=""
          onMouseDown={(e) => e.stopPropagation()}
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
        onInput={emit}
        onBlur={emit}
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

const Divider = styled.span`
  width: 1px; height: 20px; background: ${({ theme }) => theme.colors.border}; margin: 0 4px;
`;

const FontSelect = styled.select`
  margin-left: auto;
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
