export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("farmconnect-token");
  
  if (!token) {
    return {};
  }

  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem("farmconnect-token");
  const user = localStorage.getItem("farmconnect-user");
  
  return !!(token && user);
}

export function getCurrentUser() {
  const userStr = localStorage.getItem("farmconnect-user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("farmconnect-token");
  localStorage.removeItem("farmconnect-user");
  window.location.href = "/";
}

export function getUserRole(): "farmer" | "customer" | null {
  const user = getCurrentUser();
  return user?.role || null;
}
