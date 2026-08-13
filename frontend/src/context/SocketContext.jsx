import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

// In dev, socket.io is proxied through Vite (same origin). In prod, derive the
// socket origin from VITE_API_URL if it is an absolute URL.
function socketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || "/api";
  if (/^https?:\/\//.test(apiUrl)) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return undefined;
    }
  }
  return undefined; // same origin (dev proxy / co-hosted)
}

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(socketUrl(), {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({
      socket: socketRef,
      connected,
      /** Subscribe to an event; returns an unsubscribe function. */
      on(event, handler) {
        const s = socketRef.current;
        if (!s) return () => {};
        s.on(event, handler);
        return () => s.off(event, handler);
      },
    }),
    [connected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}

/**
 * Convenience hook: subscribe to a socket event for a component's lifetime.
 * Uses a ref so the handler can change without re-subscribing.
 */
export function useSocketEvent(event, handler) {
  const { on } = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const off = on(event, (...args) => handlerRef.current?.(...args));
    return off;
  }, [event, on]);
}

export default SocketContext;
