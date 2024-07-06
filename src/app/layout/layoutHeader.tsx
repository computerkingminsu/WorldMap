import { Manrope } from 'next/font/google';

const roboto = Manrope({
  weight: '400',
  subsets: ['latin'],
});

export default function LayoutHeader() {
  return (
    <div className="fixed top-0 left-0 w-screen h-14 z-20  text-white">
      <div className="flex justify-between items-center h-full px-8">
        <div className={`text-2xl font-bold cursor-pointer ${roboto.className}`}>GoTrip</div>
        <div className="flex space-x-5">
          <div className=" cursor-pointer">Home</div>
          <div className=" cursor-pointer">Countries</div>
          <div className=" cursor-pointer">Contact</div>
        </div>
      </div>
    </div>
  );
}