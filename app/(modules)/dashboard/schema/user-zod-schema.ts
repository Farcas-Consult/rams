import { z } from "zod";

export const GymMemberSchema = z.object({
  user_id: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone_number: z.string().optional(),
  gender: z.string().optional(),
  health_conditions: z.string().optional(),
  notes: z.string().optional(),
  position: z.string().optional(),
  status: z.string().optional(),
  specialization: z.string().optional(),
  membership_status: z.string().optional(),
});

export type GymMemberFormData = z.infer<typeof GymMemberSchema>;

