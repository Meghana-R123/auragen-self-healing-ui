import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../lib/socket.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function scoreSignals(signals) {
  const score =
    (Math.min(signals.rageClicks, 5) / 5) * 30 +
    (Math.min(signals.hesitationSeconds, 20) / 20) * 25 +
    clamp(signals.erraticMovement, 0, 1) * 25 +
    (Math.min(signals.invalidAttempts, 5) / 5) * 20;
  return Math.round(clamp(score, 0, 100));
}

export function useTelemetry() {
  const [signals, setSignals] = useState({
    rageClicks: 0,
    hesitationSeconds: 0,
    erraticMovement: 0,
    invalidAttempts: 0,
    pointerEvents: 0
  });
  const [serverUpdate, setServerUpdate] = useState(null);
  const lastPointer = useRef(null);
  const recentClicks = useRef([]);
  const fieldFocusAt = useRef(null);
  const movementSamples = useRef([]);
  const lastSentAt = useRef(0);

  const updateSignal = useCallback((key, value) => {
    setSignals((current) => {
      const next = { ...current, [key]: value };
      return next;
    });
  }, []);

  useEffect(() => {
    const onPointerMove = (event) => {
      const now = Date.now();
      if (lastPointer.current) {
        const dx = event.clientX - lastPointer.current.x;
        const dy = event.clientY - lastPointer.current.y;
        const dt = Math.max(now - lastPointer.current.time, 1);
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        movementSamples.current.push(speed);
        if (movementSamples.current.length > 30) movementSamples.current.shift();

        const samples = movementSamples.current;
        const average = samples.reduce((a, b) => a + b, 0) / Math.max(samples.length, 1);
        const variance = samples.reduce((sum, v) => sum + (v - average) ** 2, 0) / Math.max(samples.length, 1);
        const erratic = clamp(Math.sqrt(variance) / 2.5, 0, 1);
        updateSignal("erraticMovement", Number(erratic.toFixed(2)));
      }
      lastPointer.current = { x: event.clientX, y: event.clientY, time: now };
      setSignals((current) => ({ ...current, pointerEvents: current.pointerEvents + 1 }));
    };

    const onClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const clickable = target.closest("button, [role='button']");
      if (!clickable) return;

      const now = Date.now();
      recentClicks.current = recentClicks.current.filter((time) => now - time < 2500);
      recentClicks.current.push(now);
      if (recentClicks.current.length >= 4) {
        updateSignal("rageClicks", Math.min(recentClicks.current.length - 3, 5));
      }
    };

    const onFocusIn = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        fieldFocusAt.current = Date.now();
      }
    };

    const onFocusOut = (event) => {
      if (!fieldFocusAt.current) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        const seconds = Math.round((Date.now() - fieldFocusAt.current) / 1000);
        updateSignal("hesitationSeconds", Math.min(seconds, 20));
        fieldFocusAt.current = null;
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("click", onClick, true);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, [updateSignal]);

  const reportInvalidAttempt = useCallback(() => {
    setSignals((current) => ({ ...current, invalidAttempts: Math.min(current.invalidAttempts + 1, 5) }));
  }, []);

  const resetSignals = useCallback(() => {
    recentClicks.current = [];
    movementSamples.current = [];
    setSignals({
      rageClicks: 0,
      hesitationSeconds: 0,
      erraticMovement: 0,
      invalidAttempts: 0,
      pointerEvents: 0
    });
  }, []);

  useEffect(() => {
    const send = () => {
      const now = Date.now();
      if (now - lastSentAt.current < 500) return;
      lastSentAt.current = now;
      socket.emit("telemetry", { signals: {
        rageClicks: signals.rageClicks,
        hesitationSeconds: signals.hesitationSeconds,
        erraticMovement: signals.erraticMovement,
        invalidAttempts: signals.invalidAttempts
      }});
    };
    send();
  }, [signals]);

  useEffect(() => {
    const handleUpdate = (update) => setServerUpdate(update);
    socket.on("telemetry:update", handleUpdate);
    return () => socket.off("telemetry:update", handleUpdate);
  }, []);

  return {
    signals,
    score: scoreSignals(signals),
    serverUpdate,
    reportInvalidAttempt,
    resetSignals,
    connected: socket.connected
  };
}
