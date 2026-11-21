
"use client";

import { useEffect, useRef, useState } from "react";

import DynamicUIRenderer, {
  type FormValues,
} from "../../components/DynamicUIRenderer";

import { sampleUISchema } from "../../lib/sampleUISchema";
import { validateUISchema } from "../../lib/validateUISchema";
import { getRecommendedLayout } from "../../lib/adaptationEngine";
import { useTelemetry } from "../../hooks/useTelemetry";

import type {
  AdaptiveUISchema,
  UILayoutMode,
} from "../../types/ui-schema";

function hasSameFields(
  original: AdaptiveUISchema,
  candidate: AdaptiveUISchema
): boolean {
  const originalFields = original.sections.flatMap(
    (section) => section.fields
  );

  const candidateFields = candidate.sections.flatMap(
    (section) => section.fields
  );

  if (originalFields.length !== candidateFields.length) {
    return false;
  }

  const candidateFieldMap = new Map(
    candidateFields.map((field) => [field.id, field.type])
  );

  const fieldsMatch = originalFields.every(
    (field) => candidateFieldMap.get(field.id) === field.type
  );

  const candidateActions = new Map(
    candidate.actions.map((action) => [action.id, action.type])
  );

  const actionsMatch =
    original.actions.length === candidate.actions.length &&
    original.actions.every(
      (action) => candidateActions.get(action.id) === action.type
    );

  return fieldsMatch && actionsMatch;
}

export default function AdaptiveUIPage() {
  const telemetry = useTelemetry();

  const [manualLayout, setManualLayout] =
    useState<UILayoutMode | null>(null);

  const [formValues, setFormValues] = useState<FormValues>({});

  const [adaptedSchema, setAdaptedSchema] =
    useState<AdaptiveUISchema | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationMessage, setGenerationMessage] = useState("");

  const previousAutomaticLayout = useRef<UILayoutMode | null>(null);

  const recommendedLayout = getRecommendedLayout({
    autoAdaptationEnabled: telemetry.settings.autoAdaptationEnabled,
    isHighFriction: telemetry.isHighFriction,
  });

  const activeLayout =
    manualLayout ??
    (adaptedSchema ? adaptedSchema.layout : recommendedLayout);

  const baseSchema = adaptedSchema ?? sampleUISchema;

  const activeSchema: AdaptiveUISchema = {
    ...baseSchema,
    layout: activeLayout,
  };

  const validation = validateUISchema(activeSchema);

  // Record actual automatic layout transitions only after telemetry loads.
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

    if (previousAutomaticLayout.current !== recommendedLayout) {
      previousAutomaticLayout.current = recommendedLayout;
      telemetry.trackAdaptation(recommendedLayout, "automatic");
    }
  }, [
    telemetry.loaded,
    recommendedLayout,
    manualLayout,
    adaptedSchema,
    telemetry.trackAdaptation,
  ]);

  function handleManualLayout(mode: UILayoutMode) {
    if (mode !== activeLayout) {
      telemetry.trackAdaptation(mode, "manual");
    }

    setManualLayout(mode);
  }

  function handleAutomaticLayout() {
    const targetLayout = adaptedSchema?.layout ?? recommendedLayout;

    if (targetLayout !== activeLayout) {
      telemetry.trackAdaptation(targetLayout, "automatic");
    }

    previousAutomaticLayout.current = targetLayout;
    setManualLayout(null);
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
            cognitiveLoadScore: telemetry.cognitiveLoadScore,
            hesitationCount: telemetry.hesitationCount,
            repeatedClickCount: telemetry.repeatedClickCount,
            errorCount: telemetry.errorCount,
            interactionCount: telemetry.interactionCount,
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
        throw new Error("Groq did not return a UI schema.");
      }

      const generatedSchema =
        result.adaptedSchema as AdaptiveUISchema;

      const schemaValidation = validateUISchema(generatedSchema);

      if (!schemaValidation.valid) {
        throw new Error(
          "Generated schema failed validation: " +
            schemaValidation.errors.join(", ")
        );
      }

      if (!hasSameFields(sampleUISchema, generatedSchema)) {
        throw new Error(
          "Generated schema changed or removed existing fields or actions. It was rejected."
        );
      }

      const schemaChanged =
        JSON.stringify(activeSchema) !==
        JSON.stringify(generatedSchema);

      setAdaptedSchema(generatedSchema);
      setManualLayout(null);

      if (schemaChanged) {
        telemetry.trackAdaptation(generatedSchema.layout, "ai");

        setGenerationMessage(
          `Successfully generated and validated a changed UI schema using ${
            result.model || "Groq"
          }.`
        );
      } else {
        setGenerationMessage(
          "Groq generated a valid schema, but it did not change the current UI. No adaptation was counted."
        );
      }
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const handleSubmit = (values: FormValues) => {
    alert(
      "Test application submitted:\n" +
        JSON.stringify(values, null, 2)
    );
  };

  if (!validation.valid) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-xl font-bold text-red-400">
          Invalid UI Schema
        </h1>

        {validation.errors.map((error, index) => (
          <p key={index}>{error}</p>
        ))}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto mb-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-white">
          AuraGen — Adaptive UI Studio
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Cognitive-load-aware interface adaptation powered by Groq.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleAutomaticLayout}
            className={`rounded-lg px-4 py-2 text-sm ${
              manualLayout === null
                ? "bg-emerald-600 text-white"
                : "border border-slate-700 text-slate-300"
            }`}
          >
            Automatic
          </button>

          {(["standard", "simplified", "guided"] as const).map(
            (mode) => (
              <button
                key={mode}
                onClick={() => handleManualLayout(mode)}
                className={`rounded-lg px-4 py-2 text-sm capitalize ${
                  manualLayout === mode
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-700 text-slate-300"
                }`}
              >
                {mode}
              </button>
            )
          )}
        </div>

        <div className="mt-5 rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-4">
          <h2 className="font-semibold text-white">
            AI-Powered UI Adaptation
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            Ask Groq to analyze the current interface and interaction
            signals, then generate an adapted UI schema.
          </p>

          <button
            onClick={handleGenerateAdaptation}
            disabled={isGenerating}
            className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating
              ? "Generating with Groq..."
              : "Generate with Groq"}
          </button>

          {generationError && (
            <p className="mt-3 text-sm text-red-400">
              {generationError}
            </p>
          )}

          {generationMessage && (
            <p className="mt-3 text-sm text-emerald-400">
              {generationMessage}
            </p>
          )}

          {adaptedSchema && (
            <p className="mt-2 text-xs text-indigo-300">
              AI-generated schema is active. Your entered form values are preserved.
            </p>
          )}
        </div>

        <div className="mt-5 space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-sm text-slate-300">
            Cognitive Load Score:{" "}
            <strong className="text-white">
              {telemetry.cognitiveLoadScore}/100
            </strong>
          </p>

          <p className="text-sm text-slate-300">
            Friction Status:{" "}
            <strong className="text-white">
              {telemetry.isHighFriction ? "High" : "Low"}
            </strong>
          </p>

          <p className="text-sm text-slate-300">
            Automatic Adaptation:{" "}
            <strong className="text-white">
              {telemetry.settings.autoAdaptationEnabled
                ? "Enabled"
                : "Disabled"}
            </strong>
          </p>

          <p className="text-sm text-slate-300">
            Recommended Layout:{" "}
            <strong className="capitalize text-indigo-300">
              {recommendedLayout}
            </strong>
          </p>

          <p className="text-sm text-slate-300">
            Active Layout:{" "}
            <strong className="capitalize text-emerald-300">
              {activeLayout}
            </strong>
          </p>

          <p className="text-sm text-slate-300">
            Successful UI Adaptations:{" "}
            <strong className="text-emerald-300">
              {telemetry.adaptationCount}
            </strong>
          </p>

          {manualLayout !== null && (
            <p className="text-xs text-amber-400">
              Manual override active. Select Automatic to restore automatic layout selection.
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-emerald-400">
          Schema validation: Passed
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Preserved form values: {Object.keys(formValues).length}
        </p>
      </div>

      <DynamicUIRenderer
        schema={activeSchema}
        values={formValues}
        onValuesChange={setFormValues}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
