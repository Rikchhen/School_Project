import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, opts = {}) => {
      const id = ++idRef.current;
      const duration = opts.duration ?? 4500;
      setToasts((list) => [...list, { id, type, message }]);
      if (duration > 0) setTimeout(() => remove(id), duration);
      return id;
    },
    [remove]
  );

  const toast = useMemo(
    () => ({
      success: (m, o) => push("success", m, o),
      error: (m, o) => push("error", m, o),
      info: (m, o) => push("info", m, o),
      dismiss: remove,
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Region role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <Toast key={t.id} $type={t.type} role="status">
              <Icon size={20} aria-hidden />
              <span>{t.message}</span>
              <Close onClick={() => remove(t.id)} aria-label="Dismiss">
                <X size={16} />
              </Close>
            </Toast>
          );
        })}
      </Region>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Region = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.space[4]};
  right: ${({ theme }) => theme.space[4]};
  z-index: ${({ theme }) => theme.zIndex.toast};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
  max-width: min(360px, calc(100vw - 2rem));
`;

const accent = (theme, type) =>
  ({
    success: theme.colors.success,
    error: theme.colors.danger,
    info: theme.colors.info,
  })[type] || theme.colors.info;

const Toast = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space[3]};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme, $type }) => accent(theme, $type)};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  animation: ${slideIn} ${({ theme }) => theme.transitions.base};

  svg:first-child { color: ${({ theme, $type }) => accent(theme, $type)}; flex-shrink: 0; }
  span { flex: 1; line-height: ${({ theme }) => theme.lineHeights.snug}; }
`;

const Close = styled.button`
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  padding: 2px;
  border-radius: ${({ theme }) => theme.radii.sm};
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

export default ToastContext;
