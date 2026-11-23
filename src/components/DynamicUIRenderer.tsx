
"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import type {
  AdaptiveUISchema,
  UIField,
} from "../types/ui-schema";

export type FormValues = Record<string, string | boolean>;

type FieldFrictionSignal = {
  field: string;
  frictionScore: number;
  hesitationCount: number;
  errorCount: number;
  averageTimeMs: number;
};

type DynamicUIRendererProps = {
  schema: AdaptiveUISchema;
  values: FormValues;
  onValuesChange: (values: FormValues) => void;
  onSubmit?: (values: FormValues) => void;
  onFieldFocus?: (fieldId: string) => void;
  onFieldClick?: (fieldId: string) => void;
  onFieldBlur?: (fieldId: string) => void;
  fieldFriction?: FieldFrictionSignal[];
};

function getFieldSuggestion(field: UIField): string {
  const identifier = `${field.id} ${field.label}`.toLowerCase();

  if (field.type === "email" || identifier.includes("email")) {
    return "Check the email format. For example: name@example.com.";
  }

  if (
    field.type === "tel" ||
    identifier.includes("phone") ||
    identifier.includes("mobile")
  ) {
    return "Enter a valid phone number. Check the country code if required.";
  }

  if (
    field.type === "number" ||
    identifier.includes("income") ||
    identifier.includes("amount") ||
    identifier.includes("emi")
  ) {
    return "Enter a numeric value. Avoid currency symbols or unnecessary text.";
  }

  if (field.type === "date") {
    return "Select the date using the date picker and verify it before continuing.";
  }

  if (field.type === "select") {
    return "Review the available options and choose the one that best matches your situation.";
  }

  if (field.type === "textarea") {
    return "Break your response into short, clear points. You can review it before continuing.";
  }

  return "Take this field one step at a time. Check the example or description before entering your answer.";
}

export default function DynamicUIRenderer({
  schema,
  values,
  onValuesChange,
  onSubmit,
  onFieldFocus,
  onFieldClick,
  onFieldBlur,
  fieldFriction = [],
}: DynamicUIRendererProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [error, setError] = useState("");

  const isGuided = schema.layout === "guided";
  const totalSections = schema.sections.length;

  const sectionSignature = schema.sections
    .map((section) => section.id)
    .join("|");

  useEffect(() => {
    setCurrentSection(0);
    setError("");
  }, [sectionSignature, schema.layout]);

  const visibleSections = isGuided
    ? schema.sections.slice(currentSection, currentSection + 1)
    : schema.sections;

  const updateValue = (
    id: string,
    value: string | boolean
  ) => {
    onValuesChange({
      ...values,
      [id]: value,
    });
  };

  const validateFields = (
    sections: typeof schema.sections
  ) => {
    for (const section of sections) {
      for (const field of section.fields) {
        if (!field.required) continue;

        const value = values[field.id];

        if (
          value === undefined ||
          value === "" ||
          value === false
        ) {
          return `${field.label} is required.`;
        }
      }
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validateFields(
      schema.sections.slice(
        currentSection,
        currentSection + 1
      )
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setCurrentSection((previous) =>
      Math.min(previous + 1, totalSections - 1)
    );
  };

  const handleBack = () => {
    setError("");
    setCurrentSection((previous) =>
      Math.max(0, previous - 1)
    );
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationError = validateFields(schema.sections);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    onSubmit?.(values);
  };

  const getFrictionForField = (field: UIField) => {
    return fieldFriction.find(
      (metric) =>
        metric.field === field.id ||
        metric.field.toLowerCase() === field.label.toLowerCase()
    );
  };

  const renderField = (field: UIField) => {
    const friction = getFrictionForField(field);

    const shouldShowAssistance =
      !!friction &&
      (friction.frictionScore >= 40 || friction.errorCount > 0);

    const commonProps = {
      id: field.id,
      name: field.id,
      required: field.required,
      placeholder: field.placeholder,
      value:
        typeof values[field.id] === "string"
          ? String(values[field.id])
          : "",
      onChange: (
        event: ChangeEvent<
          HTMLInputElement |
          HTMLTextAreaElement |
          HTMLSelectElement
        >
      ) => updateValue(field.id, event.target.value),
      onFocus: () => onFieldFocus?.(field.id),
      onClick: () => onFieldClick?.(field.id),
      onBlur: () => onFieldBlur?.(field.id),
      className:
        "w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20",
    };

    return (
      <div key={field.id} className="space-y-2">
        <label
          htmlFor={field.id}
          className="block text-sm font-medium text-slate-200"
        >
          {field.label}
          {field.required && (
            <span className="ml-1 text-red-400">*</span>
          )}
        </label>

        {field.description && (
          <p className="text-xs text-slate-400">
            {field.description}
          </p>
        )}

        {field.type === "textarea" && (
          <textarea {...commonProps} rows={3} />
        )}

        {field.type === "select" && (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {field.type === "checkbox" && (
          <label className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3">
            <input
              id={field.id}
              name={field.id}
              type="checkbox"
              required={field.required}
              checked={values[field.id] === true}
              onChange={(event) =>
                updateValue(field.id, event.target.checked)
              }
              onFocus={() => onFieldFocus?.(field.id)}
              onClick={() => onFieldClick?.(field.id)}
              onBlur={() => onFieldBlur?.(field.id)}
              className="h-4 w-4 accent-indigo-500"
            />

            <span className="text-sm text-slate-300">
              {field.description || field.label}
            </span>
          </label>
        )}

        {["text", "email", "tel", "number", "date"].includes(
          field.type
        ) && (
          <input {...commonProps} type={field.type} />
        )}

        {shouldShowAssistance && friction && (
          <div
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-amber-300">
                AuraGen Assistance
              </span>
              <span className="text-xs text-amber-200">
                Friction: {friction.frictionScore}/100
              </span>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {getFieldSuggestion(field)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const submitAction = schema.actions.find(
    (action) => action.type === "submit"
  );

  const isLastSection =
    currentSection === totalSections - 1;

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-950 p-6 text-white shadow-xl sm:p-8">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            AuraGen Dynamic Interface
          </span>

          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs capitalize text-indigo-300">
            {schema.layout} mode
          </span>
        </div>

        <h2 className="text-2xl font-bold">{schema.title}</h2>

        {schema.description && (
          <p className="mt-2 text-sm text-slate-400">
            {schema.description}
          </p>
        )}
      </div>

      {isGuided && totalSections > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>
              Step {currentSection + 1} of {totalSections}
            </span>
            <span>
              {Math.round(
                ((currentSection + 1) / totalSections) * 100
              )}
              %
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{
                width: `${
                  ((currentSection + 1) / totalSections) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {visibleSections.map((section) => (
          <section key={section.id} className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {section.title}
              </h3>

              {section.description && (
                <p className="mt-1 text-sm text-slate-400">
                  {section.description}
                </p>
              )}
            </div>

            <div
              className={
                schema.layout === "standard"
                  ? "grid grid-cols-1 gap-5 sm:grid-cols-2"
                  : "grid grid-cols-1 gap-5"
              }
            >
              {section.fields.map(renderField)}
            </div>
          </section>
        ))}

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-between gap-3 border-t border-slate-800 pt-6">
          {isGuided && currentSection > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-slate-600 px-5 py-3 text-sm text-slate-200 hover:bg-slate-800"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {isGuided && !isLastSection ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={totalSections === 0}
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitAction?.label || "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
