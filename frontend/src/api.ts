 


// frontend/src/api.ts
export const PATIENT_SIGNUP_URL       = "http://localhost:8000/api/patient";
export const PRACTITIONER_SIGNUP_URL = "http://localhost:8000/api/practitioner";

// You said you want these exact endpoints:
export const PATIENT_LOGIN_URL       = "http://localhost:8000/api/auth/login";
export const PRACTITIONER_LOGIN_URL = "http://localhost:8000/api/auth/login";

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

export const CREATE_SUB_USER_URL = (ownerId: number) =>
  `http://localhost:8000/api/patient/${ownerId}/sub-user`;

// export async function createSubUser(ownerId: number, payload: any) {
//   const token = localStorage.getItem("token");

//   return fetch(CREATE_SUB_USER_URL(ownerId), {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(payload),
//   }).then(res => res.json());
// }

export async function createSubUser(
  ownerId: string | number,
  payload: any
) {
  const res = await fetch(
    `http://localhost:8000/api/patient/${ownerId}/sub-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    const errorMessage = err?.message || err?.detail || err?.error || text || `HTTP ${res.status}: ${res.statusText}`;
    const error = new Error(errorMessage);
    (error as any).response = err;
    throw error;
  }

  return res.json();
}
 export async function getSubUsers(ownerId: number | string) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `http://localhost:8000/api/patient/${ownerId}/sub-users`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }

  const json = await res.json();

  // 🔥 THIS IS THE MISSING CASE
  if (Array.isArray(json?.data?.sub_users)) {
    return json.data.sub_users;
  }

  // fallback safety
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.sub_users)) return json.sub_users;
  if (Array.isArray(json?.data)) return json.data;

  console.error("Unexpected sub-user response shape:", json);
  return [];
}



export async function getUserById(userId: string | number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:8000/api/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    throw new Error(err?.message || err?.detail || `Failed to fetch user`);
  }

  const json = await res.json();
  
  // Handle APIResponse structure: { status, message, data: {...}, id }
  // Return the full response so caller can handle data extraction
  return json;
}

export async function getProfileDetails(profileType: string, profileId: string | number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:8000/api/profile/${profileType}/${profileId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    throw new Error(err?.message || err?.detail || `Failed to fetch profile`);
  }

  return res.json();
}

export async function createCase(formData: FormData) {
  const token = localStorage.getItem("token");

  console.log("Creating case with FormData:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const res = await fetch("http://localhost:8000/api/cases", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log("Response status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);
    const err = await res.json().catch(() => ({ message: text }));
    throw new Error(err?.message || "Failed to create case");
  }

  return res.json();
}

export async function updateUser(userId: string | number, userData: any) {
  const token = localStorage.getItem("token");

  console.log("Updating user:", userId, "with data:", userData);

  const res = await fetch(`http://localhost:8000/api/user/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  console.log("Response status:", res.status);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    throw new Error(err?.message || err?.detail || "Failed to update user");
  }

  return res.json();
}

export async function updateUserDashboard(userId: string | number, userData: any) {
  const token = localStorage.getItem("token");

  console.log("Updating user dashboard:", userId, "with data:", userData);

  const res = await fetch(`http://localhost:8000/api/user/${userId}/dashboard`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  console.log("Response status:", res.status);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    throw new Error(err?.message || err?.detail || "Failed to update user demographics");
  }

  return res.json();
}

export async function updateSubUser(subUserId: string | number, userData: any) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:8000/api/patient/sub-user/${subUserId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    throw new Error(err?.message || err?.detail || "Failed to update sub-user");
  }

  return res.json();
}

export async function updateSubUserDashboard(subUserId: string | number, userData: any) {
  const token = localStorage.getItem("token");

  console.log("Updating sub-user dashboard:", subUserId, "with data:", userData);

  const res = await fetch(`http://localhost:8000/api/patient/sub-user/${subUserId}/dashboard`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  console.log("Response status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }
    throw new Error(err?.message || err?.detail || "Failed to update sub-user demographics");
  }

  return res.json();
}