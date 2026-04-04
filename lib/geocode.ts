async function fetchNominatim(q: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=jp&accept-language=ja&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "NewOpen/1.0 (newopen-app)" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// 住所を段階的に短くしてgeocodingを試みる
// 例: "東京都中央区銀座6丁目10-1" → "東京都中央区銀座6丁目" → "東京都中央区銀座" → "東京都中央区"
function simplify(address: string): string[] {
  const variants: string[] = [address];

  // 番地除去: "6丁目10-1" → "6丁目"
  const noBanchi = address.replace(/(\d+丁目)\d+[-－]\d+/, "$1").replace(/\d+[-－]\d+$/, "").trim();
  if (noBanchi !== address) variants.push(noBanchi);

  // 丁目除去: "銀座6丁目" → "銀座"
  const noChome = noBanchi.replace(/\d+丁目$/, "").trim();
  if (noChome !== noBanchi) variants.push(noChome);

  // 町名除去: 市区町村まで
  const m = address.match(/^(.{2,6}?[都道府県])(.{1,6}?[市区町村郡])/);
  if (m) {
    const cityLevel = m[1] + m[2];
    if (!variants.includes(cityLevel)) variants.push(cityLevel);
  }

  return variants;
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const queries = simplify(address);
  for (const q of queries) {
    try {
      const result = await fetchNominatim(q);
      if (result) return result;
    } catch {
      // 次のクエリへ
    }
  }
  return null;
}
