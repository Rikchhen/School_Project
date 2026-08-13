import styled from "styled-components";
import { Link } from "../lib/router";
import { useLang } from "../context/LanguageContext";
import { Button } from "../components/ui/Button";

export function NotFound() {
  const { t } = useLang();
  return (
    <Wrap>
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Button as={Link} to="/" $variant="primary" $size="lg">{t("common.backHome")}</Button>
    </Wrap>
  );
}

const Wrap = styled.div`
  min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: ${({ theme }) => theme.space[4]}; text-align: center; padding: ${({ theme }) => theme.space[16]};
  h1 { font-size: 5rem; color: ${({ theme }) => theme.colors.primary}; }
  p { color: ${({ theme }) => theme.colors.textBody}; }
`;

export default NotFound;
