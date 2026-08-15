import { useState } from "react";
import styled from "styled-components";
import { ArrowLeft, Download, Calendar, Link2, Check } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { useFetch } from "../lib/useFetch";
import { formatDate } from "../lib/format";
import { Container, Section } from "../components/ui/Layout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { RichText } from "../components/RichText";
import { SmartImage } from "../components/SmartImage";
import { FetchError } from "../components/FetchError";
import { Lightbox } from "../components/Lightbox";
import { Reveal } from "../components/Reveal";
import { NotFound } from "./NotFound";

export function NoticeDetail({ id }) {
  const { t, pickLang, lang } = useLang();
  const toast = useToast();
  const { data, loading, error, refetch } = useFetch(`/notices/${id}`, [id]);
  const [lb, setLb] = useState(null);
  const [copied, setCopied] = useState(false);
  const notice = data?.notice;

  if (loading) {
    return (
      <Section><Container $narrow>
        <Skeleton $h="1.4rem" $w="40%" /><div style={{ height: 14 }} />
        <Skeleton $h="2.4rem" $w="80%" /><div style={{ height: 20 }} />
        <Skeleton $h="1rem" /><div style={{ height: 8 }} /><Skeleton $h="1rem" $w="92%" />
      </Container></Section>
    );
  }
  if (error) return <Section><Container $narrow><FetchError onRetry={refetch} /></Container></Section>;
  if (!notice) return <NotFound />;

  if (typeof document !== "undefined") document.title = `${pickLang(notice, "title")} · Notice Board`;

  const gallery = [notice.imageUrl, ...(notice.images || [])].filter(Boolean).map((src) => ({ imageUrl: src, title: pickLang(notice, "title") }));

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); toast.success("Link copied"); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error("Could not copy link"); }
  };

  return (
    <Section>
      <Container $narrow as={Reveal}>
        <BackLink to="/notices"><ArrowLeft size={16} /> {t("nav.notices")}</BackLink>

        <Tags>
          <Badge $tone={notice.category === "academic" ? "secondary" : "neutral"}>
            {notice.category === "academic" ? t("notices.filterAcademic") : t("notices.filterAdministrative")}
          </Badge>
          {notice.priority === "urgent" && <Badge $tone="danger">{lang === "ne" ? "जरुरी" : "Urgent"}</Badge>}
          {notice.priority === "important" && <Badge $tone="warning">{lang === "ne" ? "महत्त्वपूर्ण" : "Important"}</Badge>}
        </Tags>

        <Title lang={pickLang(notice, "title") === notice.titleNe ? "ne" : undefined}>{pickLang(notice, "title")}</Title>
        <MetaRow>
          <span><Calendar size={15} /> {formatDate(notice.publishedAt || notice.createdAt, lang)}</span>
          <CopyBtn onClick={copyLink}>{copied ? <Check size={15} /> : <Link2 size={15} />} {copied ? "Copied" : "Share"}</CopyBtn>
        </MetaRow>

        {gallery[0] && (
          <Cover onClick={() => setLb(0)}>
            <SmartImage src={gallery[0].imageUrl} alt={pickLang(notice, "title")} height="360px" />
          </Cover>
        )}

        <Body><RichText html={pickLang(notice, "body")} /></Body>

        {gallery.length > 1 && (
          <Thumbs>
            {gallery.slice(1).map((g, i) => (
              <button key={i} onClick={() => setLb(i + 1)} aria-label="Open image">
                <SmartImage src={g.imageUrl} alt="" height="96px" />
              </button>
            ))}
          </Thumbs>
        )}

        {notice.attachmentUrl && (
          <Button as="a" href={notice.attachmentUrl} target="_blank" rel="noreferrer" $variant="primary" $size="lg" style={{ marginTop: 24 }}>
            <Download size={18} /> {t("common.downloadPdf")}
          </Button>
        )}
      </Container>

      <Lightbox items={gallery} index={lb} onClose={() => setLb(null)} onNavigate={setLb} />
    </Section>
  );
}

const BackLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px; color: ${({ theme }) => theme.colors.secondary};
  font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm}; margin-bottom: ${({ theme }) => theme.space[5]};
  &:hover { gap: 10px; }
`;
const Tags = styled.div`display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: ${({ theme }) => theme.space[3]};`;
const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["4xl"]}; color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  ${({ theme }) => theme.media.tablet(`font-size: 2rem;`)}
`;
const MetaRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.space[4]};
  margin: ${({ theme }) => theme.space[3]} 0 ${({ theme }) => theme.space[6]}; flex-wrap: wrap;
  span { display: inline-flex; align-items: center; gap: 6px; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;
const CopyBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary}; background: ${({ theme }) => theme.colors.secondarySoft};
  padding: 6px 12px; border-radius: ${({ theme }) => theme.radii.pill};
`;
const Cover = styled.button`
  display: block; width: 100%; border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border}; margin-bottom: ${({ theme }) => theme.space[6]};
`;
const Body = styled.div`font-size: ${({ theme }) => theme.fontSizes.lg}; line-height: ${({ theme }) => theme.lineHeights.relaxed};`;
const Thumbs = styled.div`
  display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.space[3]}; margin-top: ${({ theme }) => theme.space[5]};
  button { width: 130px; border-radius: ${({ theme }) => theme.radii.md}; overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.border}; }
`;

export default NoticeDetail;
