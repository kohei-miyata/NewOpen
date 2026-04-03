export interface LatLng {
  lat: number;
  lng: number;
}

/** Haversine 距離 (km) */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

/**
 * サーバー側: リクエスト IP から緯度経度を取得する。
 * ip-api.com の無料エンドポイントを使用 (非商用・1分500リクエスト)。
 * 失敗時は東京 (35.6895, 139.6917) を返す。
 */
export async function getLatLngFromIp(ip: string | null): Promise<LatLng> {
  const TOKYO: LatLng = { lat: 35.6895, lng: 139.6917 };
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168")) {
    return TOKYO;
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,status`, {
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    if (json.status === "success") return { lat: json.lat, lng: json.lon };
  } catch {
    // fall through
  }
  return TOKYO;
}
