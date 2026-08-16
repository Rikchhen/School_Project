import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { AlertTriangle, Trash2, X } from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const previousFocus = useRef(null);
  const cancelRef = useRef(null);

  const confirm = useCallback((options) => new Promise((resolve) => {
    previousFocus.current = document.activeElement;
    setDialog({
      title: "Are you sure?",
      message: "This action cannot be undone.",
      confirmLabel: "Confirm",
      tone: "danger",
      ...options,
      resolve,
    });
  }), []);

  const finish = useCallback((answer) => {
    setDialog((current) => { current?.resolve(answer); return null; });
    requestAnimationFrame(() => previousFocus.current?.focus?.());
  }, []);

  useEffect(() => {
    if (!dialog) return;
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") finish(false);
      if (event.key === "Tab") {
        const controls = [...document.querySelectorAll('[data-confirm-dialog] button:not(:disabled)')];
        if (!controls.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; };
  }, [dialog, finish]);

  const value = {
    confirmDelete: (item = "this item") => confirm({ title: "Delete item?", message: `You are about to permanently delete ${item}. This action cannot be undone.`, confirmLabel: "Delete" }),
    confirmRemove: (item = "this item") => confirm({ title: "Remove item?", message: `Remove ${item}? Your unsaved changes will be lost.`, confirmLabel: "Remove" }),
    confirmDiscard: (message = "Discard your changes and close?") => confirm({ title: "Discard changes?", message, confirmLabel: "Discard" }),
  };

  return <ConfirmContext.Provider value={value}>
    {children}
    {dialog && <Backdrop onMouseDown={(event) => event.target === event.currentTarget && finish(false)}>
      <Dialog data-confirm-dialog role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <Close type="button" onClick={() => finish(false)} aria-label="Close confirmation"><X size={19} /></Close>
        <IconWrap><AlertTriangle size={28} aria-hidden="true" /></IconWrap>
        <h2 id="confirm-title">{dialog.title}</h2>
        <p id="confirm-message">{dialog.message}</p>
        <Actions>
          <Cancel ref={cancelRef} type="button" onClick={() => finish(false)}>Cancel</Cancel>
          <Confirm type="button" onClick={() => finish(true)}><Trash2 size={17} aria-hidden="true" /> {dialog.confirmLabel}</Confirm>
        </Actions>
      </Dialog>
    </Backdrop>}
  </ConfirmContext.Provider>;
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
}

const fade = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const rise = keyframes`from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; }`;
const Backdrop = styled.div`position: fixed; inset: 0; z-index: ${({ theme }) => theme.zIndex.modal + 10}; display: grid; place-items: center; padding: 20px; background: ${({ theme }) => theme.colors.overlay}; animation: ${fade} 140ms ease-out;`;
const Dialog = styled.div`position: relative; width: min(100%, 440px); padding: 30px; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.xl}; background: ${({ theme }) => theme.colors.surface}; box-shadow: ${({ theme }) => theme.shadows.xl}; text-align: center; animation: ${rise} 180ms ease-out; h2 { margin-top: 14px; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.fontSizes["2xl"]}; } p { margin: 10px auto 0; max-width: 38ch; color: ${({ theme }) => theme.colors.textBody}; line-height: 1.65; overflow-wrap: anywhere; } @media (prefers-reduced-motion: reduce) { animation: none; }`;
const IconWrap = styled.div`width: 60px; height: 60px; margin: 0 auto; display: grid; place-items: center; border-radius: 50%; color: ${({ theme }) => theme.colors.danger}; background: ${({ theme }) => theme.colors.dangerSoft};`;
const Close = styled.button`position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; color: ${({ theme }) => theme.colors.textMuted}; &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; color: ${({ theme }) => theme.colors.text}; }`;
const Actions = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 26px; ${({ theme }) => theme.media.mobile(`grid-template-columns: 1fr;`)} button { min-height: 46px; border-radius: ${({ theme }) => theme.radii.md}; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 8px; &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; } }`;
const Cancel = styled.button`color: ${({ theme }) => theme.colors.text}; background: ${({ theme }) => theme.colors.surfaceAlt}; border: 1px solid ${({ theme }) => theme.colors.border};`;
const Confirm = styled.button`color: #fff; background: ${({ theme }) => theme.colors.danger};`;
