'use client';

import { Manrope } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const roboto = Manrope({
  weight: '400',
  subsets: ['latin'],
});

export default function LayoutHeader() {
  const pathname = usePathname();
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-16 z-20 bg-[#151825] text-white transition-shadow duration-300 ${
        scroll ? 'shadow-custom' : ''
      }`}
    >
      <div className="flex justify-between items-center h-full px-10">
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
      <style jsx>{`
        .shadow-custom {
          box-shadow:
            0 2px 6px -1px rgba(255, 255, 255, 0.1),
            0 1px 4px -1px rgba(255, 255, 255, 0.06);
        }
      `}</style>
    </div>
  );
}
