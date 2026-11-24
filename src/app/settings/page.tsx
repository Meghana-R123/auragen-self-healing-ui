
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "auragen-settings";

type AuraGenSettings = {
  cognitiveLoadThreshold: number;
  hesitationThresholdMs: number;
  repeatedClickWindowMs: number;
  autoAdaptationEnabled: boolean;
};

const DEFAULT_SETTINGS: AuraGenSettings = {
  cognitiveLoadThreshold: 60,
  hesitationThresholdMs: 4000,
  repeatedClickWindowMs: 1500,
  autoAdaptationEnabled: false,
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<AuraGenSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
      }
    } catch (error) {
      console.error("Could not load AuraGen settings:", error);
    }

    setLoaded(true);
  }, []);

  function updateSetting<K extends keyof AuraGenSettings>(
    key: K,
    value: AuraGenSettings[K]
  ) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_SETTINGS)
    );
    setSaved(true);
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#080d1b] p-8 text-white">
        Loading settings...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d1b] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          ← Back to Dashboard
        </a>

        <div className="mt-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            AuraGen / Configuration
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Configure friction detection and adaptive interface
            behaviour.
          </p>
        </div>

        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#111b30] p-6">
            <h2 className="text-lg font-semibold">
              Cognitive Load Detection
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Set the score at which the system considers user
              interaction friction to be high.
            </p>

            <div className="mt-6">
              <div className="flex justify-between text-sm">
                <label htmlFor="loadThreshold">
                  Cognitive Load Threshold
                </label>
                <span className="font-semibold text-indigo-400">
                  {settings.cognitiveLoadThreshold}/100
                </span>
              </div>

              <input
                id="loadThreshold"
                type="range"
                min="20"
                max="100"
                step="5"
                value={settings.cognitiveLoadThreshold}
                onChange={(event) =>
                  updateSetting(
                    "cognitiveLoadThreshold",
                    Number(event.target.value)
                  )
                }
                className="mt-4 w-full accent-indigo-500"
              />

              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>20 — Sensitive</span>
                <span>100 — Less sensitive</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111b30] p-6">
            <h2 className="text-lg font-semibold">
              Friction Detection
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Configure how long the system waits before detecting
              hesitation or repeated clicks.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="hesitation"
                  className="text-sm font-medium"
                >
                  Hesitation Duration
                </label>
                <select
                  id="hesitation"
                  value={settings.hesitationThresholdMs}
                  onChange={(event) =>
                    updateSetting(
                      "hesitationThresholdMs",
                      Number(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0b1222] p-3 text-sm text-white"
                >
                  <option value={2000}>2 seconds</option>
                  <option value={3000}>3 seconds</option>
                  <option value={4000}>4 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={7000}>7 seconds</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="repeatedClick"
                  className="text-sm font-medium"
                >
                  Repeated Click Window
                </label>
                <select
                  id="repeatedClick"
                  value={settings.repeatedClickWindowMs}
                  onChange={(event) =>
                    updateSetting(
                      "repeatedClickWindowMs",
                      Number(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0b1222] p-3 text-sm text-white"
                >
                  <option value={500}>0.5 seconds</option>
                  <option value={1000}>1 second</option>
                  <option value={1500}>1.5 seconds</option>
                  <option value={2000}>2 seconds</option>
                  <option value={3000}>3 seconds</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111b30] p-6">
            <h2 className="text-lg font-semibold">
              Adaptive UI Behaviour
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Control whether AuraGen can automatically adapt the
              interface when interaction friction is detected.
            </p>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-[#0b1222] p-4">
              <div>
                <p className="text-sm font-medium">
                  Automatic UI Adaptation
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Allow the Financial Application to simplify its
                  interface when the configured threshold is reached.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.autoAdaptationEnabled}
                aria-label="Automatic UI Adaptation"
                onClick={() =>
                  updateSetting(
                    "autoAdaptationEnabled",
                    !settings.autoAdaptationEnabled
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  settings.autoAdaptationEnabled
                    ? "bg-indigo-500"
                    : "bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    settings.autoAdaptationEnabled
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <p className="mt-3 text-xs text-emerald-400">
              Automatic adaptation is implemented and can be enabled
              above. Changes take effect after saving your settings.
              AI-generated adaptation is available separately through
              the Financial Application.
            </p>
          </div>

          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={resetSettings}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-white/5"
            >
              Reset Defaults
            </button>

            <button
              type="button"
              onClick={saveSettings}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Save Settings
            </button>
          </div>

          {saved && (
            <p className="text-right text-sm text-emerald-400">
              ✓ Settings saved successfully.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
