const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'ecoweave_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  }

  return res;
}

export interface UserData {
  user_id: string;
  full_name: string;
  email: string;
  organization?: string;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await authFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  const data: TokenResponse = await res.json();
  setToken(data.access_token);
  return data;
}

export async function signup(
  full_name: string,
  email: string,
  password: string,
  organization?: string,
): Promise<TokenResponse> {
  const res = await authFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ full_name, email, password, organization }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Signup failed');
  }
  const data: TokenResponse = await res.json();
  setToken(data.access_token);
  return data;
}

export async function getMe(): Promise<UserData> {
  const res = await authFetch('/api/auth/me');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function updateProfile(data: {
  full_name?: string;
  email?: string;
  organization?: string;
}): Promise<UserData> {
  const res = await authFetch('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Update failed');
  }
  return res.json();
}

export async function changePassword(old_password: string, new_password: string) {
  const res = await authFetch('/api/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ old_password, new_password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Password change failed');
  }
  return res.json();
}

export async function uploadCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await authFetch('/api/csv-upload/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function getBatches(params?: {
  skip?: number;
  limit?: number;
  risk_min?: number;
  risk_max?: number;
  date_from?: string;
  date_to?: string;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query.set(k, String(v));
    });
  }
  const res = await authFetch(`/api/batches?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch batches');
  return res.json();
}

export async function getBatchById(batchId: string) {
  const res = await authFetch(`/api/batches/${batchId}`);
  if (!res.ok) throw new Error('Batch not found');
  return res.json();
}

export async function getBatchStats() {
  const res = await authFetch('/api/batches/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getAlerts(statusFilter?: string) {
  const query = statusFilter ? `?status_filter=${statusFilter}` : '';
  const res = await authFetch(`/api/alerts${query}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function getAlertStats() {
  const res = await authFetch('/api/alerts/stats');
  if (!res.ok) throw new Error('Failed to fetch alert stats');
  return res.json();
}

export async function updateAlertStatus(alertId: string, status: string) {
  const res = await authFetch(`/api/alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update alert');
  return res.json();
}

export async function clearResolvedAlerts() {
  const res = await authFetch('/api/alerts', { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear alerts');
  return res.json();
}

export async function generateReport(data: {
  report_type: string;
  format: string;
  date_from?: string;
  date_to?: string;
}): Promise<Blob> {
  const res = await authFetch('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Report generation failed');
  }
  return res.blob();
}

export async function getSettings() {
  const res = await authFetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(data: Record<string, unknown>) {
  const res = await authFetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function getMlStatus() {
  const res = await fetch(`${API_URL}/api/ml/status`);
  if (!res.ok) throw new Error('Backend unreachable');
  return res.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
