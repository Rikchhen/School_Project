import { useState } from "react";
import styled from "styled-components";
import { useLang } from "../context/LanguageContext";
import { useFetch } from "../lib/useFetch";
import { PageHero } from "../components/PageHero";
import { Container, Section } from "../components/ui/Layout";
import { Skeleton } from "../components/ui/Skeleton";
import { SmartImage } from "../components/SmartImage";
import { Lightbox } from "../components/Lightbox";

const ALBUMS = ["all", "campus", "events", "sports", "academics", "cultural", "general"];

export function Gallery() {
  const { t } = useLang();
  const [album, setAlbum] = useState("all");
  const [active, setActive] = useState(null);
  const { data, loading } = useFetch("/gallery?published=true&limit=100");
  const all = data?.items || [];
  const items = album === "all" ? all : all.filter((g) => g.album === album);

  return (
    <>
      <PageHero title={t("gallery.title")} titleNe="फोटो ग्यालरी" subtitle={t("gallery.subtitle")} />
      <Section $bg="alt">
        <Container>
          <Filters>
            {ALBUMS.map((a) => (
              <Chip key={a} $active={album === a} onClick={() => setAlbum(a)}>{a === "all" ? t("common.all") : a}</Chip>
            ))}
          </Filters>

          {loading ? (
            <Masonry>{[...Array(8)].map((_, i) => <Skeleton key={i} $h="200px" $radius="lg" />)}</Masonry>
          ) : items.length === 0 ? (
            <Empty>{t("gallery.empty")}</Empty>
          ) : (
            <Masonry>
              {items.map((g, i) => (
                <Tile key={g._id} onClick={() => setActive(i)} aria-label={`Open ${g.title}`}>
                  <SmartImage src={g.imageUrl} alt={g.title} height="200px" />
                  <Overlay><span>{g.title}</span></Overlay>
                </Tile>
              ))}
            </Masonry>
          )}
        </Container>
      </Section>

      <Lightbox items={items} index={active} onClose={() => setActive(null)} onNavigate={setActive} />
    </>
  );
}

const Filters = styled.div`display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.space[2]}; justify-content: center; margin-bottom: ${({ theme }) => theme.space[8]};`;
const Chip = styled.button`
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[4]}`}; border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600; text-transform: capitalize;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.textBody)};
`;
const Masonry = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: ${({ theme }) => theme.space[4]};
  ${({ theme }) => theme.media.laptop(`grid-template-columns: repeat(3, 1fr);`)}
  ${({ theme }) => theme.media.tablet(`grid-template-columns: repeat(2, 1fr);`)}
  ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)}
`;
const Tile = styled.button`
  position: relative; border-radius: ${({ theme }) => theme.radii.lg}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border}; display: block;
  &:hover > div { opacity: 1; }
`;
const Overlay = styled.div`
  position: absolute; inset: 0; display: flex; align-items: flex-end; padding: ${({ theme }) => theme.space[3]};
  background: linear-gradient(to top, rgba(0,0,0,0.65), transparent 60%);
  opacity: 0; transition: opacity ${({ theme }) => theme.transitions.base};
  span { color: #fff; font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.sm}; text-align: left; }
`;
const Empty = styled.p`text-align: center; color: ${({ theme }) => theme.colors.textMuted}; padding: ${({ theme }) => theme.space[16]};`;

export default Gallery;
