import { useState } from "react";
import styled from "styled-components";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";

/**
 * Password field with a show/hide (eye) toggle. Drop-in replacement for a
 * password <Input> — pass the same props (value, onChange, id, autoComplete…).
 */
export function PasswordInput({ ...props }) {
  const [show, setShow] = useState(false);
  return (
    <Wrap>
      <Input {...props} type={show ? "text" : "password"} style={{ paddingRight: "2.75rem", ...(props.style || {}) }} />
      <Toggle
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </Toggle>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  display: block;
`;
const Toggle = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  padding: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radii.sm};
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

export default PasswordInput;
