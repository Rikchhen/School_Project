import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useLang } from "../../context/LanguageContext";
import { Button } from "../../components/ui/Button";
import { Field, Label, Input, Textarea } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { Modal } from "../../components/admin/Modal";
import { ImageUploader } from "../../components/ImageUploader";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { FieldsEditor } from "../../components/admin/FieldsEditor";

const EMPTY = { slug: "", title: "", titleNe: "", body: "", bodyNe: "", content: {}, imageUrl: "", published: true };

export function ManagePages() {
  const toast = useToast();
  const { t } = useLang();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const r = await api.get("/pages");
      setItems(r.items || []);
    } catch (e) {
      toast.error(e.message); setItems([]);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    // Keep the image out of the raw JSON box; it has its own uploader field.
    const { imageUrl = "", ...restContent } = p.content || {};
    setForm({
      slug: p.slug, title: p.title, titleNe: p.titleNe || "", body: p.body || "",
      bodyNe: p.bodyNe || "", content: restContent,
      imageUrl, published: p.published,
    });
    setOpen(true);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.type === "checkbox" ? e.target.checked : e.target.value }));

  // Where each page is shown on the public site.
  const viewUrl = (slug) => {
    const known = { about: "/about", "home-mission": "/", donation: "/donation" };
    return known[slug] || `/page/${encodeURIComponent(slug)}`;
  };

  const save = async (e) => {
    e.preventDefault();
    const content = { ...(form.content || {}) };
    // Merge the uploaded image back into the content object.
    if (form.imageUrl) content.imageUrl = form.imageUrl;
    else delete content.imageUrl;
    setSaving(true);
    try {
      await api.put("/pages", {
        slug: form.slug, title: form.title, titleNe: form.titleNe,
        body: form.body, bodyNe: form.bodyNe, content, published: form.published,
      });
      toast.success("Page saved");
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally { setSaving(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    try { await api.del(`/pages/${p.slug}`); toast.success("Page deleted"); await load(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <Header>
        <h1>{t("admin.managePages")}</h1>
        <Button $variant="primary" onClick={openCreate}><Plus size={18} /> {t("admin.create")}</Button>
      </Header>

      <TableWrap>
        {items === null ? (
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {[0, 1, 2].map((i) => <Skeleton key={i} $h="48px" />)}
          </div>
        ) : items.length === 0 ? (
          <Empty>{t("admin.noItems")}</Empty>
        ) : (
          <Table>
            <thead><tr><th>Slug</th><th>Title</th><th>Live</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td><code>{p.slug}</code></td>
                  <td><strong>{p.title}</strong></td>
                  <td>{p.published ? "✓" : "—"}</td>
                  <td>
                    <Actions>
                      <IconLink href={viewUrl(p.slug)} target="_blank" rel="noreferrer" aria-label="View on site" title="View on site"><ExternalLink size={16} /></IconLink>
                      <IconBtn onClick={() => openEdit(p)} aria-label="Edit"><Pencil size={16} /></IconBtn>
                      <IconBtn $danger onClick={() => remove(p)} aria-label="Delete"><Trash2 size={16} /></IconBtn>
                    </Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrap>

      <Modal
        open={open}
        title={`${editing ? t("admin.edit") : t("admin.create")} — ${t("admin.managePages")}`}
        onClose={() => setOpen(false)}
        width="640px"
        footer={
          <>
            <Button $variant="ghost" onClick={() => setOpen(false)}>{t("admin.cancel")}</Button>
            <Button $variant="primary" onClick={save} disabled={saving}>{saving ? "…" : t("admin.save")}</Button>
          </>
        }
      >
        <FormGrid onSubmit={save}>
          <Field>
            <Label>Slug <span data-req>*</span></Label>
            <Input value={form.slug} onChange={set("slug")} required disabled={!!editing} placeholder="about" />
          </Field>
          <Field>
            <Label>Title (English) <span data-req>*</span></Label>
            <Input value={form.title} onChange={set("title")} required />
          </Field>
          <Field><Label>Title (Nepali)</Label><Input value={form.titleNe} onChange={set("titleNe")} /></Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Body (English)</Label>
            <RichTextEditor value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} />
          </Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Body (Nepali)</Label>
            <RichTextEditor value={form.bodyNe} onChange={(html) => setForm((f) => ({ ...f, bodyNe: html }))} />
          </Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Image</Label>
            <ImageUploader
              value={form.imageUrl}
              onUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            />
            <small style={{ color: "#6b7280" }}>
              Shown on the public page. Used by the <code>about</code> page (History image)
              and the <code>home-mission</code> section on the Home page.
            </small>
            {form.imageUrl && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                style={{ alignSelf: "flex-start", color: "#b1002c", fontSize: 13, fontWeight: 600 }}>
                Remove image
              </button>
            )}
          </Field>
          <Field style={{ gridColumn: "1 / -1" }}>
            <Label>Extra fields</Label>
            <FieldsEditor value={form.content} onChange={(content) => setForm((f) => ({ ...f, content }))} />
            <small style={{ color: "#6b7280" }}>Optional structured content (e.g. field “mission”, “vision”, “established”).</small>
          </Field>
          <CheckRow>
            <input id="p-pub" type="checkbox" checked={form.published} onChange={set("published")} />
            <label htmlFor="p-pub">Published</label>
          </CheckRow>
          <button type="submit" hidden />
        </FormGrid>
      </Modal>
    </>
  );
}

const Header = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: ${({ theme }) => theme.space[6]}; h1 { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }`;
const TableWrap = styled.div`background: ${({ theme }) => theme.colors.surface}; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.lg}; overflow-x: auto;`;
const Table = styled.table`
  width: 100%; border-collapse: collapse; font-size: ${({ theme }) => theme.fontSizes.sm};
  th, td { padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`}; text-align: left; }
  thead th { color: ${({ theme }) => theme.colors.textMuted}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  tbody tr { border-bottom: 1px solid ${({ theme }) => theme.colors.border}; } tbody tr:last-child { border-bottom: none; }
  code { background: ${({ theme }) => theme.colors.surfaceAlt}; padding: 2px 6px; border-radius: 4px; }
`;
const Actions = styled.div`display: flex; gap: 8px; justify-content: flex-end;`;
const IconBtn = styled.button`
  width: 34px; height: 34px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.secondary)};
  background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerSoft : theme.colors.secondarySoft)};
`;
const IconLink = styled.a`
  width: 34px; height: 34px; display: grid; place-items: center; border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textMuted}; background: ${({ theme }) => theme.colors.surfaceAlt};
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;
const Empty = styled.div`padding: ${({ theme }) => theme.space[16]}; text-align: center; color: ${({ theme }) => theme.colors.textMuted};`;
const FormGrid = styled.form`display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[4]}; ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}`;
const CheckRow = styled.div`display: flex; align-items: center; gap: 8px; input { width: 18px; height: 18px; } label { font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm}; }`;

export default ManagePages;
