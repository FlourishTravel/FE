const OPEN_METEO_GEO = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Tra cứu tọa độ qua Open-Meteo (cùng nguồn BE Flora dùng). Không cần API key.
 * @param {string} query
 * @returns {Promise<{ latitude: number, longitude: number, label: string } | null>}
 */
export async function geocodePlace(query) {
    if (!query?.trim()) return null;
    const name = encodeURIComponent(query.trim());
    const res = await fetch(`${OPEN_METEO_GEO}?name=${name}&count=1&language=vi`);
    if (!res.ok) return null;
    const body = await res.json();
    const first = body?.results?.[0];
    if (first?.latitude == null || first?.longitude == null) return null;
    return {
        latitude: first.latitude,
        longitude: first.longitude,
        label: first.name || query.trim(),
    };
}

/**
 * Suy luận tọa độ hoạt động: ưu tiên địa chỉ chi tiết → tên địa điểm → thành phố đích tour.
 */
export async function resolveActivityCoordinates({
    locationName,
    locationAddress,
    destinationCity,
}) {
    const tries = [];
    if (locationAddress?.trim()) tries.push(`${locationAddress.trim()} Vietnam`);
    if (locationName?.trim()) tries.push(`${locationName.trim()} Vietnam`);
    if (destinationCity?.trim()) tries.push(`${destinationCity.trim()} Vietnam`);

    for (const q of tries) {
        const hit = await geocodePlace(q);
        if (hit) return hit;
    }
    return null;
}
