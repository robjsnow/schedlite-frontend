'use client'

export function setToken(token: string) {
  localStorage.setItem('schedlite_token', token);
}

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('schedlite_token') : null;
}

export function clearToken() {
  localStorage.removeItem('schedlite_token');
}