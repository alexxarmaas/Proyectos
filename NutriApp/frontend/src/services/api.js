const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let message = "Error inesperado";
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch (_error) {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const authApi = {
  login: (body) => request("/auth/login", { method: "POST", body }),
  logout: (token) => request("/auth/logout", { method: "POST", token }),
  me: (token) => request("/auth/me", { token })
};

export const dashboardApi = {
  summary: (token) => request("/dashboard/summary", { token })
};

export const patientsApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/patients${query ? `?${query}` : ""}`, { token });
  },
  detail: (token, id) => request(`/patients/${id}`, { token }),
  create: (token, body) => request("/patients", { method: "POST", token, body }),
  update: (token, id, body) => request(`/patients/${id}`, { method: "PUT", token, body }),
  remove: (token, id) => request(`/patients/${id}`, { method: "DELETE", token }),
  addNote: (token, id, body) => request(`/patients/${id}/notes`, { method: "POST", token, body })
};

export const consultationsApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/consultations${query ? `?${query}` : ""}`, { token });
  },
  create: (token, body) => request("/consultations", { method: "POST", token, body }),
  update: (token, id, body) => request(`/consultations/${id}`, { method: "PUT", token, body }),
  remove: (token, id) => request(`/consultations/${id}`, { method: "DELETE", token }),
  addFollowup: (token, id, body) =>
    request(`/consultations/${id}/followups`, { method: "POST", token, body })
};

export const agendaApi = {
  week: (token, startDate) =>
    request(`/agenda/week?${new URLSearchParams({ startDate })}`, { token })
};
