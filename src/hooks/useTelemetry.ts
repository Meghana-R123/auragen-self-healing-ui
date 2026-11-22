
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TelemetryEvent = {
  id: number;
  type: "focus" | "hesitation" | "click" | "error";
  field: string;
  timestamp: number;
  details: string;
};

export type AdaptationMode = "standard" | "simplified" | "guided";
export type AdaptationSource = "automatic" | "manual" | "ai";

export type AdaptationEvent = {
  id: number;
  mode: AdaptationMode;
  source: AdaptationSource;
  timestamp: number;
};

export type FieldFriction = {
  field: string;
  focusCount: number;
  hesitationCount: number;
  errorCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
  frictionScore: number;
};

type AuraGenSettings = {
  cognitiveLoadThreshold: number;
  hesitationThresholdMs: number;
  repeatedClickWindowMs: number;
  autoAdaptationEnabled: boolean;
};

type StoredTelemetry = {
  events?: TelemetryEvent[];
  interactionCount?: number;
  hesitationCount?: number;
  errorCount?: number;
  repeatedClickCount?: number;
  adaptationCount?: number;
  adaptationEvents?: AdaptationEvent[];
  fieldMetrics?: Record<string, FieldFriction>;
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

function calculateFieldScore(
  hesitationCount: number,
  errorCount: number,
  averageTimeMs: number,
  hesitationThresholdMs: number
) {
  const timeFactor = Math.min(
    20,
    Math.floor(averageTimeMs / Math.max(1, hesitationThresholdMs) * 10)
  );

  return Math.min(
    100,
    hesitationCount * 20 + errorCount * 25 + timeFactor
  );
}

export function useTelemetry() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [repeatedClickCount, setRepeatedClickCount] = useState(0);

  const [adaptationCount, setAdaptationCount] = useState(0);
  const [adaptationEvents, setAdaptationEvents] = useState<AdaptationEvent[]>([]);

  const [fieldMetrics, setFieldMetrics] = useState<Record<string, FieldFriction>>({});

  const [settings, setSettings] =
    useState<AuraGenSettings>(DEFAULT_SETTINGS);

  const [loaded, setLoaded] = useState(false);

  const focusTimes = useRef<Record<string, number>>({});
  const clickTimes = useRef<Record<string, number>>({});
  const activeFields = useRef<Set<string>>(new Set());

  const eventId = useRef(0);
  const adaptationId = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data: StoredTelemetry = JSON.parse(saved);

        setEvents(data.events ?? []);
        setInteractionCount(data.interactionCount ?? 0);
        setHesitationCount(data.hesitationCount ?? 0);
        setErrorCount(data.errorCount ?? 0);
        setRepeatedClickCount(data.repeatedClickCount ?? 0);

        setAdaptationCount(data.adaptationCount ?? 0);
        setAdaptationEvents(data.adaptationEvents ?? []);
        setFieldMetrics(data.fieldMetrics ?? {});

        eventId.current = Math.max(
          0,
          ...(data.events ?? []).map((event) => event.id)
        );

        adaptationId.current = Math.max(
          0,
          ...(data.adaptationEvents ?? []).map((event) => event.id)
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

      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const data: StoredTelemetry = JSON.parse(event.newValue);

          setEvents(data.events ?? []);
          setInteractionCount(data.interactionCount ?? 0);
          setHesitationCount(data.hesitationCount ?? 0);
          setErrorCount(data.errorCount ?? 0);
          setRepeatedClickCount(data.repeatedClickCount ?? 0);
          setAdaptationCount(data.adaptationCount ?? 0);
          setAdaptationEvents(data.adaptationEvents ?? []);
          setFieldMetrics(data.fieldMetrics ?? {});
        } catch (error) {
          console.error("Could not sync AuraGen telemetry:", error);
        }
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
        adaptationCount,
        adaptationEvents,
        fieldMetrics,
      })
    );
  }, [
    loaded,
    events,
    interactionCount,
    hesitationCount,
    errorCount,
    repeatedClickCount,
    adaptationCount,
    adaptationEvents,
    fieldMetrics,
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

  const updateFieldMetric = useCallback(
    (
      field: string,
      update: (previous: FieldFriction) => FieldFriction
    ) => {
      setFieldMetrics((previous) => {
        const current = previous[field] ?? {
          field,
          focusCount: 0,
          hesitationCount: 0,
          errorCount: 0,
          totalTimeMs: 0,
          averageTimeMs: 0,
          frictionScore: 0,
        };

        return {
          ...previous,
          [field]: update(current),
        };
      });
    },
    []
  );

  const trackFocus = useCallback(
    (field: string) => {
      if (activeFields.current.has(field)) return;

      activeFields.current.add(field);
      focusTimes.current[field] = Date.now();

      setInteractionCount((count) => count + 1);

      updateFieldMetric(field, (previous) => ({
        ...previous,
        focusCount: previous.focusCount + 1,
      }));

      addEvent("focus", field, "Field focused");
    },
    [addEvent, updateFieldMetric]
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

      updateFieldMetric(field, (previous) => {
        const totalTimeMs = previous.totalTimeMs + duration;
        const averageTimeMs = totalTimeMs / previous.focusCount;
        const hesitation =
          duration >= currentSettings.hesitationThresholdMs;

        const hesitationCount =
          previous.hesitationCount + (hesitation ? 1 : 0);

        return {
          ...previous,
          totalTimeMs,
          averageTimeMs,
          hesitationCount,
          frictionScore: calculateFieldScore(
            hesitationCount,
            previous.errorCount,
            averageTimeMs,
            currentSettings.hesitationThresholdMs
          ),
        };
      });

      if (duration >= currentSettings.hesitationThresholdMs) {
        setHesitationCount((count) => count + 1);

        addEvent(
          "hesitation",
          field,
          `Field occupied for ${(duration / 1000).toFixed(1)} seconds`
        );
      }
    },
    [addEvent, updateFieldMetric]
  );

  const trackError = useCallback(
    (field: string) => {
      setErrorCount((count) => count + 1);

      updateFieldMetric(field, (previous) => ({
        ...previous,
        errorCount: previous.errorCount + 1,
        frictionScore: calculateFieldScore(
          previous.hesitationCount,
          previous.errorCount + 1,
          previous.averageTimeMs,
          readSettings().hesitationThresholdMs
        ),
      }));

      addEvent("error", field, "Validation error");
    },
    [addEvent, updateFieldMetric]
  );

  const trackAdaptation = useCallback(
    (mode: AdaptationMode, source: AdaptationSource) => {
      const adaptation: AdaptationEvent = {
        id: ++adaptationId.current,
        mode,
        source,
        timestamp: Date.now(),
      };

      setAdaptationCount((count) => count + 1);

      setAdaptationEvents((previous) =>
        [adaptation, ...previous].slice(0, 30)
      );
    },
    []
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

  const shouldAdapt =
    settings.autoAdaptationEnabled && isHighFriction;

  const fieldFrictionList = Object.values(fieldMetrics).sort(
    (a, b) => b.frictionScore - a.frictionScore
  );

  return {
    events,
    interactionCount,
    hesitationCount,
    errorCount,
    repeatedClickCount,

    adaptationCount,
    adaptationEvents,
    trackAdaptation,

    fieldMetrics,
    fieldFrictionList,

    cognitiveLoadScore,
    settings,
    isHighFriction,
    shouldAdapt,

    trackFocus,
    trackClick,
    trackBlur,
    trackError,

    loaded,
  };
}
