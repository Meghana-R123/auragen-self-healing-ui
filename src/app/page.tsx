
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "auragen-telemetry";

type TelemetryEvent = {
  id: number;
  type: string;
  field: string;
  timestamp: number;
  details: string;
};

type AdaptationEvent = {
  id: number;
  mode: "standard" | "simplified" | "guided";
  source: "automatic" | "manual" | "ai";
  timestamp: number;
};

type TelemetryData = {
  events: TelemetryEvent[];
  interactionCount: number;
  hesitationCount: number;
  errorCount: number;
  repeatedClickCount: number;
  adaptationCount: number;
  adaptationEvents: AdaptationEvent[];
};

const emptyData: TelemetryData = {
  events: [],
  interactionCount: 0,
  hesitationCount: 0,
  errorCount: 0,
  repeatedClickCount: 0,
  adaptationCount: 0,
  adaptationEvents: [],
};

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function getSourceLabel(source: AdaptationEvent["source"]) {
  switch (source) {
    case "ai":
      return "AI Generated";
    case "manual":
      return "Manual";
    case "automatic":
      return "Automatic";
  }
}

export default function Home() {
  const [data, setData] = useState<TelemetryData>(emptyData);

  const loadTelemetry = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        setData({
          ...emptyData,
          ...parsed,
          events: parsed.events ?? [],
          adaptationEvents: parsed.adaptationEvents ?? [],
        });
      } else {
        setData(emptyData);
      }
    } catch (error) {
      console.error("Unable to load telemetry:", error);
    }
  }, []);

  useEffect(() => {
    loadTelemetry();

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) {
        loadTelemetry();
      }
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadTelemetry);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadTelemetry);
    };
  }, [loadTelemetry]);

  const interactions = data.interactionCount;
  const hesitations = data.hesitationCount;
  const errors = data.errorCount;
  const repeatedClicks = data.repeatedClickCount;

  const cognitiveLoadScore = Math.min(
    100,
    hesitations * 12 + repeatedClicks * 10 + errors * 15
  );

  const recentEvents = data.events.slice(0, 10);
  const recentAdaptations = data.adaptationEvents.slice(0, 8);

  const metrics = [
    {
      title: "Cognitive Load Score",
      value: cognitiveLoadScore,
      suffix: "/100",
      description: "Estimated interaction friction",
    },
    {
      title: "Interaction Events",
      value: interactions,
      suffix: "",
      description: "Recorded user interactions",
    },
    {
      title: "Hesitation Events",
      value: hesitations,
      suffix: "",
      description: "Possible hesitation signals",
    },
    {
      title: "UI Adaptations",
      value: data.adaptationCount,
      suffix: "",
      description: "Recorded successful adaptations",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080d1b] p-5 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Workspace / Overview
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Monitor user interactions, estimated friction, and interface adaptations.
            </p>
          </div>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-400">
            ● System Online
          </span>
        </header>

        {/* Main metrics */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="rounded-2xl border border-white/10 bg-[#111b30] p-6"
            >
              <p className="text-sm text-slate-400">
                {metric.title}
              </p>
              <p className="mt-4 text-3xl font-bold">
                {metric.value}
                <span className="text-base font-normal text-slate-500">
                  {metric.suffix}
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {metric.description}
              </p>
            </div>
          ))}
        </section>

        {/* Cognitive load and adaptive engine */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#111b30] p-6">
            <h2 className="text-lg font-semibold">
              Cognitive Load Overview
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Heuristic score calculated from recorded friction signals
            </p>

            <div className="mt-8 flex items-center justify-center">
              <div
                className="flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#818cf8 ${
                    cognitiveLoadScore * 3.6
                  }deg, #26334c 0deg)`,
                }}
              >
                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[#111b30]">
                  <span className="text-4xl font-bold">
                    {cognitiveLoadScore}
                  </span>
                  <span className="text-xs text-slate-400">
                    out of 100
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              {cognitiveLoadScore >= 70
                ? "High estimated interaction friction"
                : cognitiveLoadScore >= 35
                  ? "Moderate estimated interaction friction"
                  : "Low estimated interaction friction"}
            </p>

            <p className="mt-3 text-center text-xs text-slate-500">
              This is a heuristic indicator, not a psychological measurement.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111b30] p-6">
            <h2 className="text-lg font-semibold">
              Adaptive UI Engine
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              AI-assisted interface adaptation
            </p>

            <div className="mt-8 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
              <p className="text-sm font-medium text-indigo-300">
                Adaptive UI Studio available
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Generate alternative interface schemas with Groq,
                validate them, and render supported layouts while
                preserving entered form values.
              </p>

              <Link
                href="/adaptive-ui"
                className="mt-5 inline-flex rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Open Adaptive UI Studio →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  Repeated clicks
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {repeatedClicks}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Form errors
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {errors}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Adaptation history */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-[#111b30] p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                UI Adaptation History
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Successfully recorded interface changes
              </p>
            </div>

            <span className="rounded-lg bg-indigo-500/10 px-3 py-2 text-sm text-indigo-300">
              {data.adaptationCount} total adaptations
            </span>
          </div>

          {recentAdaptations.length === 0 ? (
            <p className="rounded-xl bg-white/5 p-5 text-sm text-slate-400">
              No successful adaptations recorded yet. Try changing
              the layout or generating a changed schema in Adaptive
              UI Studio.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500">
                    <th className="px-3 py-3 font-medium">Source</th>
                    <th className="px-3 py-3 font-medium">Layout</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAdaptations.map((adaptation) => (
                    <tr
                      key={adaptation.id}
                      className="border-b border-white/5 text-slate-300"
                    >
                      <td className="px-3 py-4">
                        {getSourceLabel(adaptation.source)}
                      </td>
                      <td className="px-3 py-4 capitalize">
                        {adaptation.mode}
                      </td>
                      <td className="px-3 py-4 text-slate-400">
                        {formatTimestamp(adaptation.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent interactions */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-[#111b30] p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Recent Interaction Activity
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest recorded telemetry events
              </p>
            </div>

            <Link
              href="/interaction-monitor"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              View all events →
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <p className="rounded-xl bg-white/5 p-5 text-sm text-slate-400">
              No interaction events recorded yet. Open the Financial
              Application and interact with its fields.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500">
                    <th className="px-3 py-3 font-medium">Event</th>
                    <th className="px-3 py-3 font-medium">Field</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-white/5 text-slate-300"
                    >
                      <td className="px-3 py-4">
                        {event.type}
                      </td>
                      <td className="px-3 py-4">
                        {event.field || "—"}
                      </td>
                      <td className="px-3 py-4 text-slate-400">
                        {formatTimestamp(event.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick navigation */}
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href="/application"
            className="rounded-2xl border border-white/10 bg-[#111b30] p-6 transition hover:border-indigo-500/40"
          >
            <h2 className="font-semibold">
              Financial Application
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Open the sample application and generate interaction telemetry.
            </p>
            <span className="mt-4 inline-block text-sm text-indigo-400">
              Open application →
            </span>
          </Link>

          <Link
            href="/settings"
            className="rounded-2xl border border-white/10 bg-[#111b30] p-6 transition hover:border-indigo-500/40"
          >
            <h2 className="font-semibold">System Settings</h2>
            <p className="mt-2 text-sm text-slate-400">
              Configure cognitive-load thresholds and automatic adaptation.
            </p>
            <span className="mt-4 inline-block text-sm text-indigo-400">
              Configure settings →
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
