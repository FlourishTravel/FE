import { API_BASE } from './config';

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
 * Tra cứu tọa độ qua VietMap (BE proxy, dùng VIETMAP_API_KEY server-side).
 * @returns {Promise<{ latitude: number, longitude: number, label: string, provider?: string } | null>}
 */
export async function resolveActivityCoordinates({
    locationName,
    locationAddress,
    destinationCity,
}) {
    const params = new URLSearchParams();
    if (locationName?.trim()) params.set('locationName', locationName.trim());
    if (locationAddress?.trim()) params.set('locationAddress', locationAddress.trim());
    if (destinationCity?.trim()) params.set('destinationCity', destinationCity.trim());

    const res = await fetch(`${API_BASE}/tours/admin/geocode?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
    const json = await parseJson(res);
    const data = json?.data;
    if (data?.latitude == null || data?.longitude == null) return null;
    return {
        latitude: data.latitude,
        longitude: data.longitude,
        label: data.label || locationName || locationAddress || destinationCity,
        provider: data.provider,
    };
}
