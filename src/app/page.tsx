'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { countriesHex } from '../app/countriesHex';
import { countriesData } from '../app/countriesData';
import { useRouter } from 'next/navigation';
import { useWindowSize } from '@react-hook/window-size/throttled';
import { IoMicOutline } from 'react-icons/io5';
import { LuSend } from 'react-icons/lu';

export default function GlobeEdit() {
  const router = useRouter();
  const globeRef = useRef<GlobeMethods>();
  const [width, height] = useWindowSize();
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [labelToShow, setLabelToShow] = useState(null);

  useEffect(() => {
    if (!globeRef?.current) return;
    // globe 자동회전 및 초기 위치 설정
    globeRef.current.controls().autoRotate = true;
    globeRef.current.pointOfView({
      lat: 35.907757,
      lng: 127.766922,
      altitude: 2,
    });
  }, []);

  const countriesDataValues = useMemo(() => {
    return Object.values(countriesData);
  }, []);

  const handleLabelClick = useCallback(async (label: { lat: number; lng: number; country: string; info: string }) => {
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
    setSelectedLabel(label.name);
    setTimeout(() => {
      setLabelToShow(label.name);
    }, 1000); // Show the label after the zoom transition
    // OpenAI API 요청 부분
    const prompt = '사용자의 위치는 서울입니다. 예산은 100만원입니다. 추천해 주세요.';

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log('리턴값:', data.result);
    } catch (error) {
      console.error('OpenAI API 요청 중 오류 발생:', error);
    }
  }, []);

  const handleBackClick = useCallback(() => {
    if (!globeRef?.current) return;
    globeRef.current.controls().autoRotate = true; // Resume rotation
    globeRef.current.pointOfView(
      {
        lat: 35.907757,
        lng: 127.766922,
        altitude: 2,
      },
      1000
    ); // Transition back to the initial view
    setLabelToShow(null);
    setSelectedLabel(null);
  }, []);

  const handleLabelHover = useCallback(
    (label: { lat: number; lng: number } | null) => {
      if (!globeRef?.current) return;
      if (label) {
        globeRef.current.controls().autoRotate = false; // Stop rotation on hover
      } else if (!selectedLabel) {
        globeRef.current.controls().autoRotate = true; // Resume rotation if no label is selected
      }
    },
    [selectedLabel]
  );

  return (
    <>
      <div>
        <Globe
          ref={globeRef}
          width={width > 480 ? width : 480}
          height={height}
          labelsData={countriesDataValues}
          labelText={(d) => d.name}
          labelSize={1.5} // Increase label size
          labelDotRadius={useCallback(() => 1.8, [])}
          labelAltitude={useCallback(() => 0.01, [])}
          labelColor={useCallback(() => '#ffd000', [])}
          labelsTransitionDuration={500}
          hexPolygonsData={countriesHex.features}
          hexPolygonResolution={useCallback(() => 3, [])}
          hexPolygonMargin={useCallback(() => 0.4, [])}
          hexPolygonColor={useCallback(() => '#2e7a7c', [])}
          backgroundColor={'#222534'}
          showGlobe={false}
          showAtmosphere={false}
          onLabelClick={handleLabelClick}
          onLabelHover={handleLabelHover}
        />
        {labelToShow && (
          <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 bg-white p-5 rounded-lg z-10">
            <h3>{selectedLabel}</h3>
            <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded" onClick={handleBackClick}>
              Back
            </button>
          </div>
        )}

        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-lg ">
          <div className="flex items-center bg-gray-700 text-white rounded-full p-2">
            <input
              type="text"
              className="flex-grow bg-transparent border-none outline-none text-white placeholder-gray-400 px-4"
              placeholder="당신의 예산, 일정, 취향 등을 입력해주세요."
            />
            <div className="flex items-center space-x-2 mr-4">
              <IoMicOutline size={30} className="cursor-pointer text-gray-400" />
              <LuSend size={25} className="cursor-pointer text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
