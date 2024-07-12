'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MdOutlineAttachMoney } from 'react-icons/md';
import Amadeus from 'amadeus';
import { format, addDays } from 'date-fns';
import CircularProgress from '@mui/material/CircularProgress';

const amadeus = new Amadeus({
  clientId: process.env.NEXT_PUBLIC_AMADEUS_API || '',
  clientSecret: process.env.NEXT_PUBLIC_AMADEUS_SECRET || '',
});

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
    fetchWeather();
    fetchAqi();
    fetchExchangeRate();
    fetchFlights();
  }, []);

  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Madrid&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API}`,
      );
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchAqi = async () => {
    setAqiLoading(true);
    try {
      const response = await axios.get(
        `https://api.waqi.info/feed/madrid/?token=${process.env.NEXT_PUBLIC_WAQI_API}`,
      );
      setAqi(response.data.data);
    } catch (error) {
      console.error('Error fetching AQI data:', error);
    } finally {
      setAqiLoading(false);
    }
  };

  const getAqiIcon = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderated';
    if (aqi <= 150) return 'Unhealthy for sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very unhealthy';
    return 'Hazardous';
  };

  const fetchExchangeRate = async () => {
    setExchangeRateLoading(true);
    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGERATE_API}/latest/USD`,
      );
      const krwRate = response.data.conversion_rates.KRW;
      setExchangeRate(krwRate);
    } catch (error) {
      console.error('Error fetching exchange rate data:', error);
    } finally {
      setExchangeRateLoading(false);
    }
  };

  const fetchFlights = async () => {
    setFlightsLoading(true);
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: 'ICN',
        destinationLocationCode: 'CDG',
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
          destinationLocationCode: 'CDG',
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

  const renderFlights = (flights: FlightData[]) => {
    if (!flights || flights.length === 0)
      return <div className="text-white">Loading...</div>;

    return flights.map(({ date, flights }) => (
      <div key={date} className="mb-4">
        <div className="text-white mb-2">{date}</div>
        <div className="flex flex-wrap">
          {flights
            .filter(
              (flight) =>
                flight.itineraries[0].segments[0].arrival.iataCode === 'CDG',
            )
            .map((flight, index) => (
              <div key={index} className="w-1/4 p-1">
                <div className="text-white">
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

  return (
    <div className="w-screen min-h-screen h-full bg-[#151825]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/6 mt-[9.5vh] px-10 space-y-8">
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
        <div className="w-5/6 mt-[9.5vh] mr-10">
          <div className="text-[#00C395] text-sm font-extralight mb-2">
            Countries
          </div>
          <div className="text-white text-2xl font-bold mb-6">France</div>
          {/* Attractions */}
          <div className="bg-[#1F2232] p-6 rounded-lg mb-6">
            <div className="text-xl mb-4">
              <span className="text-[#00C395] font-bold mr-2">#</span>
              <span className="text-white">Attractions</span>
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
              <div className="text-xl mb-4">
                <span className="text-[#00C395] font-bold mr-2">#</span>
                <span className="text-white">Weather</span>
              </div>
              {weatherLoading ? (
                <div className="flex justify-center items-center h-12">
                  <CircularProgress style={{ color: '#00C395' }} />
                </div>
              ) : weather ? (
                <div className="flex justify-center items-center text-white h-12">
                  <div className="text-lg">{weather.name}</div>
                  <Image
                    src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt="weather icon"
                    width={80}
                    height={80}
                  />
                  <div className="text-lg">{weather.main.temp}°</div>
                </div>
              ) : (
                <div className="text-white h-12">
                  Error loading weather data
                </div>
              )}
            </div>
            {/* AQI */}
            <div className="bg-[#1F2232] p-6 rounded-lg w-[32.5%]">
              <div className="text-xl mb-4">
                <span className="text-[#00C395] font-bold mr-2">#</span>
                <span className="text-white">Air Quality</span>
              </div>
              {aqiLoading ? (
                <div className="flex justify-center items-center h-12">
                  <CircularProgress style={{ color: '#00C395' }} />
                </div>
              ) : aqi ? (
                <div className="flex justify-center items-center text-white h-12">
                  <Image
                    src="/aqi.png"
                    alt="aqi icon"
                    width={60}
                    height={60}
                    className="mb-2 ml-4 mr-4"
                  />
                  <div className="text-lg">
                    {aqi.aqi} : {getAqiIcon(aqi.aqi)}
                  </div>
                </div>
              ) : (
                <div className="text-white h-12">Error loading AQI data</div>
              )}
            </div>
            {/* Exchange Rate */}
            <div className="bg-[#1F2232] p-6 rounded-lg w-[32.5%]">
              <div className="text-xl mb-4">
                <span className="text-[#00C395] font-bold mr-2">#</span>
                <span className="text-white font-medium">Exchange Rate</span>
              </div>
              {exchangeRateLoading ? (
                <div className="flex justify-center items-center h-12">
                  <CircularProgress style={{ color: '#00C395' }} />
                </div>
              ) : exchangeRate ? (
                <div className="flex justify-center items-center text-white h-12">
                  <MdOutlineAttachMoney className="text-4xl text-[#00C395]" />
                  <div className="text-lg">1 USD = {exchangeRate} KRW</div>
                </div>
              ) : (
                <div className="text-white h-12">
                  Error loading exchange rate data
                </div>
              )}
            </div>
          </div>
          {/* Airplane Schedule */}
          <div className="bg-[#1F2232] pt-6 pl-6 pr-6 pb-3 rounded-lg min-h-[14.5rem] ">
            <div className="text-xl mb-4">
              <span className="text-[#00C395] font-bold mr-2">#</span>
              <span className="text-white font-medium">Airplane Schedule</span>
            </div>
            {flightsLoading ? (
              <div className="flex justify-center items-center h-12">
                <CircularProgress style={{ color: '#00C395' }} />
              </div>
            ) : (
              <div className="flex flex-wrap">{renderFlights(flights)}</div>
            )}
            {!showMore && !loading && !flightsLoading && (
              <div className="text-center mt-3">
                <button
                  onClick={fetchAdditionalFlights}
                  className="text-[#00C395]"
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
