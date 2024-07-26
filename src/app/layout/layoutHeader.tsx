'use client';

import { Manrope } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const roboto = Manrope({
  weight: '400',
  subsets: ['latin'],
});

export default function LayoutHeader() {
  const pathname = usePathname();
  const [scroll, setScroll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-screen h-16 z-20 text-white transition-shadow duration-300 ${
        scroll ? 'shadow-custom' : ''
      } ${pathname === '/' ? 'bg-transparent' : 'bg-[#151825]'}`}
    >
      <div className="flex justify-between items-center h-full px-10">
        <Link href="/">
          <div className={`font-bold cursor-pointer ${roboto.className}`}>
            <span className="text-[#00C395] text-2xl">Go</span>
            <span className="text-2xl">Trip</span>
          </div>
        </Link>
        <nav className="hidden sm:flex space-x-5">
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
          <Link href="/planner">
            <div
              className={`cursor-pointer ${
                pathname === '/planner'
                  ? 'text-white border-b-[3px] border-[#00C395] pb-1'
                  : 'text-[#c8c8c8]'
              }`}
            >
              Planner
            </div>
          </Link>
        </nav>
        <button
          className="sm:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <FiX className="text-3xl" />
          ) : (
            <FiMenu className="text-3xl" />
          )}
        </button>
      </div>
      <nav
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen
            ? 'max-h-64 opacity-100 visible'
            : 'max-h-0 opacity-0 invisible'
        } bg-[#151825] px-10 pb-4`}
      >
        <Link href="/">
          <div
            className={`cursor-pointer py-2 text-xl ${
              pathname === '/'
                ? 'text-white border-b-[1.5px] border-[#00C395]'
                : 'text-[#c8c8c8]'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </div>
        </Link>
        <Link href="/countries/france">
          <div
            className={`cursor-pointer py-2 text-xl ${
              pathname.startsWith('/countries')
                ? 'text-white border-b-[1.5px] border-[#00C395]'
                : 'text-[#c8c8c8]'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Countries
          </div>
        </Link>
        <Link href="/planner">
          <div
            className={`cursor-pointer py-2 text-xl ${
              pathname === '/planner'
                ? 'text-white border-b-[1.5px] border-[#00C395]'
                : 'text-[#c8c8c8]'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Planner
          </div>
        </Link>
      </nav>
      <style jsx>{`
        .shadow-custom {
          box-shadow:
            0 2px 6px -1px rgba(255, 255, 255, 0.1),
            0 1px 4px -1px rgba(255, 255, 255, 0.06);
        }

        .transition-max-height {
          transition: max-height 0.5s ease-in-out;
        }
      `}</style>
    </header>
  );
}
