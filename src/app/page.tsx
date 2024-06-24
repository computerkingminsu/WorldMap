'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { countriesHex } from '../app/countriesHex';
import { countriesData } from '../app/countriesData';
import { useRouter } from 'next/navigation';
import { useWindowSize } from '@react-hook/window-size/throttled';

export default function GlobeEdit() {
  const router = useRouter();
  const globeRef = useRef<GlobeMethods>();
  const [width, height] = useWindowSize();

  useEffect(() => {
    if (!globeRef?.current) return;
    // globe 자동회전 및 초기 위치 설정
    globeRef.current.controls().autoRotate = true;
    globeRef.current.pointOfView({
      lat: 35.907757,
      lng: 127.766922,
      altitude: 1.75,
    });
  }, []);

  const countriesDataValues = useMemo(() => {
    return Object.values(countriesData);
  }, []);

  const handleLabelClick = useCallback((label: { lat: number; lng: number }) => {
    if (!globeRef?.current) return;
    globeRef.current.controls().autoRotate = false; // Stop rotation
    globeRef.current.pointOfView(
      {
        lat: label.lat,
        lng: label.lng,
        altitude: 1, // Adjust altitude as needed
      },
      1000
    ); // Duration for the zoom transition
  }, []);

  return (
    <Globe
      ref={globeRef}
      width={width > 480 ? width : 480}
      height={height}
      labelsData={countriesDataValues}
      labelText={useCallback(() => '', [])}
      labelDotRadius={useCallback(() => 1.5, [])}
      labelAltitude={useCallback(() => 0.01, [])}
      labelColor={useCallback(() => '#ff7733', [])}
      labelsTransitionDuration={500}
      hexPolygonsData={countriesHex.features}
      hexPolygonResolution={useCallback(() => 3, [])}
      hexPolygonMargin={useCallback(() => 0.4, [])}
      hexPolygonColor={useCallback(() => '#8ceeff', [])}
      backgroundColor={'#222534'}
      showGlobe={false}
      showAtmosphere={false}
      onLabelClick={handleLabelClick}
    />
  );
}
