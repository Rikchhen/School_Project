import { useCallback, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "../context/LanguageContext";

export function ReadMore({ children, text, lines = 3, className }) {
  const { t } = useLang();
  const content = text ?? children;
  const contentRef = useRef(null);
  const expandedRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  const measure = useCallback(() => {
    const element = contentRef.current;
    if (!element || expandedRef.current) return;
    setOverflowing(element.scrollHeight > element.clientHeight + 1);
  }, []);

  useLayoutEffect(() => {
    expandedRef.current = false;
    setExpanded(false);
    const frame = requestAnimationFrame(measure);
    const element = contentRef.current;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (element) observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [content, lines, measure]);

  const toggle = () => {
    setExpanded((value) => {
      expandedRef.current = !value;
      return !value;
    });
  };

  return (
    <Root className={className} data-expanded={expanded}>
      <Clamped ref={contentRef} $lines={lines} $expanded={expanded}>{content}</Clamped>
      {overflowing && (
        <Toggle type="button" aria-expanded={expanded} onClick={toggle}>
          {expanded ? t("common.showLess") : t("common.readMore")}
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </Toggle>
      )}
    </Root>
  );
}

const Root = styled.div`
  min-width: 0;
`;

const Clamped = styled.div`
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  overflow: hidden;
  display: ${({ $expanded }) => ($expanded ? "block" : "-webkit-box")};
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${({ $expanded, $lines }) => ($expanded ? "unset" : $lines)};
  max-height: ${({ $expanded, $lines }) => ($expanded ? "999rem" : `${$lines * 1.65}em`)};
  transition: max-height ${({ theme }) => theme.transitions.slow}, opacity ${({ theme }) => theme.transitions.base};

  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

const Toggle = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: ${({ theme }) => theme.space[2]};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.shadows.focus}; border-radius: ${({ theme }) => theme.radii.sm}; }
`;

export default ReadMore;
