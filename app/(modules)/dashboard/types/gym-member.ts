export type Role = "member" | "staff" | "admin" | "superadmin";

export type GymMember = {
  user_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  health_conditions?: string;
  notes?: string;
  position?: string;
  status?: string;
  specialization?: string;
  membership_status?: string;
  [key: string]: unknown;
};

