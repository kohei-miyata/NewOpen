"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

// 東京デフォルト
const TOKYO = { lat: 35.6895, lng: 139.6917 };

interface Props {
  lat: number | null;
  lng: number | null;
  name: string;
}

function IframeMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=ja`;
  return (
    <iframe
      src={src}
      title={name}
      width="100%"
      height="280"
      style={{ border: 0, borderRadius: "0.75rem" }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

function GoogleMapsComponent({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  // APIキー未設定 or ロードエラー → iframeにフォールバック
  if (!apiKey || loadError) {
    return <IframeMap lat={lat} lng={lng} name={name} />;
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[280px] rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400 animate-pulse">
        地図を読み込み中...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "280px", borderRadius: "0.75rem" }}
      center={{ lat, lng }}
      zoom={15}
      options={{ scrollwheel: false }}
    >
      <Marker position={{ lat, lng }} title={name} />
    </GoogleMap>
  );
}

export default function Map({ lat, lng, name }: Props) {
  const resolvedLat = lat ?? TOKYO.lat;
  const resolvedLng = lng ?? TOKYO.lng;

  return <GoogleMapsComponent lat={resolvedLat} lng={resolvedLng} name={name} />;
}
