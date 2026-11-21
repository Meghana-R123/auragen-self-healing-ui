
import type { AdaptiveUISchema } from "../types/ui-schema";

const allowedLayouts = ["standard", "simplified", "guided"];

const allowedFieldTypes = [
  "text",
  "email",
  "tel",
  "number",
  "date",
  "select",
  "textarea",
  "checkbox",
];

const allowedActionTypes = ["submit", "next", "back"];

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function validateUISchema(
  data: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isObject(data)) {
    return {
      valid: false,
      errors: ["Schema must be an object."],
    };
  }

  if (data.version !== 1) {
    errors.push("Unsupported schema version.");
  }

  if (
    typeof data.layout !== "string" ||
    !allowedLayouts.includes(data.layout)
  ) {
    errors.push("Invalid layout mode.");
  }

  if (
    typeof data.title !== "string" ||
    !data.title.trim()
  ) {
    errors.push("A valid title is required.");
  }

  if (
    data.description !== undefined &&
    typeof data.description !== "string"
  ) {
    errors.push("Description must be a string.");
  }

  const sectionIds = new Set<string>();
  const fieldIds = new Set<string>();
  const actionIds = new Set<string>();

  if (!Array.isArray(data.sections)) {
    errors.push("Sections must be an array.");
  } else {
    if (data.sections.length === 0) {
      errors.push("At least one section is required.");
    }

    data.sections.forEach(
      (section: unknown, index: number) => {
        if (!isObject(section)) {
          errors.push(
            `Section ${index + 1} must be an object.`
          );
          return;
        }

        if (
          typeof section.id !== "string" ||
          !section.id.trim()
        ) {
          errors.push(
            `Section ${index + 1} needs a valid ID.`
          );
        } else if (sectionIds.has(section.id)) {
          errors.push(
            `Duplicate section ID: ${section.id}.`
          );
        } else {
          sectionIds.add(section.id);
        }

        if (
          typeof section.title !== "string" ||
          !section.title.trim()
        ) {
          errors.push(
            `Section ${index + 1} needs a title.`
          );
        }

        if (
          section.description !== undefined &&
          typeof section.description !== "string"
        ) {
          errors.push(
            `Section ${index + 1} description must be a string.`
          );
        }

        if (!Array.isArray(section.fields)) {
          errors.push(
            `Section ${index + 1} fields must be an array.`
          );
          return;
        }

        section.fields.forEach(
          (field: unknown, fieldIndex: number) => {
            if (!isObject(field)) {
              errors.push(
                `Field ${fieldIndex + 1} in section ${index + 1} must be an object.`
              );
              return;
            }

            if (
              typeof field.id !== "string" ||
              !field.id.trim()
            ) {
              errors.push("Every field needs a valid ID.");
            } else if (fieldIds.has(field.id)) {
              errors.push(
                `Duplicate field ID: ${field.id}.`
              );
            } else {
              fieldIds.add(field.id);
            }

            if (
              typeof field.label !== "string" ||
              !field.label.trim()
            ) {
              errors.push("Every field needs a label.");
            }

            if (
              typeof field.type !== "string" ||
              !allowedFieldTypes.includes(field.type)
            ) {
              errors.push(
                `Invalid field type in section ${index + 1}.`
              );
            }

            if (
              field.placeholder !== undefined &&
              typeof field.placeholder !== "string"
            ) {
              errors.push(
                "Field placeholder must be a string."
              );
            }

            if (
              field.description !== undefined &&
              typeof field.description !== "string"
            ) {
              errors.push(
                "Field description must be a string."
              );
            }

            if (
              field.required !== undefined &&
              typeof field.required !== "boolean"
            ) {
              errors.push(
                "Field required property must be a boolean."
              );
            }

            if (field.options !== undefined) {
              if (!Array.isArray(field.options)) {
                errors.push(
                  "Field options must be an array."
                );
              } else {
                const optionValues = new Set<string>();

                field.options.forEach(
                  (option: unknown) => {
                    if (
                      !isObject(option) ||
                      typeof option.label !== "string" ||
                      typeof option.value !== "string"
                    ) {
                      errors.push(
                        "Every option needs a label and value."
                      );
                      return;
                    }

                    if (optionValues.has(option.value)) {
                      errors.push(
                        `Duplicate option value: ${option.value}.`
                      );
                    }

                    optionValues.add(option.value);
                  }
                );
              }
            }

            if (
              field.type === "select" &&
              (!Array.isArray(field.options) ||
                field.options.length === 0)
            ) {
              errors.push(
                `Select field ${String(field.id)} needs at least one option.`
              );
            }
          }
        );
      }
    );
  }

  if (!Array.isArray(data.actions)) {
    errors.push("Actions must be an array.");
  } else {
    data.actions.forEach(
      (action: unknown, index: number) => {
        if (!isObject(action)) {
          errors.push(
            `Action ${index + 1} must be an object.`
          );
          return;
        }

        if (
          typeof action.id !== "string" ||
          !action.id.trim()
        ) {
          errors.push(
            `Action ${index + 1} needs a valid ID.`
          );
        } else if (actionIds.has(action.id)) {
          errors.push(
            `Duplicate action ID: ${action.id}.`
          );
        } else {
          actionIds.add(action.id);
        }

        if (
          typeof action.label !== "string" ||
          !action.label.trim()
        ) {
          errors.push(
            `Action ${index + 1} needs a label.`
          );
        }

        if (
          typeof action.type !== "string" ||
          !allowedActionTypes.includes(action.type)
        ) {
          errors.push(
            `Invalid action type in action ${index + 1}.`
          );
        }
      }
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
