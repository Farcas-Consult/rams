import type { GymMemberFormData } from "@/app/(modules)/dashboard/schema/user-zod-schema";

export const userFormFields: { name: keyof GymMemberFormData; label: string; placeholder: string }[] = [
  { name: "first_name", label: "First Name", placeholder: "John" },
  { name: "last_name", label: "Last Name", placeholder: "Doe" },
  { name: "email", label: "Email Address", placeholder: "john@example.com" },
  { name: "phone_number", label: "Phone Number", placeholder: "0712345678" },
  { name: "gender", label: "Gender", placeholder: "male" },
  { name: "health_conditions", label: "Health Conditions", placeholder: "None" },
  { name: "notes", label: "Notes", placeholder: "Additional information" },
  { name: "position", label: "Position", placeholder: "Trainer" },
  { name: "status", label: "Status", placeholder: "active" }
];
