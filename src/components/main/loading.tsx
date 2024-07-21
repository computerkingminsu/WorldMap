import React from 'react';
import { Manrope } from 'next/font/google';

const roboto = Manrope({
  weight: '400',
  subsets: ['latin'],
});

export default function LoadingSpinner() {
  return (
    <div
      className={`${roboto.className} flex items-center justify-center h-screen bg-[#151825]`}
    >
      <span className="text-[#00c395] text-4xl">Go</span>
      <span className="text-white text-4xl">Trip</span>
    </div>
  );
}
