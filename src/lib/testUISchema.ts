
import { sampleUISchema } from "./sampleUISchema";
import { validateUISchema } from "./validateUISchema";

const result = validateUISchema(sampleUISchema);

console.log("AuraGen UI Schema Validation");
console.log("----------------------------");
console.log("Valid:", result.valid);
console.log("Errors:", result.errors);

if (!result.valid) {
  throw new Error("Sample UI schema validation failed.");
}
