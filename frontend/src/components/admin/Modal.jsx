import { useEffect } from "react";
import styled from "styled-components";
import { X } from "lucide-react";

export function Modal({ open, title, onClose, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Overlay onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <Panel onClick={(e) => e.stopPropagation()} $width={width}>
        <Header>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </Header>
        <Content>{children}</Content>
        {footer && <Footer>{footer}</Footer>}
      </Panel>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: ${({ theme }) => theme.zIndex.modal};
  background: ${({ theme }) => theme.colors.overlay};
  display: grid; place-items: center; padding: ${({ theme }) => theme.space[4]};
`;
const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  width: 100%; max-width: ${({ $width }) => $width || "560px"};
  max-height: 90vh; display: flex; flex-direction: column;
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: ${({ theme }) => theme.space[5]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h2 { font-size: ${({ theme }) => theme.fontSizes.xl}; color: ${({ theme }) => theme.colors.text}; }
  button { color: ${({ theme }) => theme.colors.textMuted}; &:hover { color: ${({ theme }) => theme.colors.text}; } }
`;
const Content = styled.div`padding: ${({ theme }) => theme.space[5]}; overflow-y: auto;`;
const Footer = styled.div`
  display: flex; justify-content: flex-end; gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[5]}; border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export default Modal;
