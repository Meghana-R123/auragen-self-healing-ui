
import { NextRequest, NextResponse } from "next/server";
import type { AdaptiveUISchema } from "../../../types/ui-schema";

const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const MODEL = "openai/gpt-oss-20b";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { currentSchema, frictionSignals } = body;

    if (
      !currentSchema ||
      !Array.isArray(currentSchema.sections) ||
      !Array.isArray(currentSchema.actions) ||
      !frictionSignals
    ) {
      return NextResponse.json(
        { error: "Invalid schema or friction signals." },
        { status: 400 }
      );
    }

    const originalSchema =
      currentSchema as AdaptiveUISchema;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_completion_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are AuraGen, an intelligent adaptive UI design agent.

Analyze the existing interface and its friction signals.

Your task is to recommend a better organization of the interface.

You MUST follow these rules:

1. Return JSON only.
2. Do not generate form fields.
3. Do not generate actions.
4. Do not invent or remove section IDs.
5. Every existing section ID must appear exactly once.
6. You may reorder the sections.
7. You may improve section titles and descriptions.
8. Select one layout: standard, simplified, or guided.
9. Use guided when step-by-step assistance is useful.
10. Never generate JavaScript, HTML, JSX or executable code.

Return exactly this structure:

{
  "layout": "standard",
  "title": "Financial Application",
  "description": "A short helpful description",
  "sections": [
    {
      "id": "personal-details",
      "title": "Personal Details",
      "description": "Helpful section description"
    }
  ]
}

Include every section ID supplied in the user input.
            `,
          },
          {
            role: "user",
            content: JSON.stringify({
              currentSchema: {
                version: originalSchema.version,
                title: originalSchema.title,
                sections: originalSchema.sections.map(
                  (section) => ({
                    id: section.id,
                    title: section.title,
                    description: section.description,
                    fieldIds: section.fields.map(
                      (field) => field.id
                    ),
                  })
                ),
              },
              frictionSignals,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Groq API error:", errorDetails);

      return NextResponse.json(
        { error: "Groq could not generate the adapted interface." },
        { status: response.status }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Groq returned an empty response." },
        { status: 502 }
      );
    }

    const recommendation = JSON.parse(content);

    const allowedLayouts = [
      "standard",
      "simplified",
      "guided",
    ];

    if (!allowedLayouts.includes(recommendation.layout)) {
      throw new Error("Groq returned an invalid layout.");
    }

    if (!Array.isArray(recommendation.sections)) {
      throw new Error("Groq returned invalid sections.");
    }

    const originalSectionIds =
      originalSchema.sections.map((section) => section.id);

    const generatedSectionIds =
      recommendation.sections.map(
        (section: { id: string }) => section.id
      );

    const idsMatch =
      originalSectionIds.length === generatedSectionIds.length &&
      originalSectionIds.every((id) =>
        generatedSectionIds.includes(id)
      ) &&
      new Set(generatedSectionIds).size ===
        generatedSectionIds.length;

    if (!idsMatch) {
      throw new Error(
        "Groq changed or removed existing section IDs."
      );
    }

    const originalSections = new Map(
      originalSchema.sections.map((section) => [
        section.id,
        section,
      ])
    );

    const adaptedSections = recommendation.sections.map(
      (section: {
        id: string;
        title?: string;
        description?: string;
      }) => {
        const original = originalSections.get(section.id);

        if (!original) {
          throw new Error("Unknown section returned by Groq.");
        }

        return {
          ...original,
          title:
            typeof section.title === "string"
              ? section.title
              : original.title,
          description:
            typeof section.description === "string"
              ? section.description
              : original.description,
        };
      }
    );

    const adaptedSchema: AdaptiveUISchema = {
      ...originalSchema,
      layout: recommendation.layout,
      title:
        typeof recommendation.title === "string"
          ? recommendation.title
          : originalSchema.title,
      description:
        typeof recommendation.description === "string"
          ? recommendation.description
          : originalSchema.description,
      sections: adaptedSections,
      actions: originalSchema.actions,
    };

    return NextResponse.json({
      success: true,
      model: result.model,
      adaptedSchema,
    });
  } catch (error) {
    console.error("AuraGen adaptation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected adaptation error.",
      },
      { status: 500 }
    );
  }
}
