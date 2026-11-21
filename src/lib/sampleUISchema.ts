
import type { AdaptiveUISchema } from "../types/ui-schema";

export const sampleUISchema: AdaptiveUISchema = {
  version: 1,
  layout: "simplified",
  title: "Financial Application",
  description: "Complete the essential details below.",

  sections: [
    {
      id: "personal-details",
      title: "Personal Details",
      description: "Tell us about yourself.",
      fields: [
        {
          id: "fullName",
          label: "Full Name",
          type: "text",
          placeholder: "Enter your full name",
          required: true,
        },
        {
          id: "email",
          label: "Email Address",
          type: "email",
          placeholder: "Enter your email",
          required: true,
        },
        {
          id: "phone",
          label: "Phone Number",
          type: "tel",
          placeholder: "Enter your phone number",
          required: true,
        },
      ],
    },
    {
      id: "financial-details",
      title: "Financial Details",
      description: "Provide your financial requirements.",
      fields: [
        {
          id: "income",
          label: "Monthly Income",
          type: "number",
          placeholder: "Enter your monthly income",
          required: true,
        },
        {
          id: "loanAmount",
          label: "Loan Amount",
          type: "number",
          placeholder: "Enter the required loan amount",
          required: true,
        },
      ],
    },
  ],

  actions: [
    {
      id: "submit-application",
      label: "Submit Application",
      type: "submit",
    },
  ],
};
