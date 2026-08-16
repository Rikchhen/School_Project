import styled from "styled-components";
import { Plus, X } from "lucide-react";
import { Input, Textarea } from "../ui/Input";
import { useConfirm } from "../../context/ConfirmContext";

/**
 * Friendly key/value editor that replaces raw-JSON editing for a page's
 * structured `content`. Each row is a labelled field name + a multiline value.
 */
export function FieldsEditor({ value = {}, onChange, addLabel = "Add field" }) {
  const { confirmRemove } = useConfirm();
  const entries = Object.entries(value);

  const rebuild = (next) => onChange(Object.fromEntries(next));
  const setKey = (i, k) => rebuild(entries.map((e, idx) => (idx === i ? [k, e[1]] : e)));
  const setVal = (i, v) => rebuild(entries.map((e, idx) => (idx === i ? [e[0], v] : e)));
  const remove = async (i) => (await confirmRemove(`field “${entries[i]?.[0] || i + 1}”`)) && rebuild(entries.filter((_, idx) => idx !== i));
  const add = () => {
    let name = "field";
    let n = 1;
    while (Object.prototype.hasOwnProperty.call(value, name)) name = `field${++n}`;
    onChange({ ...value, [name]: "" });
  };

  return (
    <Wrap>
      {entries.length === 0 && <Empty>No extra fields. Add one if this page needs structured content.</Empty>}
      {entries.map(([k, v], i) => (
        <Row key={i}>
          <KeyInput value={k} onChange={(e) => setKey(i, e.target.value)} placeholder="field name" />
          <Textarea value={String(v ?? "")} onChange={(e) => setVal(i, e.target.value)} style={{ minHeight: 60 }} placeholder="value" />
          <Remove type="button" onClick={() => remove(i)} aria-label="Remove field"><X size={16} /></Remove>
        </Row>
      ))}
      <AddBtn type="button" onClick={add}><Plus size={16} /> {addLabel}</AddBtn>
    </Wrap>
  );
}

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};`;
const Empty = styled.p`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm};`;
const Row = styled.div`
  display: grid; grid-template-columns: 180px 1fr auto; gap: ${({ theme }) => theme.space[2]}; align-items: start;
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr auto;`)}
`;
const KeyInput = styled(Input)`
  font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const Remove = styled.button`
  width: 38px; height: 38px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.danger}; background: ${({ theme }) => theme.colors.dangerSoft};
`;
const AddBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  color: ${({ theme }) => theme.colors.secondary}; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[3]}`}; border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.secondarySoft};
`;

export default FieldsEditor;
