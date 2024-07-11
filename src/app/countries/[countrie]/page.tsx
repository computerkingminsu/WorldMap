'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MdOutlineAttachMoney } from 'react-icons/md';

export default function Countries() {
  const pathname = usePathname();

  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    fetchWeather();
    fetchAqi();
    fetchExchangeRate();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Madrid&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API}`,
      );
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const fetchAqi = async () => {
    try {
      const response = await axios.get(
        `https://api.waqi.info/feed/madrid/?token=${process.env.NEXT_PUBLIC_WAQI_API}`,
      );
      setAqi(response.data.data);
    } catch (error) {
      console.error('Error fetching AQI data:', error);
    }
  };

  const getAqiIcon = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderated';
    if (aqi <= 150) return 'unhealthy for sensitive.';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very unhealthy';
    return '/path/to/hazardous';
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGERATE_API}/latest/USD`,
      );
      const krwRate = response.data.conversion_rates.KRW;
      console.log(response.data);
      setExchangeRate(krwRate);
      console.log(krwRate);
    } catch (error) {
      console.error('Error fetching exchange rate data:', error);
    }
  };

  return (
    <div className="w-screen  min-h-screen h-full  bg-[#151825]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/6 mt-[10vh] px-10 space-y-8">
          <div
            className={
              pathname === '/countries/france'
                ? 'text-[#00C395]'
                : 'text-[#d8d8d8]'
            }
          >
            France
          </div>
          <div
            className={
              pathname === '/countries/japan'
                ? 'text-[#00C395]'
                : 'text-[#d8d8d8]'
            }
          >
            Japan
          </div>
          <div
            className={
              pathname === '/countries/usa'
                ? 'text-[#00C395]'
                : 'text-[#d8d8d8]'
            }
          >
            USA
          </div>
          <div
            className={
              pathname === '/countries/unitedkingdom'
                ? 'text-[#00C395]'
                : 'text-[#d8d8d8]'
            }
          >
            United Kingdom
          </div>
        </div>
        {/* Main Content */}
        <div className="w-5/6  mt-[10vh] mr-10 ">
          <div className="text-[#00C395] text-sm font-extralight mb-2">
            Countries
          </div>
          <div className="text-white text-2xl font-bold mb-6">France</div>
          {/* Attractions */}
          <div className="bg-[#1F2232] p-6 rounded-lg mb-6">
            <div className="text-xl  mb-4">
              <span className="text-[#00C395] font-bold mr-2">#</span>
              <span className="text-white ">Attractions</span>
            </div>
            <div className="flex">
              <div className="min-w-[25%] h-52 relative">
                <Image
                  src="/tower.jpg"
                  alt="Eiffel Tower"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <div className="flex flex-col ml-9">
                <div className="text-white text-lg mb-3">Eiffel Tower</div>
                <div className="text-white w-[80%]">
                  에펠탑은 프랑스 파리의 상징적 건축물로, 1889년에 프랑스 혁명
                  100주년을 맞이하여 파리 만국 박람회를 개최하였는데 이 박람회를
                  상징할만한 기념물로 에펠 탑을 건축하였다. 박람회가 열린 마르스
                  광장에 출입 관문에 위치해있다.
                </div>
              </div>
            </div>
          </div>
          {/* Weather, AQI, Exchange Rate */}
          <div className="flex justify-between mb-6">
            {/* Weather */}
            <div className="bg-[#1F2232] p-6 rounded-lg w-[32.5%]">
              <div className="text-xl mb-4 ">
                <span className="text-[#00C395] font-bold mr-2">#</span>
                <span className="text-white ">Weather</span>
              </div>
              {weather ? (
                <div className="flex justify-center items-center  text-white h-12">
                  <div className="text-xl">{weather.name}</div>
                  <Image
                    src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt="weather icon"
                    width={80}
                    height={80}
                  />

                  <div className="text-2xl">{weather.main.temp}°</div>
                </div>
              ) : (
                <div className="text-white  h-12">Loading...</div>
              )}
            </div>
            {/* AQI */}
            <div className="bg-[#1F2232] p-6 rounded-lg w-[32.5%] ">
              <div className="text-xl mb-4">
                <span className="text-[#00C395] font-bold mr-2">#</span>
                <span className="text-white ">Air Quality</span>
              </div>
              {aqi ? (
                <div className="flex justify-center items-center  text-white  h-12">
                  <Image
                    src={'/aqi.png'}
                    alt="aqi icon"
                    width={60}
                    height={60}
                    className="mb-2 ml-4 mr-4"
                  />
                  <div className="text-xl">
                    {aqi.aqi} : {getAqiIcon(aqi.aqi)}
                  </div>
                </div>
              ) : (
                <div className="text-white  h-12">Loading...</div>
              )}
            </div>
            {/* Exchange Rate */}
            <div className="bg-[#1F2232] p-6 rounded-lg w-[32.5%]">
              <div className="text-xl  mb-4">
                <span className="text-[#00C395] font-bold mr-2">#</span>
                <span className="text-white font-medium">Exchange Rate</span>
              </div>
              {exchangeRate ? (
                <div className="flex justify-center items-center  text-white  h-12">
                  <MdOutlineAttachMoney className="text-4xl text-[#00C395]" />
                  <div className="">1 USD = {exchangeRate} KRW</div>
                </div>
              ) : (
                <div className="text-white  h-12">Loading...</div>
              )}
            </div>
          </div>
          {/* Airplane Schedule */}
          <div className="bg-[#1F2232] p-6 rounded-lg">
            <div className="text-xl  mb-4">
              <span className="text-[#00C395] font-bold mr-2">#</span>
              <span className="text-white font-medium">Airplane Schedule</span>
            </div>
            <ul className="text-white">
              <li>* 서울 → 부산 12:00</li>
              <li>* 서울 → 부산 12:00</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
