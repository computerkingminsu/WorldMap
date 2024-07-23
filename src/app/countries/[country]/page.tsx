'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MdOutlineAttachMoney } from 'react-icons/md';
import Amadeus from 'amadeus';
import { format, addDays } from 'date-fns';
import CircularProgress from '@mui/material/CircularProgress';
import { countriesData } from '@/app/countriesData';
import Link from 'next/link';
import { GrAttraction } from 'react-icons/gr';
import { PiAirplaneTakeoff } from 'react-icons/pi';
import { TiWeatherWindyCloudy, TiWeatherPartlySunny } from 'react-icons/ti';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const amadeus = new Amadeus({
  clientId: process.env.NEXT_PUBLIC_AMADEUS_API || '',
  clientSecret: process.env.NEXT_PUBLIC_AMADEUS_SECRET || '',
});

interface Attraction {
  image: string;
  name: string;
  description: string;
}

interface Weather {
  name: string;
  main: {
    temp: number;
  };
  weather: {
    icon: string;
  }[];
}

interface AQI {
  aqi: number;
}

interface Flight {
  itineraries: {
    segments: {
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
      };
    }[];
  }[];
}

interface FlightData {
  date: string;
  flights: Flight[];
}

export default function Countries() {
  const pathname = usePathname();
  const countryCode = pathname.split('/').pop();
  //@ts-ignore
  const countryData = countriesData[countryCode];
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [aqi, setAqi] = useState<AQI | null>(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateLoading, setExchangeRateLoading] = useState(true);
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(true);
  const [additionalFlights, setAdditionalFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (countryData) {
      fetchWeather();
      fetchAqi();
      fetchExchangeRate();
      fetchFlights();
    }
  }, [countryData]);

  // 캐러셀 세팅
  const settings = {
    dots: true,
    infinite: true,
    speed: 900,
    slidesToShow: 0.999,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  // 날씨 api 호출
  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${countryData.capital}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API}`,
      );
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  // AQI api 호출
  const fetchAqi = async () => {
    setAqiLoading(true);
    try {
      const response = await axios.get(
        `https://api.waqi.info/feed/${countryData.capital}/?token=${process.env.NEXT_PUBLIC_WAQI_API}`,
      );
      setAqi(response.data.data);
    } catch (error) {
      console.error('Error fetching AQI data:', error);
    } finally {
      setAqiLoading(false);
    }
  };

  // AQI 아이콘 설정
  const getAqiIcon = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for sensitive groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // 환율 api 호출
  const fetchExchangeRate = async () => {
    setExchangeRateLoading(true);
    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGERATE_API}/latest/${countryData.money}`,
      );
      const krwRate = response.data.conversion_rates.KRW;
      setExchangeRate(krwRate);
    } catch (error) {
      console.error('Error fetching exchange rate data:', error);
    } finally {
      setExchangeRateLoading(false);
    }
  };

  // 항공편 api 호출
  const fetchFlights = async () => {
    setFlightsLoading(true);
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: 'ICN',
        destinationLocationCode: countryData.airport,
        departureDate: tomorrow,
        adults: '1',
      });
      setFlights([{ date: tomorrow, flights: response.data }]);
    } catch (error) {
      console.error('Error fetching flight data:', error);
    } finally {
      setFlightsLoading(false);
    }
  };

  // 추가 항공편 api 호출
  const fetchAdditionalFlights = async () => {
    setLoading(true);
    const dates = [
      format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    ];

    const allAdditionalFlights: FlightData[] = [];

    for (const date of dates) {
      try {
        const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: 'ICN',
          destinationLocationCode: countryData.airport,
          departureDate: date,
          adults: '1',
        });
        allAdditionalFlights.push({ date, flights: response.data });
      } catch (error) {
        console.error('Error fetching additional flight data:', error);
      }
    }

    setAdditionalFlights(allAdditionalFlights);
    setLoading(false);
    setShowMore(true);
  };

  // 항공편 렌더링
  const renderFlights = (flights: FlightData[]) => {
    if (!flights || flights.length === 0)
      return <div className="text-white">There is no flight schedule</div>;

    return flights.map(({ date, flights }) => (
      <div key={date} className="mb-4">
        <div className="text-white mb-2 text-base">{date}</div>
        <div className="flex flex-wrap">
          {flights
            .filter(
              (flight) =>
                flight.itineraries[0].segments[0].arrival.iataCode ===
                countryData.airport,
            )
            .map((flight, index) => (
              <div key={index} className="w-1/4 p-1">
                <div className="text-white text-base">
                  * {flight.itineraries[0].segments[0].departure.iataCode} →{' '}
                  {flight.itineraries[0].segments[0].arrival.iataCode} at{' '}
                  {flight.itineraries[0].segments[0].departure.at}
                </div>
              </div>
            ))}
        </div>
      </div>
    ));
  };

  console.log(countryData.attractions);
  return (
    <div className="w-screen min-h-screen h-full bg-[#151825]">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden sm:inline-block w-1/6 mt-[9.5vh] px-10 space-y-8">
          {Object.values(countriesData).map((country) => (
            <Link
              key={country.code}
              href={`/countries/${country.lowername}`}
              className="block"
            >
              <div
                className={
                  pathname === `/countries/${country.lowername}`
                    ? 'text-[#00C395]'
                    : 'text-[#d8d8d8]'
                }
              >
                {country.name}
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="w-full pl-6 pr-6 sm:w-5/6 mt-[7vh] sm:mt-[9.5vh] sm:mr-10">
          {/* 모바일 사이드바 */}
          <div className="sm:hidden mb-9 overflow-x-auto no-scrollbar">
            <div className="flex space-x-4">
              {Object.values(countriesData).map((country) => (
                <Link
                  key={country.code}
                  href={`/countries/${country.lowername}`}
                >
                  <div
                    className={`text-base mr-5 ${
                      pathname === `/countries/${country.lowername}`
                        ? 'text-[#00C395]'
                        : 'text-[#d8d8d8]'
                    }`}
                  >
                    {country.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-[#00C395] text-sm font-extralight mb-2">
            Country
          </div>
          <div className="text-white text-2xl font-bold mb-6">
            {countryData.name}
          </div>
          {/* Attractions */}
          <div className="bg-[#1F2232] p-6 rounded-lg mb-6 text-base">
            <div className="text-xl mb-4 flex items-center">
              <GrAttraction className="text-[#00C395] mr-2 text-2xl" />
              <span className="text-white text-base">Attractions</span>
            </div>
            <Slider {...settings} className="w-full h-full custom-slider">
              {countryData.attractions.map(
                (attraction: Attraction, index: number) => (
                  <div key={index}>
                    <div className="flex text-white">
                      <div className="min-w-[40%] max-w-[40%] sm:min-w-[30%] sm:max-w-[30%] h-52 relative">
                        <Image
                          src={attraction.image}
                          alt={attraction.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                          placeholder="blur"
                          blurDataURL="data:image/webp;base64,UklGRhYAAABXRUJQVlA4IC4AAACwAQCdASoCAAIALmk0mk0iIiIiIgBoSywAAmEAAKADAAQAA3AA/vuUAAA="
                        />
                      </div>
                      <div className="flex flex-col ml-9">
                        <div className="text-lg mb-3">{attraction.name}</div>
                        <div className="text-base  2xl:w-[80%]">
                          {attraction.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </Slider>
          </div>
          {/* Weather, AQI, Exchange Rate */}
          <div className="flex flex-col sm:flex-row justify-between mb-6">
            {/* Weather */}
            <div className="bg-[#1F2232] p-6 rounded-lg w-full sm:w-[32.5%] mb-6 sm:mb-0">
              <div className="text-xl mb-4 flex items-center">
                <TiWeatherPartlySunny className="text-[#00C395] mr-2 text-2xl" />
                <span className="text-white text-base">Weather</span>
              </div>
              {weatherLoading ? (
                <div className="flex justify-center items-center h-12">
                  <CircularProgress style={{ color: '#00C395' }} />
                </div>
              ) : weather ? (
                <div className="flex justify-center items-center text-white h-12">
                  <div className="text-lg">{weather.name}</div>
                  <div className="relative w-20 h-20">
                    <Image
                      src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                      alt="weather icon"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="text-lg">{weather.main.temp}°</div>
                </div>
              ) : (
                <div className="text-white h-12 text-base">
                  Error loading weather data
                </div>
              )}
            </div>
            {/* AQI */}
            <div className="bg-[#1F2232] p-6 rounded-lg  w-full sm:w-[32.5%] mb-6 sm:mb-0">
              <div className="text-xl mb-4 flex items-center">
                <TiWeatherWindyCloudy className="text-[#00C395] mr-2 text-2xl" />
                <span className="text-white text-base">Air Quality</span>
              </div>
              {aqiLoading ? (
                <div className="flex justify-center items-center h-12">
                  <CircularProgress style={{ color: '#00C395' }} />
                </div>
              ) : aqi ? (
                <div className="flex justify-center items-center text-white h-12 ">
                  <div className="relative w-14 h-14 mr-4">
                    <Image
                      src="/countries/aqi.png"
                      alt="aqi icon"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="relative z-10 text-lg">
                    {aqi.aqi} : {getAqiIcon(aqi.aqi)}
                  </div>
                </div>
              ) : (
                <div className="text-white h-12 text-base">
                  Error loading AQI data
                </div>
              )}
            </div>
            {/* Exchange Rate */}
            <div className="bg-[#1F2232] p-6 rounded-lg  w-full sm:w-[32.5%]">
              <div className="text-xl mb-4 flex items-center">
                <FaRegMoneyBillAlt className="text-[#00C395] mr-2 text-2xl" />
                <span className="text-white text-base">Exchange Rate</span>
              </div>
              {exchangeRateLoading ? (
                <div className="flex justify-center items-center h-12 ">
                  <CircularProgress style={{ color: '#00C395' }} />
                </div>
              ) : exchangeRate ? (
                <div className="flex justify-center items-center text-white h-12">
                  <MdOutlineAttachMoney className="text-4xl text-[#00C395]" />
                  <div className="text-lg">
                    1 {countryData.money} = {exchangeRate} KRW
                  </div>
                </div>
              ) : (
                <div className="text-white h-12">
                  Error loading exchange rate data
                </div>
              )}
            </div>
          </div>
          {/* Airplane Schedule */}
          <div className="bg-[#1F2232] pt-6 pl-6 pr-6 pb-3 rounded-lg min-h-[14.5rem]">
            <div className="text-xl mb-4 flex items-center">
              <PiAirplaneTakeoff className="text-[#00C395] mr-2 text-2xl" />
              <span className="text-white text-base">Airplane Schedule</span>
            </div>
            {flightsLoading ? (
              <div className="flex justify-center items-center h-12 ">
                <CircularProgress style={{ color: '#00C395' }} />
              </div>
            ) : (
              <div className="flex flex-wrap text-base">
                {renderFlights(flights)}
              </div>
            )}
            {!showMore && !loading && !flightsLoading && (
              <div className="text-center mt-3">
                <button
                  onClick={fetchAdditionalFlights}
                  className="text-[#00C395] text-base"
                >
                  더 알아보기
                </button>
              </div>
            )}
            {loading && (
              <div className="text-center">
                <CircularProgress style={{ color: '#00C395' }} />
              </div>
            )}
            {showMore && (
              <div className="flex flex-wrap">
                {renderFlights(additionalFlights)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
