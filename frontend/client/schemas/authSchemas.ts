import { z } from "zod";

// ---------- Patient Schemas ----------
export const patientSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(2, "First name must be at least 2 characters").max(50),
  last_name: z.string().min(2, "Last name must be at least 2 characters").max(50),
  password: z.string().min(8, "Password must be at least 8 characters").max(64),
  age: z.number().gt(18, "Age must be greater than 18"),
  sex: z.enum(["F", "M", "O"], { errorMap: () => ({ message: "Sex must be F, M or O" }) }),
  ethnicity: z.string().min(1, "Ethnicity is required"),
  country: z.string().regex(/^[A-Z]{2}$/, "Country must be ISO-3166-1 Alpha-2 code (e.g., US)"),
  province: z.string().regex(/^[A-Z]{2}-[A-Z0-9]{1,3}$/, "Province must be ISO-3166-2 format (e.g., US-CA)"),
  respiratory_history: z
  .array(z.string())
  .min(1, "Please select at least one option"),

});

export const patientLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

// ---------- Practitioner Schemas ----------
export const practitionerSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(2, "First name must be at least 2 characters").max(50),
  last_name: z.string().min(2, "Last name must be at least 2 characters").max(50),
  password: z.string().min(8, "Password must be at least 8 characters").max(64),
  practitioner_id: z.string()
      .regex(/^[A-Za-z0-9]{6,20}$/, "Practitioner ID must be 6-20 alphanumeric characters"),
  institution: z.string().min(3, "Institution must be at least 3 characters").max(100),
  institution_location_country: z
  .string()
  .min(2, "Country is required")
  .max(3, "Invalid country code"),

institution_location_province: z
  .string()
  .min(2, "Province is required")
  .max(10, "Invalid province code"),
});

export const practitionerLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
