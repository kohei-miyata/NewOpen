"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function MapWrapper(props: Props) {
  return <Map {...props} />;
}
