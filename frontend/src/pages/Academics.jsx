import { useState } from "react";
import styled from "styled-components";
import { FlaskConical, TrendingUp, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { useFetch } from "../lib/useFetch";
import { PageHero } from "../components/PageHero";
import { Container, Section } from "../components/ui/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const PROGRAMS = [
  {
    cat: "science",
    icon: FlaskConical, accent: "primary", name: "Science", nameNe: "विज्ञान (कक्षा ११-१२)",
    desc: "A rigorous program designed for students aiming for careers in medicine, engineering, technology, and pure sciences. Emphasizing practical laboratory work and theoretical understanding.",
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Nepali"],
  },
  {
    cat: "management",
    icon: TrendingUp, accent: "secondary", name: "Management", nameNe: "व्यवस्थापन",
    desc: "Preparing future business leaders and entrepreneurs with practical knowledge in finance, marketing, and business operations.",
    areas: ["Accountancy", "Economics", "Business Studies", "Computer Science / Hotel Management"],
  },
  {
    cat: "humanities",
    icon: BookOpen, accent: "secondary", name: "Humanities", nameNe: "मानविकी",
    desc: "Fostering critical thinking, social awareness, and communication skills for careers in civil service, media, and social sciences.",
    areas: ["Sociology", "Mass Communication", "Major English / Nepali", "Rural Development"],
  },
  {
    cat: "general",
    icon: GraduationCap, accent: "primary", name: "General Secondary Education", nameNe: "माध्यमिक शिक्षा (कक्षा ९-१०)",
    desc: "Our foundational program aligns with the national curriculum, providing a robust base in compulsory and optional subjects, preparing students for the SEE (Secondary Education Examination).",
    subjects: ["Compulsory Math", "Science", "Social Studies", "Opt. Math/Economics"],
  },
];

const CATS = [
  { key: "all", label: "common.all" },
  { key: "science", label: "faculty.filterAll", raw: "Science" },
  { key: "management", label: null, raw: "Management" },
  { key: "humanities", label: null, raw: "Humanities" },
  { key: "general", label: null, raw: "General" },
];

const CAT_ICON = { science: FlaskConical, management: TrendingUp, humanities: BookOpen, general: GraduationCap };

export function Academics() {
  const { t, lang, pickLang } = useLang();
  const [cat, setCat] = useState("all");
  const { data } = useFetch("/programs?published=true");

  const apiPrograms = data?.items || [];
  const list = apiPrograms.length
    ? apiPrograms.map((p) => ({
        cat: p.category,
        icon: CAT_ICON[p.category] || GraduationCap,
        accent: p.accent || "primary",
        name: p.name,
        nameNe: p.nameNe,
        desc: pickLang(p, "description"),
        subjects: p.coreSubjects && p.coreSubjects.length ? p.coreSubjects : undefined,
        areas: p.keyAreas && p.keyAreas.length ? p.keyAreas : undefined,
      }))
    : PROGRAMS;

  const shown = cat === "all" ? list : list.filter((p) => p.cat === cat);

  return (
    <>
      <PageHero title={t("academics.title")} titleNe="शैक्षिक कार्यक्रम र पाठ्यक्रमहरू" subtitle={t("academics.subtitle")} lang={lang} />

      <Section>
        <Container>
          <Tabs>
            {CATS.map((c) => (
              <Tab key={c.key} $active={cat === c.key} onClick={() => setCat(c.key)}>
                {c.key === "all" ? t("common.all") : c.raw}
              </Tab>
            ))}
          </Tabs>
          <ProgramGrid>
            {shown.map((p) => {
              const Icon = p.icon;
              return (
                <ProgramCard key={p.name} $accent={p.accent} $hover>
                  <Head>
                    <IconRound $tone={p.accent}><Icon size={22} /></IconRound>
                    <div>
                      <h3 lang={lang === "ne" ? "ne" : undefined}>{lang === "ne" ? p.nameNe : p.name}</h3>
                    </div>
                  </Head>
                  <p>{p.desc}</p>
                  {p.subjects && (
                    <>
                      <Label>{t("academics.coreSubjects")}</Label>
                      <Chips>{p.subjects.map((s) => <Badge key={s} $tone="secondary">{s}</Badge>)}</Chips>
                    </>
                  )}
                  {p.areas && (
                    <>
                      <Label>{t("academics.keyAreas")}</Label>
                      <ul>{p.areas.map((a) => <li key={a}>{a}</li>)}</ul>
                    </>
                  )}
                  <Button as={Link} to="/admissions" $variant={p.accent === "primary" ? "primary" : "outline"} $size="sm" $rounded="md">
                    {t("academics.viewSyllabus")} <ArrowRight size={15} />
                  </Button>
                </ProgramCard>
              );
            })}
          </ProgramGrid>
        </Container>
      </Section>

      <Section>
        <Container>
          <Cta>
            <h2>{t("academics.ctaTitle")}</h2>
            <p>{t("academics.ctaBody")}</p>
            <CtaActions>
              <Button as={Link} to="/admissions" $variant="secondary" $size="lg">{t("academics.ctaGuidelines")}</Button>
              <Button as={Link} to="/contact" $variant="outline" $size="lg">{t("academics.ctaContact")}</Button>
            </CtaActions>
          </Cta>
        </Container>
      </Section>
    </>
  );
}

const Tabs = styled.div`
  display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.space[2]};
  justify-content: center; margin-bottom: ${({ theme }) => theme.space[8]};
`;
const Tab = styled.button`
  padding: ${({ theme }) => `${theme.space[2]} ${theme.space[5]}`};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.textBody)};
  transition: all ${({ theme }) => theme.transitions.base};
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;
const ProgramGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${({ theme }) => theme.space[6]};
  ${({ theme }) => theme.media.tablet(`grid-template-columns: 1fr;`)}
`;
const ProgramCard = styled(Card)`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[6]};
  p { color: ${({ theme }) => theme.colors.textBody}; line-height: ${({ theme }) => theme.lineHeights.relaxed}; }
  ul { display: flex; flex-direction: column; gap: 4px; color: ${({ theme }) => theme.colors.textBody}; }
  ul li::before { content: "•"; color: ${({ theme }) => theme.colors.primary}; margin-right: 8px; }
  button, a { align-self: flex-start; margin-top: auto; }
`;
const Head = styled.div`
  display: flex; align-items: center; gap: ${({ theme }) => theme.space[3]};
  h3 { color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes.xl}; }
  span { color: ${({ theme }) => theme.colors.secondary}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;
const IconRound = styled.div`
  width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primarySoft : theme.colors.secondarySoft)};
  color: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primary : theme.colors.secondary)};
`;
const Label = styled.strong`
  color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const Chips = styled.div`display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.space[2]};`;
const Cta = styled.div`
  background: ${({ theme }) => theme.gradients.brandBanner};
  color: #fff; text-align: center;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.space[16]} ${({ theme }) => theme.space[8]};
  h2 { color: #fff; font-size: ${({ theme }) => theme.fontSizes["4xl"]}; margin-bottom: ${({ theme }) => theme.space[3]}; }
  p { color: rgba(255,255,255,0.9); max-width: 620px; margin-inline: auto; }
`;
const CtaActions = styled.div`
  display: flex; gap: ${({ theme }) => theme.space[3]}; justify-content: center; margin-top: ${({ theme }) => theme.space[6]};
  flex-wrap: wrap;
`;

export default Academics;
