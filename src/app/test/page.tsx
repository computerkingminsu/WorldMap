'use client';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';

export default function a() {
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    if (animating) {
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 500); // 애니메이션 지속 시간과 동일하게 설정

      return () => clearTimeout(timer);
    }
  }, [animating]);
  return (
    <div
      className={`flex flex-col items-center justify-center w-screen h-screen bg-[#151825] ${animating ? 'slide-in-left' : ''}`}
    >
      <CircularProgress style={{ color: '#00C395' }} />
      <span className="text-white mt-4">
        여행 계획을 생성중입니다. 잠시만 기다려 주세요.
      </span>
    </div>
  );
}
