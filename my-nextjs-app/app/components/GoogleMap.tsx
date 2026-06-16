"use client";

import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { useState } from "react";

type Hotel = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
};

type Props = {
  hotels: Hotel[];
  singleHotel?: boolean;
};

export default function GoogleMapComponent({ hotels, singleHotel = false }: Props) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const center = {
    lat: hotels[0]?.latitude ?? -33.4569,
    lng: hotels[0]?.longitude ?? -70.6483,
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        style={{ width: "100%", height: singleHotel ? "400px" : "500px" }}
        defaultCenter={center}
        defaultZoom={singleHotel ? 15 : 12}
        mapId="hotel-map"
      >
        {hotels.map((hotel) => (
          <AdvancedMarker
            key={hotel.id}
            position={{ lat: hotel.latitude, lng: hotel.longitude }}
            onClick={() => setSelectedHotel(hotel)}
          >
            <Pin background="#153243" borderColor="#284B63" glyphColor="#F4F9E9" />
          </AdvancedMarker>
        ))}

        {selectedHotel && (
          <InfoWindow
            position={{ lat: selectedHotel.latitude, lng: selectedHotel.longitude }}
            onCloseClick={() => setSelectedHotel(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold text-sm">{selectedHotel.name}</h3>
              {selectedHotel.address && (
                <p className="text-xs text-gray-500 mt-1">{selectedHotel.address}</p>
              )}
              <a
                href={`/hotels/${selectedHotel.id}`}
                className="text-xs text-blue-600 mt-1 block"
              >
                Ver detalle →
              </a>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
