
export type UIFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "textarea"
  | "checkbox";

export type UIField = {
  id: string;
  label: string;
  type: UIFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: {
    label: string;
    value: string;
  }[];
};

export type UISection = {
  id: string;
  title: string;
  description?: string;
  fields: UIField[];
};

export type UILayoutMode =
  | "standard"
  | "simplified"
  | "guided";

export type UIAction = {
  id: string;
  label: string;
  type: "submit" | "next" | "back";
};

export type AdaptiveUISchema = {
  version: 1;
  layout: UILayoutMode;
  title: string;
  description?: string;
  sections: UISection[];
  actions: UIAction[];
};
