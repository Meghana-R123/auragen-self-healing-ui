
"use client";

import { useEffect, useRef, useState } from "react";

import DynamicUIRenderer, {
  type FormValues,
} from "@/components/DynamicUIRenderer";

import { useTelemetry } from "@/hooks/useTelemetry";
import { getRecommendedLayout } from "@/lib/adaptationEngine";
import { financialApplicationSchema } from "@/lib/financialApplicationSchema";
import { validateUISchema } from "@/lib/validateUISchema";

import type {
  AdaptiveUISchema,
  UILayoutMode,
} from "@/types/ui-schema";

export default function FinancialApplication() {
  const telemetry = useTelemetry();

  const [formValues, setFormValues] = useState<FormValues>({});
  const [adaptedSchema, setAdaptedSchema] =
    useState<AdaptiveUISchema | null>(null);

  const [manualLayout, setManualLayout] =
    useState<UILayoutMode | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationMessage, setGenerationMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const previousAutomaticLayout =
    useRef<UILayoutMode | null>(null);

  const recommendedLayout = getRecommendedLayout({
    autoAdaptationEnabled:
      telemetry.settings.autoAdaptationEnabled,
    isHighFriction: telemetry.isHighFriction,
  });

  const activeLayout =
    manualLayout ??
    adaptedSchema?.layout ??
    recommendedLayout;

  const baseSchema = adaptedSchema ?? financialApplicationSchema;

  const activeSchema: AdaptiveUISchema = {
    ...baseSchema,
    layout: activeLayout,
  };

  const validation = validateUISchema(activeSchema);

  // Record actual automatic layout changes.
  useEffect(() => {
    if (
      !telemetry.loaded ||
      manualLayout !== null ||
      adaptedSchema !== null
    ) {
      return;
    }

    if (previousAutomaticLayout.current === null) {
      previousAutomaticLayout.current = recommendedLayout;
      return;
    }

    if (
      previousAutomaticLayout.current !== recommendedLayout
    ) {
      previousAutomaticLayout.current = recommendedLayout;

      telemetry.trackAdaptation(
        recommendedLayout,
        "automatic"
      );
    }
  }, [
    telemetry.loaded,
    telemetry.trackAdaptation,
    recommendedLayout,
    manualLayout,
    adaptedSchema,
  ]);

  function handleManualLayout(mode: UILayoutMode) {
    if (mode !== activeLayout) {
      telemetry.trackAdaptation(mode, "manual");
    }

    setManualLayout(mode);
  }

  function handleAutomaticLayout() {
    setManualLayout(null);

    const targetLayout =
      adaptedSchema?.layout ?? recommendedLayout;

    previousAutomaticLayout.current = targetLayout;
  }

  async function handleGenerateAdaptation() {
    setIsGenerating(true);
    setGenerationError("");
    setGenerationMessage("");

    try {
      const response = await fetch("/api/adapt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentSchema: activeSchema,
          frictionSignals: {
            cognitiveLoadScore:
              telemetry.cognitiveLoadScore,
            hesitationCount: telemetry.hesitationCount,
            repeatedClickCount:
              telemetry.repeatedClickCount,
            errorCount: telemetry.errorCount,
            interactionCount:
              telemetry.interactionCount,
            isHighFriction: telemetry.isHighFriction,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Groq adaptation request failed."
        );
      }

      if (!result.adaptedSchema) {
        throw new Error(
          "Groq did not return an adapted schema."
        );
      }

      const generatedSchema =
        result.adaptedSchema as AdaptiveUISchema;

      const schemaValidation =
        validateUISchema(generatedSchema);

      if (!schemaValidation.valid) {
        throw new Error(
          "Generated schema failed validation: " +
            schemaValidation.errors.join(", ")
        );
      }

      // Verify that all original fields and actions remain intact.
      const originalFields =
        financialApplicationSchema.sections.flatMap(
          (section) => section.fields
        );

      const generatedFields =
        generatedSchema.sections.flatMap(
          (section) => section.fields
        );

      const fieldsMatch =
        originalFields.length === generatedFields.length &&
        originalFields.every((field) =>
          generatedFields.some(
            (generatedField) =>
              generatedField.id === field.id &&
              generatedField.type === field.type
          )
        );

      const actionsMatch =
        financialApplicationSchema.actions.length ===
          generatedSchema.actions.length &&
        financialApplicationSchema.actions.every(
          (action) =>
            generatedSchema.actions.some(
              (generatedAction) =>
                generatedAction.id === action.id &&
                generatedAction.type === action.type
            )
        );

      if (!fieldsMatch || !actionsMatch) {
        throw new Error(
          "AI schema changed or removed existing fields or actions. Adaptation rejected."
        );
      }

      const schemaChanged =
        JSON.stringify(activeSchema) !==
        JSON.stringify(generatedSchema);

      setAdaptedSchema(generatedSchema);
      setManualLayout(null);

      if (schemaChanged) {
        telemetry.trackAdaptation(
          generatedSchema.layout,
          "ai"
        );

        setGenerationMessage(
          `Successfully generated and validated an adapted interface using ${result.model || "Groq"}.`
        );
      } else {
        setGenerationMessage(
          "Groq returned a valid schema, but no interface changes were necessary."
        );
      }
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "An unexpected adaptation error occurred."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleResetAI() {
    setAdaptedSchema(null);
    setManualLayout(null);
    setGenerationError("");
    setGenerationMessage(
      "Original Financial Application schema restored."
    );
  }

  function handleSubmit(values: FormValues) {
    setFormValues(values);
    setSubmitted(true);
  }

  if (!validation.valid) {
    return (
      <main className="min-h-screen bg-[#090d18] p-8 text-white">
        <h1 className="text-xl font-bold text-red-400">
          Invalid Financial Application Schema
        </h1>

        {validation.errors.map((error, index) => (
          <p key={index} className="mt-2 text-sm">
            {error}
          </p>
        ))}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d18] px-5 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">

        <header className="mb-8">
          <p className="text-sm font-medium text-indigo-400">
            AURAGEN · FINANCIAL SERVICES
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Financial Application
          </h1>

          <p className="mt-2 text-slate-400">
            An adaptive application that responds to interaction friction.
          </p>
        </header>

        {/* AI ADAPTATION CONTROLS */}
        <section className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-indigo-300">
                AuraGen AI Adaptation
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                Generate an alternative interface using Groq and current interaction signals.
              </p>
            </div>

            <span className="rounded-full border border-indigo-400/30 px-3 py-1 text-xs capitalize text-indigo-300">
              {activeLayout} mode
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerateAdaptation}
              disabled={isGenerating}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating
                ? "Generating with Groq..."
                : "Generate AI Adaptation"}
            </button>

            {adaptedSchema && (
              <button
                type="button"
                onClick={handleResetAI}
                className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                Restore Original UI
              </button>
            )}
          </div>

          {generationError && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {generationError}
            </p>
          )}

          {generationMessage && (
            <p className="mt-3 text-sm text-emerald-400">
              {generationMessage}
            </p>
          )}

          {adaptedSchema && (
            <p className="mt-3 text-xs text-indigo-300">
              AI-generated schema is active. Existing form values are preserved.
            </p>
          )}
        </section>

        {/* LAYOUT CONTROLS */}
        <section className="mb-6 rounded-xl border border-white/10 bg-[#111a2b] p-4">

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAutomaticLayout}
              className={`rounded-lg px-4 py-2 text-sm ${
                manualLayout === null
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-700 text-slate-300"
              }`}
            >
              Automatic
            </button>

            {(
              ["standard", "simplified", "guided"] as const
            ).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleManualLayout(mode)}
                className={`rounded-lg px-4 py-2 text-sm capitalize ${
                  manualLayout === mode
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-700 text-slate-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        {/* TELEMETRY */}
        <section className="mb-6 rounded-xl border border-white/10 bg-[#111a2b] p-5">

          <h2 className="font-semibold text-indigo-300">
            Live Interaction Monitoring
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">

            <div>
              <p className="text-xs text-slate-400">
                Interactions
              </p>
              <p className="text-2xl font-bold">
                {telemetry.interactionCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Hesitations
              </p>
              <p className="text-2xl font-bold">
                {telemetry.hesitationCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Repeated Clicks
              </p>
              <p className="text-2xl font-bold">
                {telemetry.repeatedClickCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Cognitive Load
              </p>
              <p className="text-2xl font-bold text-indigo-300">
                {telemetry.cognitiveLoadScore}/100
              </p>
            </div>

          </div>

          <div className="mt-4 border-t border-slate-700 pt-3 text-sm text-slate-400">
            Recommended layout:{" "}
            <span className="capitalize text-indigo-300">
              {recommendedLayout}
            </span>
            <span className="mx-2">|</span>
            Friction:{" "}
            <span className="text-white">
              {telemetry.isHighFriction ? "High" : "Low"}
            </span>
            <span className="mx-2">|</span>
            Successful adaptations:{" "}
            <span className="text-emerald-300">
              {telemetry.adaptationCount}
            </span>
          </div>
        </section>

        {/* FIELD-LEVEL FRICTION MONITOR */}
        <section className="mb-6 rounded-xl border border-white/10 bg-[#111a2b] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-indigo-300">
                Field-Level Friction Monitor
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Friction estimates from focus, hesitation, errors, and time spent on each field.
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {telemetry.fieldFrictionList.length} tracked fields
            </span>
          </div>

          {telemetry.fieldFrictionList.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
              No field-level signals yet. Interact with the application fields to collect data.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {telemetry.fieldFrictionList.slice(0, 5).map((field) => (
                <div
                  key={field.field}
                  className="rounded-lg border border-white/5 bg-[#0b1220] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {field.field}
                    </span>

                    <span className="text-sm font-semibold text-indigo-300">
                      {field.frictionScore}/100
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, field.frictionScore))}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400 sm:grid-cols-4">
                    <span>Focus: {field.focusCount}</span>
                    <span>Hesitations: {field.hesitationCount}</span>
                    <span>Errors: {field.errorCount}</span>
                    <span>
                      Avg. time: {(field.averageTimeMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-3 text-xs text-slate-500">
            These are heuristic interaction signals, not a direct measurement of a person's cognitive state.
          </p>
        </section>

        {/* FORM SUBMISSION RESULT */}
        {submitted ? (
          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8">

            <h2 className="text-2xl font-semibold text-emerald-400">
              Application submitted!
            </h2>

            <p className="mt-3 text-slate-300">
              Your demo application passed browser validation.
              No information was sent to a server.
            </p>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium hover:bg-indigo-500"
            >
              Edit Application
            </button>
          </section>
        ) : (
          <DynamicUIRenderer
            schema={activeSchema}
            values={formValues}
            onValuesChange={setFormValues}
            onSubmit={handleSubmit}
            onFieldFocus={telemetry.trackFocus}
            onFieldClick={telemetry.trackClick}
            onFieldBlur={telemetry.trackBlur}
            fieldFriction={telemetry.fieldFrictionList}
          />
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          AuraGen · Development Prototype · Demonstration data only
        </p>

      </div>
    </main>
  );
}
