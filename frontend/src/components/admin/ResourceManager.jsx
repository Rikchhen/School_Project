import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useLang } from "../../context/LanguageContext";
import { Button } from "../ui/Button";
import { Field, Label, Input, Textarea, Select } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";
import { ImageUploader } from "../ImageUploader";
import { MultiImageUploader } from "../MultiImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { Modal } from "./Modal";

/**
 * Generic list + create/edit/delete manager driven by a config object.
 * Handles standard REST endpoints: GET list, POST create, PUT /:id, DELETE /:id.
 *
 * config: { title, endpoint, columns, fields, defaults, listParams }
 *  - columns: [{ key, label, render?(row) }]
 *  - fields:  [{ name, label, type, options?, required?, full?, accept?, help? }]
 *      types: text | textarea | number | checkbox | select | image | pdf
 */
export function ResourceManager({ config }) {
  const toast = useToast();
  const { t } = useLang();
  const [items, setItems] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const listUrl = useMemo(() => {
    const p = new URLSearchParams({ limit: "100", ...(config.listParams || {}) });
    return `${config.endpoint}?${p.toString()}`;
  }, [config.endpoint, config.listParams]);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const res = await api.get(listUrl);
      setItems(res.items || []);
    } catch (err) {
      toast.error(err.message || "Failed to load");
      setItems([]);
    }
  }, [listUrl, toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...(config.defaults || {}) });
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    const initial = {};
    for (const f of config.fields) initial[f.name] = row[f.name] ?? config.defaults?.[f.name] ?? "";
    setForm(initial);
    setModalOpen(true);
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      for (const f of config.fields) {
        if (f.type === "number" && payload[f.name] !== "" && payload[f.name] != null) {
          payload[f.name] = Number(payload[f.name]);
        }
        if (f.type === "csv") {
          const v = payload[f.name];
          payload[f.name] = Array.isArray(v)
            ? v
            : String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
      if (editing) {
        await api.put(`${config.endpoint}/${editing._id}`, payload);
        toast.success(`${config.title} updated`);
      } else {
        await api.post(config.endpoint, payload);
        toast.success(`${config.title} created`);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    try {
      await api.del(`${config.endpoint}/${row._id}`);
      toast.success(`${config.title} deleted`);
      await load();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <>
      <Header>
        <h1>{config.title}</h1>
        <Button $variant="primary" onClick={openCreate}><Plus size={18} /> {t("admin.create")}</Button>
      </Header>

      <TableWrap>
        {items === null ? (
          <SkeletonRows>{[...Array(5)].map((_, i) => <Skeleton key={i} $h="52px" />)}</SkeletonRows>
        ) : items.length === 0 ? (
          <Empty>{t("admin.noItems")}</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                {config.columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id}>
                  {config.columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? "")}</td>
                  ))}
                  <td>
                    <Actions>
                      <IconBtn onClick={() => openEdit(row)} aria-label="Edit"><Pencil size={16} /></IconBtn>
                      <IconBtn $danger onClick={() => remove(row)} aria-label="Delete"><Trash2 size={16} /></IconBtn>
                    </Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrap>

      <Modal
        open={modalOpen}
        title={`${editing ? t("admin.edit") : t("admin.create")} — ${config.title}`}
        onClose={() => setModalOpen(false)}
        width="620px"
        footer={
          <>
            <Button $variant="ghost" onClick={() => setModalOpen(false)}>{t("admin.cancel")}</Button>
            <Button $variant="primary" onClick={save} disabled={saving}>
              {saving ? `${t("common.loading")}…` : t("admin.save")}
            </Button>
          </>
        }
      >
        <FormGrid onSubmit={save}>
          {config.fields.map((f) => (
            <Field key={f.name} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
              {f.type !== "checkbox" && (
                <Label htmlFor={`f-${f.name}`}>
                  {f.label} {f.required && <span data-req>*</span>}
                </Label>
              )}
              {renderField(f, form[f.name], (v) => setField(f.name, v))}
              {f.help && <small style={{ color: "#6b7280" }}>{f.help}</small>}
            </Field>
          ))}
          <button type="submit" hidden />
        </FormGrid>
      </Modal>
    </>
  );
}

function renderField(f, value, onChange) {
  const id = `f-${f.name}`;
  switch (f.type) {
    case "textarea":
      return <Textarea id={id} value={value ?? ""} required={f.required} onChange={(e) => onChange(e.target.value)} />;
    case "richtext":
      return <RichTextEditor value={value ?? ""} onChange={(html) => onChange(html)} placeholder={f.placeholder} />;
    case "number":
      return <Input id={id} type="number" value={value ?? ""} required={f.required} onChange={(e) => onChange(e.target.value)} />;
    case "csv":
      return (
        <Input
          id={id}
          value={Array.isArray(value) ? value.join(", ") : (value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Comma, separated, values"
        />
      );
    case "date":
      return (
        <Input
          id={id}
          type="date"
          value={value ? String(value).slice(0, 10) : ""}
          required={f.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <Select id={id} value={value ?? ""} required={f.required} onChange={(e) => onChange(e.target.value)}>
          {f.options.map((o) => (
            <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
              {typeof o === "string" ? o : o.label}
            </option>
          ))}
        </Select>
      );
    case "checkbox":
      return (
        <CheckRow>
          <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <label htmlFor={id}>{f.label}</label>
        </CheckRow>
      );
    case "image":
    case "pdf":
      return (
        <ImageUploader
          value={value}
          accept={f.type === "pdf" ? "application/pdf" : "image/*"}
          label={f.type === "pdf" ? "Upload PDF" : "Upload image"}
          onUploaded={(url) => onChange(url)}
        />
      );
    case "images":
      return (
        <MultiImageUploader
          value={Array.isArray(value) ? value : []}
          onChange={(arr) => onChange(arr)}
          label={f.label || "Upload images"}
        />
      );
    default:
      return <Input id={id} value={value ?? ""} required={f.required} onChange={(e) => onChange(e.target.value)} />;
  }
}

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: ${({ theme }) => theme.space[6]};
  h1 { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; color: ${({ theme }) => theme.colors.text}; }
`;
const TableWrap = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg}; overflow-x: auto;
`;
const Table = styled.table`
  width: 100%; border-collapse: collapse; font-size: ${({ theme }) => theme.fontSizes.sm};
  th, td { padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`}; text-align: left; vertical-align: middle; }
  thead th { color: ${({ theme }) => theme.colors.textMuted}; font-weight: 600; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; white-space: nowrap; }
  tbody tr { border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  tbody tr:last-child { border-bottom: none; }
  tbody td { color: ${({ theme }) => theme.colors.text}; }
`;
const Actions = styled.div`display: flex; gap: ${({ theme }) => theme.space[2]}; justify-content: flex-end;`;
const IconBtn = styled.button`
  width: 34px; height: 34px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.secondary)};
  background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerSoft : theme.colors.secondarySoft)};
  &:hover { opacity: 0.85; }
`;
const SkeletonRows = styled.div`display: flex; flex-direction: column; gap: 1px; padding: ${({ theme }) => theme.space[2]};`;
const Empty = styled.div`padding: ${({ theme }) => theme.space[16]}; text-align: center; color: ${({ theme }) => theme.colors.textMuted};`;
const FormGrid = styled.form`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]};
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const CheckRow = styled.div`
  display: flex; align-items: center; gap: 8px;
  input { width: 18px; height: 18px; }
  label { font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600; }
`;

export default ResourceManager;
