
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TelemetryEvent = {
  id: number;
  type: "focus" | "hesitation" | "click" | "error";
  field: string;
  timestamp: number;
  details: string;
};

type AuraGenSettings = {
  cognitiveLoadThreshold: number;
  hesitationThresholdMs: number;
  repeatedClickWindowMs: number;
  autoAdaptationEnabled: boolean;
};

const STORAGE_KEY = "auragen-telemetry";
const SETTINGS_KEY = "auragen-settings";

const DEFAULT_SETTINGS: AuraGenSettings = {
  cognitiveLoadThreshold: 60,
  hesitationThresholdMs: 4000,
  repeatedClickWindowMs: 1500,
  autoAdaptationEnabled: false,
};

function readSettings(): AuraGenSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useTelemetry() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [repeatedClickCount, setRepeatedClickCount] = useState(0);
  const [settings, setSettings] =
    useState<AuraGenSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const focusTimes = useRef<Record<string, number>>({});
  const clickTimes = useRef<Record<string, number>>({});
  const activeFields = useRef<Set<string>>(new Set());
  const eventId = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data = JSON.parse(saved);

        setEvents(data.events ?? []);
        setInteractionCount(data.interactionCount ?? 0);
        setHesitationCount(data.hesitationCount ?? 0);
        setErrorCount(data.errorCount ?? 0);
        setRepeatedClickCount(data.repeatedClickCount ?? 0);

        eventId.current = Math.max(
          0,
          ...(data.events ?? []).map(
            (event: TelemetryEvent) => event.id
          )
        );
      }

      setSettings(readSettings());
    } catch (error) {
      console.error("Could not load AuraGen data:", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === SETTINGS_KEY) {
        setSettings(readSettings());
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        events,
        interactionCount,
        hesitationCount,
        errorCount,
        repeatedClickCount,
      })
    );
  }, [
    loaded,
    events,
    interactionCount,
    hesitationCount,
    errorCount,
    repeatedClickCount,
  ]);

  const addEvent = useCallback(
    (
      type: TelemetryEvent["type"],
      field: string,
      details: string
    ) => {
      const event: TelemetryEvent = {
        id: ++eventId.current,
        type,
        field,
        timestamp: Date.now(),
        details,
      };

      setEvents((previous) => [event, ...previous].slice(0, 30));
    },
    []
  );

  const trackFocus = useCallback(
    (field: string) => {
      if (activeFields.current.has(field)) return;

      activeFields.current.add(field);
      focusTimes.current[field] = Date.now();

      setInteractionCount((count) => count + 1);
      addEvent("focus", field, "Field focused");
    },
    [addEvent]
  );

  const trackClick = useCallback(
    (field: string) => {
      const now = Date.now();
      const previousClick = clickTimes.current[field];
      const currentSettings = readSettings();

      if (
        previousClick &&
        now - previousClick < currentSettings.repeatedClickWindowMs
      ) {
        setRepeatedClickCount((count) => count + 1);
        addEvent("click", field, "Repeated click detected");
      }

      clickTimes.current[field] = now;
    },
    [addEvent]
  );

  const trackBlur = useCallback(
    (field: string) => {
      activeFields.current.delete(field);

      const startTime = focusTimes.current[field];
      if (!startTime) return;

      const duration = Date.now() - startTime;
      delete focusTimes.current[field];

      const currentSettings = readSettings();

      if (duration >= currentSettings.hesitationThresholdMs) {
        setHesitationCount((count) => count + 1);

        addEvent(
          "hesitation",
          field,
          `Field occupied for ${(duration / 1000).toFixed(1)} seconds`
        );
      }
    },
    [addEvent]
  );

  const trackError = useCallback(
    (field: string) => {
      setErrorCount((count) => count + 1);
      addEvent("error", field, "Validation error");
    },
    [addEvent]
  );

  useEffect(() => {
    function handleInvalid(event: Event) {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        trackError(target.name || target.id || "unknown-field");
      }
    }

    document.addEventListener("invalid", handleInvalid, true);

    return () => {
      document.removeEventListener("invalid", handleInvalid, true);
    };
  }, [trackError]);

  const cognitiveLoadScore = Math.min(
    100,
    hesitationCount * 12 +
      repeatedClickCount * 10 +
      errorCount * 15
  );

  const isHighFriction =
    cognitiveLoadScore >= settings.cognitiveLoadThreshold;

  // Adaptation is permitted only when explicitly enabled in Settings.
  const shouldAdapt =
    settings.autoAdaptationEnabled && isHighFriction;

  return {
    events,
    interactionCount,
    hesitationCount,
    errorCount,
    repeatedClickCount,
    cognitiveLoadScore,
    settings,
    isHighFriction,
    shouldAdapt,
    trackFocus,
    trackClick,
    trackBlur,
    trackError,
  };
}
