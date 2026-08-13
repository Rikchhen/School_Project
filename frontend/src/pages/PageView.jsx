import styled from "styled-components";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useFetch } from "../lib/useFetch";
import { PageHero } from "../components/PageHero";
import { Container, Section } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { RichText } from "../components/RichText";
import { SmartImage } from "../components/SmartImage";

/**
 * Generic renderer for any admin-created page, reachable at /page/<slug>.
 * Known slugs (about, home-mission, donation) have their own dedicated pages;
 * this covers every other custom page so it is actually viewable.
 */
export function PageView({ slug }) {
  const { t, pickLang, lang } = useLang();
  const { data, loading, error } = useFetch(`/pages/${encodeURIComponent(slug)}`, [slug]);
  const page = data?.page;

  if (loading) {
    return (
      <Section>
        <Container $narrow>
          <Skeleton $h="2.5rem" $w="60%" />
          <div style={{ height: 16 }} />
          <Skeleton $h="1rem" /><div style={{ height: 8 }} />
          <Skeleton $h="1rem" $w="90%" /><div style={{ height: 8 }} />
          <Skeleton $h="1rem" $w="80%" />
        </Container>
      </Section>
    );
  }

  if (error || !page) {
    return (
      <Section>
        <Container $narrow>
          <Missing>
            <h1>Page not found</h1>
            <p>No page exists with the address “/page/{slug}”.</p>
            <Button as={Link} to="/" $variant="primary">{t("common.backHome")}</Button>
          </Missing>
        </Container>
      </Section>
    );
  }

  const extra = Object.entries(page.content || {}).filter(([k]) => k !== "imageUrl");

  return (
    <>
      <PageHero title={pickLang(page, "title")} lang={lang} />
      <Section>
        <Container $narrow>
          {page.content?.imageUrl && (
            <Banner><SmartImage src={page.content.imageUrl} alt={pickLang(page, "title")} height="320px" /></Banner>
          )}
          {pickLang(page, "body") && <RichText html={pickLang(page, "body")} />}
          {extra.length > 0 && (
            <Details $pad={6}>
              {extra.map(([k, v]) => (
                <Row key={k}>
                  <dt>{k}</dt>
                  <dd>{String(v)}</dd>
                </Row>
              ))}
            </Details>
          )}
        </Container>
      </Section>
    </>
  );
}

const Banner = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border}; margin-bottom: ${({ theme }) => theme.space[6]};
`;
const Details = styled(Card)`
  margin-top: ${({ theme }) => theme.space[6]};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[2]};
`;
const Row = styled.dl`
  display: grid; grid-template-columns: 200px 1fr; gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[2]} 0; border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  dt { color: ${({ theme }) => theme.colors.textMuted}; font-weight: 600; text-transform: capitalize; }
  dd { color: ${({ theme }) => theme.colors.text}; }
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const Missing = styled.div`
  text-align: center; padding: ${({ theme }) => theme.space[16]} 0; display: flex; flex-direction: column; align-items: center; gap: ${({ theme }) => theme.space[4]};
  h1 { color: ${({ theme }) => theme.colors.primary}; }
  p { color: ${({ theme }) => theme.colors.textBody}; }
`;

export default PageView;
