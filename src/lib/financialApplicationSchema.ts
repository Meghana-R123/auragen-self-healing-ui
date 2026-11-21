import type { AdaptiveUISchema } from "../types/ui-schema";

export const financialApplicationSchema: AdaptiveUISchema = {
  version: 1,
  layout: "standard",
  title: "Financial Application",
  description: "Complete your financial application step by step.",

  sections: [
    {
      id: "personal-information",
      title: "Personal Information",
      description: "Enter your basic personal details.",
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
          placeholder: "example@email.com",
          required: true,
        },
        {
          id: "phone",
          label: "Phone Number",
          type: "tel",
          placeholder: "10-digit phone number",
          required: true,
        },
        {
          id: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          id: "address",
          label: "Residential Address",
          type: "textarea",
          placeholder: "Enter your complete address",
          required: true,
        },
      ],
    },
    {
      id: "employment-details",
      title: "Employment Details",
      description: "Tell us about your current employment.",
      fields: [
        {
          id: "employmentType",
          label: "Employment Type",
          type: "select",
          required: true,
          options: [
            { label: "Salaried", value: "salaried" },
            { label: "Self-employed", value: "self-employed" },
            { label: "Business Owner", value: "business" },
            { label: "Other", value: "other" },
          ],
        },
        {
          id: "company",
          label: "Company / Organization",
          type: "text",
          placeholder: "Enter organization name",
          required: true,
        },
        {
          id: "experience",
          label: "Years of Experience",
          type: "number",
          placeholder: "e.g. 5",
          required: true,
        },
        {
          id: "income",
          label: "Monthly Income (₹)",
          type: "number",
          placeholder: "Enter monthly income",
          required: true,
        },
      ],
    },
    {
      id: "financial-requirements",
      title: "Financial Requirements",
      description: "Provide details about your requested financial assistance.",
      fields: [
        {
          id: "loanAmount",
          label: "Requested Loan Amount (₹)",
          type: "number",
          placeholder: "Enter requested amount",
          required: true,
        },
        {
          id: "loanPurpose",
          label: "Loan Purpose",
          type: "select",
          required: true,
          options: [
            { label: "Education", value: "education" },
            { label: "Home", value: "home" },
            { label: "Business", value: "business" },
            { label: "Personal Expenses", value: "personal" },
            { label: "Other", value: "other" },
          ],
        },
        {
          id: "existingEmi",
          label: "Existing Monthly EMI (₹)",
          type: "number",
          placeholder: "Enter 0 if none",
          required: true,
        },
        {
          id: "repaymentPeriod",
          label: "Preferred Repayment Period",
          type: "select",
          required: true,
          options: [
            { label: "12 months", value: "12" },
            { label: "24 months", value: "24" },
            { label: "36 months", value: "36" },
            { label: "60 months", value: "60" },
          ],
        },
      ],
    },
    {
      id: "consent",
      title: "Confirmation",
      description: "Confirm the information provided.",
      fields: [
        {
          id: "consent",
          label: "I confirm that the information provided is accurate and consent to its use for this demonstration.",
          type: "checkbox",
          required: true,
        },
      ],
    },
  ],

  actions: [
    {
      id: "submit-application",
      label: "Submit Financial Application",
      type: "submit",
    },
  ],
};