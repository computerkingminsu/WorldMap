'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { countriesHex } from '../app/countriesHex';
import { countriesData } from '../app/countriesData';
import { useRouter } from 'next/navigation';
import { useWindowSize } from '@react-hook/window-size/throttled';
import { IoMicOutline } from 'react-icons/io5';
import { LuSend } from 'react-icons/lu';
import Flag from 'react-world-flags';

interface CountryLabel {
  lat: number;
  lng: number;
  country: string;
  info: string;
  name: string;
  code: string;
}

export default function Main() {
  const router = useRouter();
  const globeRef = useRef<GlobeMethods>();
  const [width, height] = useWindowSize();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [labelToShow, setLabelToShow] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');

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

  const handleLabelClick = useCallback((label: object) => {
    const countryLabel = label as CountryLabel;
    if (!globeRef?.current) return;
    globeRef.current.controls().autoRotate = false;
    console.log(countryLabel);
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
  }, []);

  const handleBackClick = useCallback(() => {
    if (!globeRef?.current) return;
    globeRef.current.controls().autoRotate = true;
    globeRef.current.pointOfView(
      {
        lat: 35.907757,
        lng: 127.766922,
        altitude: 2,
      },
      1000,
    );
    setLabelToShow(null);
    setSelectedLabel(null);
    setDescription(''); // 설명 초기화
  }, []);

  const handleSendClick = async () => {
    const prompt = inputValue;
    setInputValue('');
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

      // 결과값에서 나라이름과 설명 추출
      const [countryName, countryDescription] = data.result
        .split(':')
        .map((str: string) => str.trim());

      // 결과값을 기반으로 줌인
      const targetCountry = Object.values(countriesData).find(
        (country) => country.name === countryName,
      );

      if (targetCountry) {
        handleLabelClick(targetCountry as CountryLabel);
        setDescription(countryDescription); // 설명 저장
      }
    } catch (error) {
      console.error('OpenAI API 요청 중 오류 발생:', error);
    }
  };

  const recordSend = async (prompt: string) => {
    setInputValue('');
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

      // 결과값에서 나라이름과 설명 추출
      const [countryName, countryDescription] = data.result
        .split(':')
        .map((str: string) => str.trim());

      // 결과값을 기반으로 줌인
      const targetCountry = Object.values(countriesData).find(
        (country) => country.name === countryName,
      );

      if (targetCountry) {
        handleLabelClick(targetCountry as CountryLabel);
        setDescription(countryDescription); // 설명 저장
      }
    } catch (error) {
      console.error('OpenAI API 요청 중 오류 발생:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendClick();
    }
  };

  const startListening = () => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      alert('음성인식 기능을 지원하지 않는 브라우저 입니다.');
      return;
    }

    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR'; // 언어 설정
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Listening...');
    };

    recognition.onresult = async (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      console.log('Transcript:', transcript);
      setInputValue(transcript); // 녹음된 텍스트를 inputValue에 저장
      setIsRecording(false);
      await recordSend(transcript);
    };

    recognition.onerror = () => {
      alert('마이크 권한이 필요합니다.');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleLabelHover = useCallback(
    (label: object | null) => {
      const countryLabel = label as CountryLabel;
      if (!globeRef?.current) return;
      if (countryLabel) {
        globeRef.current.controls().autoRotate = false;
      } else if (!selectedLabel) {
        globeRef.current.controls().autoRotate = true;
      }
    },
    [selectedLabel],
  );

  return (
    <>
      <div>
        {/* Globe */}
        <Globe
          ref={globeRef}
          width={width > 480 ? width : 480}
          height={height}
          labelsData={countriesDataValues}
          labelText={(d: any) => d.name}
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

        {/* 라벨 클릭 시 보여 줌 */}
        {labelToShow && (
          <div className="absolute top-[23%] left-1/2 transform -translate-x-1/2 bg-white rounded-lg z-10 flex flex-col items-center p-5">
            {
              <Flag
                code={
                  Object.values(countriesData).find(
                    (country) => country.name === selectedLabel,
                  )?.code
                }
                className="mb-4 mt-1"
                style={{ width: '100px', height: '60px', objectFit: 'cover' }}
              />
            }
            <h3 className="text-lg font-semibold">{selectedLabel}</h3>
            {description ? (
              <p className="text-center px-4">{description}</p>
            ) : (
              <p className="text-center px-4">
                {
                  Object.values(countriesData).find(
                    (country) => country.name === selectedLabel,
                  )?.info
                }
              </p>
            )}
            <div className="mt-4 w-full flex justify-between items-center ">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                onClick={handleBackClick}
              >
                Back
              </button>
              <span className="text-blue-500 cursor-pointer">
                More Details &gt;
              </span>
            </div>
          </div>
        )}
        {/* input */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-lg ">
          <div className="flex items-center bg-gray-700 text-white rounded-full p-2">
            <input
              type="text"
              className="flex-grow bg-transparent border-none outline-none text-white placeholder-gray-400 px-4"
              placeholder="당신의 예산, 일정, 취향 등을 입력해주세요."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center space-x-2 mr-4">
              <IoMicOutline
                size={30}
                className="cursor-pointer text-gray-400"
                onClick={startListening}
              />
              <LuSend
                size={25}
                className="cursor-pointer text-gray-400"
                onClick={handleSendClick}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
