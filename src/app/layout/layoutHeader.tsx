'use client';

import { Manrope } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';

const roboto = Manrope({
  weight: '400',
  subsets: ['latin'],
});

export default function LayoutHeader() {
  const pathname = usePathname();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Madrid&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API}`,
      );
      setWeather(response.data);
      console.log('Weather data:', response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-14 z-20 text-white">
      <div className="flex justify-between items-center h-full px-10 pt-4">
        <div
          className={`text-2xl font-bold cursor-pointer ${roboto.className}`}
        >
          <span className="text-[#00C395]">Go</span>
          <span>Trip</span>
        </div>
        <div className="flex space-x-5">
          <Link href="/">
            <div
              className={`cursor-pointer ${
                pathname === '/'
                  ? 'text-white border-b-[3px] border-[#00C395] pb-1'
                  : 'text-[#c8c8c8]'
              }`}
            >
              Home
            </div>
          </Link>
          <Link href="/countries/france">
            <div
              className={`cursor-pointer ${
                pathname.startsWith('/countries')
                  ? 'text-white border-b-[3px] border-[#00C395] pb-1'
                  : 'text-[#c8c8c8]'
              }`}
            >
              Countries
            </div>
          </Link>
          <Link href="/contact">
            <div
              className={`cursor-pointer ${
                pathname === '/contact'
                  ? 'text-white border-b-[3px] border-[#00C395] pb-1'
                  : 'text-[#c8c8c8]'
              }`}
            >
              Contact
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
