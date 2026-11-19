
"use client";

import { useEffect, useState } from "react";

type TelemetryEvent = {
  id: number;
  type: string;
  field: string;
  timestamp: number;
  details: string;
};

type TelemetryData = {
  events: TelemetryEvent[];
  interactionCount: number;
  hesitationCount: number;
  errorCount: number;
  repeatedClickCount: number;
};

const STORAGE_KEY = "auragen-telemetry";

export default function InteractionMonitor() {
  const [data, setData] = useState<TelemetryData>({
    events: [],
    interactionCount: 0,
    hesitationCount: 0,
    errorCount: 0,
    repeatedClickCount: 0,
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setData(JSON.parse(saved));
      } catch (error) {
        console.error("Unable to load telemetry:", error);
      }
    };

    loadData();
    window.addEventListener("storage", loadData);

    return () => window.removeEventListener("storage", loadData);
  }, []);

  const score = Math.min(
    100,
    data.hesitationCount * 12 +
      data.repeatedClickCount * 10 +
      data.errorCount * 15
  );

  return (
    <main className="min-h-screen bg-[#090d18] p-6 text-slate-100 md:p-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm text-slate-400">AuraGen / Monitoring</p>
        <h1 className="mt-2 text-3xl font-bold">Interaction Monitor</h1>
        <p className="mt-2 text-sm text-slate-400">
          Monitor user interactions and detected friction across the application.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Interactions", value: data.interactionCount },
            { label: "Hesitations", value: data.hesitationCount },
            { label: "Repeated Clicks", value: data.repeatedClickCount },
            { label: "Cognitive Load", value: `${score}/100` },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-[#111a2b] p-5"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-white/10 bg-[#111a2b] p-6">
          <h2 className="text-lg font-semibold">Interaction Event Log</h2>
          <p className="mt-1 text-sm text-slate-400">
            Latest recorded events
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Field</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((event) => (
                  <tr key={event.id} className="border-b border-white/5">
                    <td className="p-3 text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3">{event.type}</td>
                    <td className="p-3">{event.field}</td>
                    <td className="p-3 text-slate-400">{event.details}</td>
                  </tr>
                ))}

                {data.events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      No interaction events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
