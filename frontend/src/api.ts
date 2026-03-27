// Base URL configuration - reads from .env for production flexibility
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Google OAuth URLs
export const GOOGLE_OAUTH_CALLBACK_URL = `${API_BASE_URL}/auth/google/callback`;
export const GOOGLE_COMPLETE_PROFILE_URL = `${API_BASE_URL}/auth/google/complete-profile`;
export const ADMIN_LOGIN_URL = `${API_BASE_URL}/auth/admin/login`;
export const REFRESH_TOKEN_URL = `${API_BASE_URL}/auth/refresh`;
export const LOGOUT_URL = `${API_BASE_URL}/auth/logout`;
export const CONSENT_URL = `${API_BASE_URL}/auth/consent`;  // ← NEW

// Centralized error handler
function handleApiError(res: Response, text: string, defaultMessage: string): never {
  let errorMessage = defaultMessage;

  try {
    const err = JSON.parse(text);
    errorMessage = err?.detail || err?.message || err?.error || defaultMessage;
  } catch {
    if (text) errorMessage = text;
  }

  if (res.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('profile_picture');
    window.location.href = '/select-role';
    errorMessage = "Session expired. Redirecting to login...";
  } else if (res.status === 403) {
    errorMessage = "Access denied. You don't have permission to perform this action.";
  } else if (res.status === 404) {
    errorMessage = "Resource not found. Please check and try again.";
  } else if (res.status === 500) {
    errorMessage = "Server error. Please try again later.";
  }

  throw new Error(errorMessage);
}

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

// ─── Google OAuth ────────────────────────────────────────────────────────────

export async function googleOAuthCallback(code: string, role: string) {
  try {
    console.log('Calling Google OAuth callback with:', { code: code?.substring(0, 20) + '...', role });

    const response = await fetch(GOOGLE_OAUTH_CALLBACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, role }),
    });

    console.log('OAuth callback response status:', response.status);

    const text = await response.text();
    console.log('OAuth callback response text:', text);

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData?.detail || errorData?.message || text;
      } catch {
        errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    throw error;
  }
}

/**
 * Record the user's consent_for_training = true in the data_consent table.
 *
 * MUST be called AFTER googleOAuthCallback succeeds and the access_token has
 * been written to localStorage — the endpoint requires a Bearer token.
 *
 * Intentionally non-throwing: a consent write failure should never block the
 * user from completing login. The error is logged to the console only.
 */
export async function recordConsent(): Promise<void> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    console.warn('recordConsent: no access token available, skipping');
    return;
  }

  try {
    const res = await fetch(CONSENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('recordConsent: server returned error:', text);
      // Intentionally not throwing — login must not be blocked by this
    } else {
      console.log('recordConsent: consent recorded successfully');
    }
  } catch (err) {
    // Network error — also non-throwing for the same reason
    console.error('recordConsent: network error:', err);
  }
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function completeGoogleProfile(profileData: any) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error('No access token found. Please login again.');
  }

  const res = await fetch(GOOGLE_COMPLETE_PROFILE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to complete profile");
  }

  return res.json();
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const res = await fetch(ADMIN_LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();

  if (!res.ok) {
    let errorMessage = "Login failed";
    try {
      const err = JSON.parse(text);
      errorMessage = err?.detail || err?.message || err?.error || "Invalid credentials";
    } catch {
      errorMessage = text || "Login failed";
    }
    throw new Error(errorMessage);
  }

  try { return JSON.parse(text); } catch { throw new Error("Invalid response from server"); }
}

// ─── Sub-users ────────────────────────────────────────────────────────────────

export const CREATE_SUB_USER_URL = (ownerId: number) =>
  `${API_BASE_URL}/patient/${ownerId}/sub-user`;

export async function createSubUser(ownerId: string | number, payload: any) {
  const token = localStorage.getItem("access_token");

  if (!token) throw new Error('No access token found. Please login again.');

  const res = await fetch(`${API_BASE_URL}/patient/${ownerId}/sub-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    const errorMessage = err?.message || err?.detail || err?.error || text || `HTTP ${res.status}: ${res.statusText}`;
    const error = new Error(errorMessage);
    (error as any).response = err;
    throw error;
  }

  return res.json();
}

export async function getSubUsers(ownerId: number | string) {
  const token = localStorage.getItem("access_token");

  if (!token) throw new Error('Session expired. Please login again.');

  const res = await fetch(`${API_BASE_URL}/patient/${ownerId}/sub-users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    handleApiError(res, text, "Unable to load family members. Please try again.");
  }

  const json = await res.json();

  if (Array.isArray(json?.data?.sub_users)) return json.data.sub_users;
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.sub_users)) return json.sub_users;
  if (Array.isArray(json?.data)) return json.data;

  console.error("Unexpected sub-user response shape:", json);
  return [];
}

export async function getSubUserById(subUserId: string | number) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/patient/sub-user/${subUserId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || `Failed to fetch sub-user`);
  }

  return res.json();
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserById(userId: string | number) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || `Failed to fetch user`);
  }

  return res.json();
}

export async function getProfileDetails(profileType: string, profileId: string | number) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/profile/${profileType}/${profileId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || `Failed to fetch profile`);
  }

  return res.json();
}

export async function createCase(formData: FormData) {
  const token = localStorage.getItem("access_token");

  if (!token) throw new Error('Session expired. Please login again.');

  const res = await fetch(`${API_BASE_URL}/cases`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    handleApiError(res, text, "Unable to submit case. Please check your data and try again.");
  }

  return res.json();
}

export async function updateUser(userId: string | number, userData: any) {
  const token = localStorage.getItem("access_token");

  console.log("Updating user:", userId, "with data:", userData);

  const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
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
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to update user");
  }

  return res.json();
}

export async function updateUserDashboard(userId: string | number, userData: any) {
  const token = localStorage.getItem("access_token");

  console.log("Updating user dashboard:", userId, "with data:", userData);

  const res = await fetch(`${API_BASE_URL}/user/${userId}/dashboard`, {
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
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to update user demographics");
  }

  return res.json();
}

export async function updateSubUser(subUserId: string | number, userData: any) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/patient/sub-user/${subUserId}`, {
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
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to update sub-user");
  }

  return res.json();
}

export async function updateSubUserDashboard(subUserId: string | number, userData: any) {
  const token = localStorage.getItem("access_token");

  console.log("Updating sub-user dashboard:", subUserId, "with data:", userData);

  const res = await fetch(`${API_BASE_URL}/patient/sub-user/${subUserId}/dashboard`, {
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
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to update sub-user demographics");
  }

  return res.json();
}

// ─── Practitioner ─────────────────────────────────────────────────────────────

export async function getPractitionerCases() {
  const token = localStorage.getItem("access_token");

  if (!token) throw new Error('No access token found. Please login again.');

  const res = await fetch(`${API_BASE_URL}/practitioner/cases`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    handleApiError(res, text, "Unable to load patient cases. Please refresh the page.");
  }

  return res.json();
}

export async function getPractitionerStats() {
  const token = localStorage.getItem("access_token");

  if (!token) throw new Error('No access token found. Please login again.');

  const res = await fetch(`${API_BASE_URL}/practitioner/dashboard/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    handleApiError(res, text, "Unable to load dashboard statistics. Please refresh the page.");
  }

  return res.json();
}

export async function getCaseDetails(caseId: string | number) {
  const token = localStorage.getItem("access_token");

  if (!token) throw new Error('No access token found. Please login again.');

  const res = await fetch(`${API_BASE_URL}/practitioner/cases/${caseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    handleApiError(res, text, "Unable to load case details. The case may not exist or you don't have access.");
  }

  return res.json();
}

export async function submitCaseReview(caseId: string | number, reviewData: any) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/practitioner/cases/${caseId}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to submit review");
  }

  return res.json();
}

export async function updateCaseReview(caseId: string | number, reviewData: any) {
  return submitCaseReview(caseId, reviewData);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function createAdminUser(adminData: any) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/admin/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(adminData),
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to create admin user");
  }

  return res.json();
}

export async function getAdminStats() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to fetch admin stats");
  }

  return res.json();
}

export async function getSuperAdminStats() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/admin/super/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || "Failed to fetch super admin stats");
  }

  return res.json();
}

// ─── Support ──────────────────────────────────────────────────────────────────

export async function createSupportTicket(ticketData: {
  title: string;
  description: string;
  category: string;
  email: string;
  priority?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/support/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticketData),
  });

  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch { throw new Error(text || `HTTP ${res.status}: ${res.statusText}`); }
    throw new Error(err?.message || err?.detail || `Failed to create ticket`);
  }

  return res.json();
}