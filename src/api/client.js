const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7070/api';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // section 15: "서버와 통신할 수 없는 경우"
    throw new ApiError(0, 'NETWORK_ERROR', '서버와 통신할 수 없습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.');
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = null;
    }
  }

  if (!response.ok) {
    const code = data?.error || 'UNKNOWN_ERROR';
    const message = data?.message || '알 수 없는 오류가 발생했습니다.';
    throw new ApiError(response.status, code, message);
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
