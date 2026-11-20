import { ChatOpenAI } from "@langchain/openai";

const SYSTEM_PROMPT = `
You are AuraGen's React UI code-generation assistant.
Generate one self-contained React function component as JavaScript JSX source code.
The output will be reviewed as code text and is NOT executed automatically.

Design-system contract:
- Use React function components and standard JSX.
- Use plain CSS class names; do not use Tailwind.
- Use semantic HTML, labels connected to inputs, and accessible button text.
- Use a clean card layout, readable spacing, and responsive-friendly structure.
- For a wizard, show one question at a time, a step indicator, Previous and Next buttons,
  and preserve entered values in React state.
- Do not import external packages, use eval, access browser globals beyond normal React
  event handling, make network requests, or include script tags.
- Do not include markdown fences or explanations. Return only the component source.
- Do not claim that this output is secure or production-ready.
`;

export async function generateReactComponent({ task, formContext }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is not configured. Add it to server/.env.");
    error.status = 503;
    throw error;
  }

  const model = new ChatOpenAI({
    apiKey,
    model: process.env.OPENAI_MODEL || "gpt-4o",
    temperature: 0.2
  });

  const response = await model.invoke([
    ["system", SYSTEM_PROMPT],
    ["human", `Generate a React component for this task:\n${task}\n\nForm context:\n${JSON.stringify(formContext || {}, null, 2)}`]
  ]);

  const content = typeof response.content === "string"
    ? response.content
    : response.content.map((part) => part.text || "").join("");

  return content.replace(/^```(?:jsx|javascript|js)?\s*/i, "").replace(/\s*```$/, "").trim();
}
