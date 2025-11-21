// frontend/src/api.ts
export const PATIENT_SIGNUP_URL       = "http://localhost:8000/auth/signup/patient";
export const PRACTITIONER_SIGNUP_URL = "http://localhost:8000/auth/signup/practitioner";

// You said you want these exact endpoints:
export const PATIENT_LOGIN_URL       = "http://localhost:8000/api/patients/login";
export const PRACTITIONER_LOGIN_URL = "http://localhost:8000/api/practitioners/login";

// Helper to POST JSON and return parsed JSON or throw.
async function postJson(url: string, body: any, opts: RequestInit = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...opts,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export async function signupPatient(payload: any) {
  return postJson(PATIENT_SIGNUP_URL, payload);
}
export async function signupPractitioner(payload: any) {
  return postJson(PRACTITIONER_SIGNUP_URL, payload);
}
export async function loginPatient(payload: any) {
  return postJson(PATIENT_LOGIN_URL, payload);
}
export async function loginPractitioner(payload: any) {
  return postJson(PRACTITIONER_LOGIN_URL, payload);
}
