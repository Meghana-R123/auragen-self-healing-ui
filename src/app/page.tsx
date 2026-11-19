
"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "auragen-telemetry";

type TelemetryEvent = {
  id?: string;
  type?: string;
  field?: string;
  timestamp?: string | number;
  details?: string;
};

type TelemetryData = {
  events?: TelemetryEvent[];
  interactionCount?: number;
  hesitationCount?: number;
  errorCount?: number;
  repeatedClickCount?: number;
};

export default function Home() {
  const [data, setData] = useState<TelemetryData>({
    events: [],
    interactionCount: 0,
    hesitationCount: 0,
    errorCount: 0,
    repeatedClickCount: 0,
  });

  const loadTelemetry = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Unable to load telemetry:", error);
    }
  }, []);

  useEffect(() => {
    loadTelemetry();

    window.addEventListener("storage", loadTelemetry);
    window.addEventListener("focus", loadTelemetry);

    return () => {
      window.removeEventListener("storage", loadTelemetry);
      window.removeEventListener("focus", loadTelemetry);
    };
  }, [loadTelemetry]);

  const interactions = data.interactionCount ?? 0;
  const hesitations = data.hesitationCount ?? 0;
  const errors = data.errorCount ?? 0;
  const repeatedClicks = data.repeatedClickCount ?? 0;

  const cognitiveLoadScore = Math.min(
    100,
    hesitations * 12 + repeatedClicks * 10 + errors * 15
  );

  const events = [...(data.events ?? [])].reverse().slice(0, 10);

  const metrics = [
    {
      title: "Cognitive Load Score",
      value: cognitiveLoadScore,
      suffix: "/100",
      description: "Estimated user friction",
    },
    {
      title: "Interaction Events",
      value: interactions,
      suffix: "",
      description: "Recorded interactions",
    },
    {
      title: "Hesitation Events",
      value: hesitations,
      suffix: "",
      description: "Possible hesitation signals",
    },
    {
      title: "UI Adaptations",
      value: 0,
      suffix: "",
      description: "Adaptation engine not implemented",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080d1b] text-white">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0c1426] p-6">
          <div className="mb-10">
            <h1 className="text-2xl font-bold tracking-wide text-indigo-400">
              AuraGen
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Adaptive Intelligence
            </p>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            <a
              href="/"
              className="block rounded-xl bg-indigo-500/15 px-4 py-3 text-sm font-medium text-indigo-300 hover:bg-indigo-500/25"
            >
              ▦ Dashboard
            </a>

            <a
              href="/interaction-monitor"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              ⌁ Interaction Monitor
            </a>

            <a
              href="/#adaptive-ui"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              ◇ Adaptive UI
            </a>

            <a
              href="/#settings"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              ⚙ Settings
            </a>
          </nav>

          <div className="mt-12 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-sm font-medium text-indigo-300">
              AuraGen Engine
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Interaction monitoring is active.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Telemetry ready
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-6 md:p-10">
          <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Overview</p>
              <h2 className="mt-1 text-3xl font-bold">Dashboard</h2>
              <p className="mt-2 text-sm text-slate-400">
                Monitor user interactions and cognitive load indicators.
              </p>
            </div>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-400">
              ● System Online
            </span>
          </header>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.title}
                className="rounded-2xl border border-white/10 bg-[#111b30] p-6"
              >
                <p className="text-sm text-slate-400">{metric.title}</p>
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
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#111b30] p-6">
              <h3 className="text-lg font-semibold">
                Cognitive Load Overview
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Heuristic score based on recorded friction signals
              </p>

              <div className="mt-8 flex items-center justify-center">
                <div
                  className="flex h-44 w-44 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#818cf8 ${cognitiveLoadScore * 3.6}deg, #26334c 0deg)`,
                  }}
                >
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[#111b30]">
                    <span className="text-4xl font-bold">
                      {cognitiveLoadScore}
                    </span>
                    <span className="text-xs text-slate-400">out of 100</span>
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
            </div>

            <div
              id="adaptive-ui"
              className="rounded-2xl border border-white/10 bg-[#111b30] p-6"
            >
              <h3 className="text-lg font-semibold">Adaptive UI Engine</h3>
              <p className="mt-1 text-sm text-slate-400">
                Current adaptation status
              </p>

              <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                <p className="text-sm font-medium text-amber-300">
                  Adaptation engine not implemented
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Telemetry is being collected. Automatic interface
                  simplification and AI-generated UI adaptation are still
                  pending implementation.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Repeated clicks</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {repeatedClicks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Form errors</p>
                  <p className="mt-1 text-2xl font-semibold">{errors}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#111b30] p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">
                  Recent Interaction Activity
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Latest recorded telemetry events
                </p>
              </div>

              <a
                href="/interaction-monitor"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                View all events →
              </a>
            </div>

            {events.length === 0 ? (
              <p className="rounded-xl bg-white/5 p-5 text-sm text-slate-400">
                No interaction events recorded yet. Open the application form
                and interact with its fields to generate telemetry.
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
                    {events.map((event, index) => (
                      <tr
                        key={event.id ?? `${event.timestamp}-${index}`}
                        className="border-b border-white/5 text-slate-300"
                      >
                        <td className="px-3 py-4">
                          {event.type ?? "Interaction"}
                        </td>
                        <td className="px-3 py-4">
                          {event.field ?? "—"}
                        </td>
                        <td className="px-3 py-4 text-slate-400">
                          {event.timestamp
                            ? new Date(event.timestamp).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div
            id="settings"
            className="mt-8 rounded-2xl border border-white/10 bg-[#111b30] p-6"
          >
            <h3 className="text-lg font-semibold">Settings</h3>
            <p className="mt-2 text-sm text-slate-400">
              AuraGen telemetry is currently stored in this browser&apos;s
              local storage.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
