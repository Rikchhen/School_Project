import { useState } from "react";
import styled from "styled-components";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "../context/LanguageContext";

export function CappedList({ items = [], limit, renderItem, as = "div", className }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, items.length - limit);
  const visible = expanded ? items : items.slice(0, limit);
  const List = as;

  return (
    <Root className={className} data-expanded={expanded}>
      <List>{visible.map((item, index) => renderItem(item, index))}</List>
      {hiddenCount > 0 && (
        <Toggle type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? t("common.showLess") : `+${hiddenCount} ${t("common.more")}`}
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </Toggle>
      )}
    </Root>
  );
}

const Root = styled.div`min-width: 0;`;
const Toggle = styled.button`
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: ${({ theme }) => theme.space[2]};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.shadows.focus}; border-radius: ${({ theme }) => theme.radii.sm}; }
`;

export default CappedList;
