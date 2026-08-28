import { useEffect, useState } from "react";
import styled from "styled-components";
import { LogIn, ShieldCheck } from "lucide-react";
import { useRouter } from "../../lib/router";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Label, Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import logo from "../../assets/images/logo.png";

export function AdminLogin() {
  const { t } = useLang();
  const { login, isAuthenticated, loading } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/admin", { replace: true });
  }, [loading, isAuthenticated, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await login(email, password, twoFactorCode);
      if (result.requiresTwoFactor) { setNeedsTwoFactor(true); return; }
      toast.success("Welcome back!");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrap>
      <LoginCard as="form" onSubmit={submit}>
        <Brand>
          <img src={logo} alt="" width={52} height={52} />
          <h1><ShieldCheck size={20} /> {t("admin.login")}</h1>
          <p>{t("admin.loginSubtitle")}</p>
        </Brand>
        <Field>
          <Label htmlFor="l-email">{t("admin.email")}</Label>
          <Input id="l-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </Field>
        {needsTwoFactor && <Field>
          <Label htmlFor="l-2fa">Authenticator or recovery code</Label>
          <Input id="l-2fa" required value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} autoComplete="one-time-code" inputMode="numeric" />
        </Field>}
        <Field>
          <Label htmlFor="l-pass">{t("admin.password")}</Label>
          <PasswordInput id="l-pass" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <Button type="submit" $variant="primary" $size="lg" disabled={busy} $fullWidth>
          <LogIn size={18} /> {busy ? `${t("common.loading")}…` : t("admin.signIn")}
        </Button>
        <Hint>Seeded demo admin: <code>admin@adarsha.edu.np</code> / <code>Admin@12345</code></Hint>
      </LoginCard>
    </Wrap>
  );
}

const Wrap = styled.div`
  min-height: 100vh; display: grid; place-items: center; padding: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.gradients.secondary};
`;
const LoginCard = styled(Card)`
  width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: ${({ theme }) => theme.space[4]};
  padding: ${({ theme }) => theme.space[8]};
`;
const Brand = styled.div`
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: ${({ theme }) => theme.space[2]};
  img { border-radius: ${({ theme }) => theme.radii.pill}; }
  h1 { display: flex; align-items: center; gap: 8px; color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.fontSizes["2xl"]}; }
  p { color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;
const Hint = styled.p`
  text-align: center; font-size: ${({ theme }) => theme.fontSizes.xs}; color: ${({ theme }) => theme.colors.textMuted};
  code { background: ${({ theme }) => theme.colors.surfaceAlt}; padding: 1px 5px; border-radius: 4px; }
`;

export default AdminLogin;
