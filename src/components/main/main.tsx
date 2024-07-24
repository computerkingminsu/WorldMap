'use client';
import React, { useEffect, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { countriesHex } from '../../app/countriesHex';
import { countriesData } from '../../app/countriesData';
import { useWindowSize } from '@react-hook/window-size/throttled';
import { IoMicOutline } from 'react-icons/io5';
import { LuSend } from 'react-icons/lu';
import Flag from 'react-world-flags';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

interface CountryLabel {
  lat: number;
  lng: number;
  country?: string;
  info?: string;
  name: string;
  code: string;
}

export default function Main() {
  const globeRef = useRef<GlobeMethods>();
  const [width, height] = useWindowSize();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [labelToShow, setLabelToShow] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!globeRef?.current) return;
    globeRef.current.controls().autoRotate = true;
    globeRef.current.pointOfView({
      lat: 20,
      lng: 138,
      altitude: 2,
    });
  }, []);

  const countriesDataValues = Object.values(countriesData);

  const handleLabelClick = (label: object) => {
    const countryLabel = label as CountryLabel;
    if (!globeRef?.current) return;
    globeRef.current.controls().autoRotate = false;
    globeRef.current.pointOfView(
      {
        lat: countryLabel.lat,
        lng: countryLabel.lng,
        altitude: 1,
      },
      1000,
    );
    setSelectedLabel(countryLabel.name);
    setDescription('');
    setTimeout(() => {
      setLabelToShow(countryLabel.name);
    }, 1000);
  };

  const handleBackClick = () => {
    if (!globeRef?.current) return;

    const selectedCountry =
      countriesData[selectedLabel?.toLowerCase() as keyof typeof countriesData];

    if (selectedCountry) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.pointOfView(
        {
          lat: selectedCountry.lat,
          lng: selectedCountry.lng,
          altitude: 2,
        },
        1000,
      );
      setLabelToShow(null);
      setSelectedLabel(null);
      setDescription('');
    }
  };
  const [showAlert, setShowAlert] = useState(false);

  const handleSendClick = async (prompt: string) => {
    if (!prompt.trim()) {
      setShowAlert(true);
      return;
    }
    setInputValue('');
    setLoading(true);
    try {
      const response = await fetch('/api/main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      const [countryName, countryDescription] = data.result
        .split(':')
        .map((str: string) => str.trim());

      const targetCountry = Object.values(countriesData).find(
        (country) => country.name === countryName,
      );

      if (targetCountry) {
        handleLabelClick(targetCountry as CountryLabel);
        setDescription(countryDescription);
      }
    } catch (error) {
      console.error('OpenAI API 요청 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendClick(inputValue);
    }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;

    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      alert('음성인식 기능을 지원하지 않는 브라우저 입니다.');
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Listening...');
    };

    recognition.onresult = async (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      console.log('Transcript:', transcript);
      setInputValue(transcript);
      setIsRecording(false);
      await handleSendClick(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleLabelHover = (label: object | null) => {
    const countryLabel = label as CountryLabel;
    if (!globeRef?.current) return;
    if (countryLabel) {
      globeRef.current.controls().autoRotate = false;
    } else if (!selectedLabel) {
      globeRef.current.controls().autoRotate = true;
    }
  };

  return (
    <>
      <main className="w-screen h-screen bg-[#151825] relative">
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          labelsData={countriesDataValues}
          labelText={(d: any) => d.name}
          labelSize={1.5}
          labelDotRadius={() => 1.8}
          labelAltitude={() => 0.01}
          labelColor={() => '#ffd000'}
          labelsTransitionDuration={500}
          hexPolygonsData={countriesHex.features}
          hexPolygonResolution={() => 3}
          hexPolygonMargin={() => 0.4}
          hexPolygonColor={() => '#2e7a7c'}
          backgroundColor={'#151825'}
          showGlobe={false}
          showAtmosphere={false}
          onLabelClick={handleLabelClick}
          onLabelHover={handleLabelHover}
        />

        {labelToShow && (
          <section className="absolute top-[23%] left-1/2 transform -translate-x-1/2 bg-[#1F2232] rounded-lg z-10 flex flex-col items-center p-5">
            <Flag
              code={
                Object.values(countriesData).find(
                  (country) => country.name === selectedLabel,
                )?.code
              }
              className="mb-4 mt-1"
              style={{ width: '100px', height: '60px', objectFit: 'cover' }}
            />
            <h3 className="text-lg text-white">{selectedLabel}</h3>
            <p className="text-center px-4 text-white">
              {description ||
                Object.values(countriesData).find(
                  (country) => country.name === selectedLabel,
                )?.info}
            </p>
            <nav className="mt-4 w-full flex justify-between items-center px-2">
              <button
                className="bg-[#00c395] text-white px-3 py-1 rounded mr-2 text-sm"
                onClick={handleBackClick}
              >
                뒤로
              </button>
              {selectedLabel && (
                <Link href={`/countries/${selectedLabel.toLowerCase()}`}>
                  <span className="text-[#00c395] cursor-pointer text-sm">
                    자세히 알아보기 &gt;
                  </span>
                </Link>
              )}
            </nav>
          </section>
        )}
        <footer className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-lg">
          <div className="flex items-center bg-[#1F2232] rounded-full p-2 text-base">
            <input
              type="text"
              className="flex-grow bg-transparent border-none outline-none text-[#b8b8b8] placeholder-[#888888] px-4"
              placeholder="당신의 예산, 일정, 취향 등을 입력해주세요."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center space-x-2 mr-4">
              <IoMicOutline
                size={30}
                className="cursor-pointer text-[#b8b8b8]"
                onClick={startListening}
              />
              <LuSend
                size={25}
                className="cursor-pointer text-[#b8b8b8]"
                onClick={() => handleSendClick(inputValue)}
              />
            </div>
          </div>
        </footer>

        {(loading || isRecording) && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col items-center justify-center z-20">
            <CircularProgress style={{ color: '#00C395' }} />
            <span className="text-white mt-4 text-center">
              {isRecording
                ? '녹음중입니다.'
                : '당신에게 알맞는 나라를 찾고있어요!'}
            </span>
          </div>
        )}
      </main>
      <Snackbar
        open={showAlert}
        autoHideDuration={2000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity="warning"
          sx={{
            backgroundColor: '#0f121d',
            color: 'white',
            borderRadius: '10px',
          }}
        >
          정보를 입력해주세요.
        </Alert>
      </Snackbar>
    </>
  );
}
