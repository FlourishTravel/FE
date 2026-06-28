import { API_BASE } from './config';

/**
 * API client cho Tour (admin & public).
 * - GET /tours và /tours/admin: GET là public ở SecurityConfig nhưng /tours/admin còn @PreAuthorize ADMIN.
 * - Mutation cần Authorization: Bearer <token>.
 */

const TOKEN_STORAGE_KEY = 'flourish_token';

function authHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJson(res) {
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const message = (json && json.message) || `Yêu cầu thất bại (HTTP ${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

/**
 * Lấy danh sách tour cho admin (kèm category, ảnh, session sớm nhất, status).
 * @param {{ q?: string, status?: string, page?: number, size?: number }} params
 * @returns {Promise<{ content: any[], totalElements: number, totalPages: number, number: number }>}
 */
export async function listAdminTours(params = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.status && params.status !== 'all') search.set('status', params.status);
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.size !== undefined) search.set('size', String(params.size));

  const url = `${API_BASE}/tours/admin${search.toString() ? `?${search.toString()}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  const page = json?.data || {};
  return {
    content: Array.isArray(page.content) ? page.content : [],
    totalElements: page.totalElements ?? 0,
    totalPages: page.totalPages ?? 0,
    number: page.number ?? 0,
    size: page.size ?? 0,
  };
}

/**
 * Lấy chi tiết tour cho admin (đầy đủ ảnh, video, session, lịch trình, địa điểm).
 */
export async function getAdminTourDetail(id) {
  const res = await fetch(`${API_BASE}/tours/admin/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function createTour(payload) {
  const res = await fetch(`${API_BASE}/tours`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function updateTour(id, payload) {
  const res = await fetch(`${API_BASE}/tours/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return json?.data;
}

export async function deleteTour(id) {
  const res = await fetch(`${API_BASE}/tours/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  await parseJson(res);
}

/**
 * Tạo lịch khởi hành đầu tiên cho tour vừa khởi tạo.
 * Backend endpoint: POST /admin/sessions
 */
export async function createAdminSession(payload) {
  const res = await fetch(`${API_BASE}/admin/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return json?.data;
}

/**
 * Lấy danh sách lịch trình đầy đủ (kèm activities) cho Itinerary Builder.
 * @returns {Promise<Array<{
 *   id, dayNumber, title, description, summary, coverImageUrl,
 *   accommodation, transport, mealsIncluded, highlights,
 *   activities: Array<object>
 * }>>}
 */
export async function getTourItinerary(tourId) {
  const res = await fetch(`${API_BASE}/tours/admin/${tourId}/itinerary`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/** Lưu toàn bộ lịch trình (bulk replace). */
export async function saveTourItinerary(tourId, days) {
  const res = await fetch(`${API_BASE}/tours/admin/${tourId}/itinerary`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(days),
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/** Lưu toàn bộ địa điểm tour (bulk replace, gắn theo ngày lịch trình). */
export async function saveTourLocations(tourId, locations) {
  const res = await fetch(`${API_BASE}/tours/admin/${tourId}/locations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(locations),
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Danh sách tour công khai (còn chỗ theo backend) — dùng trang Tour trải nghiệm.
 * @param {{ destination?: string, minPrice?: number, maxPrice?: number, categoryId?: string, startDate?: string, page?: number, size?: number }} params
 */
export async function listPublicTours(params = {}) {
  const search = new URLSearchParams();
  if (params.destination) search.set('destination', params.destination);
  if (params.minPrice != null && params.minPrice !== '') search.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null && params.maxPrice !== '') search.set('maxPrice', String(params.maxPrice));
  if (params.categoryId) search.set('categoryId', params.categoryId);
  if (params.segment) search.set('segment', params.segment);
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.page != null) search.set('page', String(params.page));
  if (params.size != null) search.set('size', String(params.size));

  const url = `${API_BASE}/tours${search.toString() ? `?${search.toString()}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJson(res);
  const page = json?.data || {};
  return {
    content: Array.isArray(page.content) ? page.content : [],
    totalElements: page.totalElements ?? 0,
    totalPages: page.totalPages ?? 0,
    number: page.number ?? 0,
    size: page.size ?? 0,
  };
}

/** Chi tiết tour công khai (ảnh, lịch trình, session đặt chỗ). */
export async function getPublicTour(id) {
  const res = await fetch(`${API_BASE}/tours/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJson(res);
  return json?.data;
}

/** Tour gợi ý tương tự (cùng danh mục / mới nhất). */
export async function getSimilarTours(tourId, limit = 4) {
  const res = await fetch(`${API_BASE}/tours/${tourId}/similar?limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await parseJson(res);
  return Array.isArray(json?.data) ? json.data : [];
}
