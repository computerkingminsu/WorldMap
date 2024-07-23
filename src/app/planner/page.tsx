'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/planner/datePicker';
import { DateRange } from 'react-day-picker';
import CircularProgress from '@mui/material/CircularProgress';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface InputValues {
  age: string;
  gender: string;
  budget: string;
  country: string;
}

interface Errors {
  age?: string;
  gender?: string;
  budget?: string;
  duration?: string;
  country?: string;
}

export default function Contact() {
  const [inputValues, setInputValues] = useState<InputValues>({
    age: '',
    gender: '',
    budget: '',
    country: '',
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();
  const countries = [
    '프랑스',
    '이탈리아',
    '싱가포르',
    '스페인',
    '튀르키예',
    '오스트레일리아',
    '일본',
    '베트남',
    '태국',
    '필리핀',
    '중국',
    '브라질',
    '아르헨티나',
    '페루',
    '칠레',
    '콜롬비아',
  ];
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleSendClick = async () => {
    const { age, gender, budget, country } = inputValues;
    const { from, to } = dateRange || {};

    const newErrors: Errors = {};
    if (!age) newErrors.age = '나이 입력은 필수입니다.';
    if (!gender) newErrors.gender = '성별 입력은 필수입니다.';
    if (!budget) newErrors.budget = '예산 입력은 필수입니다.';
    if (!from || !to) newErrors.duration = '일정 선택은 필수입니다.';
    if (!country) newErrors.country = '나라 선택은 필수입니다.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }
    setLoading(true);
    const duration = `${from?.toLocaleDateString()} - ${to?.toLocaleDateString()}`;
    const prompt = `나이: ${age}, 성별: ${gender}, 예산: ${budget}, 일정: ${duration}, 나라: ${country}`;

    try {
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('OpenAI API 요청 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  // 되돌아가기 눌렀을때 사용
  const resetForm = () => {
    setInputValues({
      age: '',
      gender: '',
      budget: '',
      country: '',
    });
    setDateRange(undefined);
    setErrors({});
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#151825]">
        <CircularProgress style={{ color: '#00C395' }} />
        <span className="text-white mt-4 text-center text-2xl">
          여행 계획을 생성중입니다. 잠시만 기다려 주세요.
          <br />약 20초 소요됩니다.
        </span>
      </div>
    );
  }

  if (result) {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(result);
      toast({
        title: 'Enjoy your Travel !',
        description: '여행 계획이 복사되었습니다.',
        action: <ToastAction altText="close">close</ToastAction>,
      });
    };

    return (
      <div className="flex flex-col items-center justify-center w-screen h-[calc(100vh-4rem)] mt-[4rem] bg-[#151825]">
        <span className="text-[#00c395] text-xl">
          Your Personalized Travel Itinerary
        </span>
        <span className="text-white text-3xl mb-6 mt-2">
          당신에게 추천하는 여행 계획입니다 😉
        </span>
        <div className="w-[60%] lg:w-[50%] flex justify-center pt-6 mb-6 bg-[#1F2232] rounded-lg overflow-y-auto">
          <div className="text-white text-base whitespace-pre-wrap ">
            📆 {result}
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={resetForm}
            className="bg-[#00C395] text-base text-white px-4 py-2 rounded-lg mb-6 hover:bg-[#00b389de]"
          >
            되돌아가기
          </button>
          <button
            onClick={copyToClipboard}
            className="bg-[#00C395] text-base text-white px-4 py-2 rounded-lg mb-6 hover:bg-[#00b389de]"
          >
            일정복사
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#151825] w-screen h-screen flex justify-center items-center ">
        {/* left 이미지 */}
        <div className="hidden lg:w-1/2 pl-[10%] lg:flex items-center justify-center ">
          <div className="relative h-80 w-80">
            <Image
              src={'/planner/planner.png'}
              alt="image"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
        {/* right */}
        <div className="w-[60%] lg:w-1/2 h-[60%] flex flex-col px-[5%] lg:px-0 lg:pr-[25%]">
          <span className="text-[#00c395] text-base">Start Your Voyage</span>
          <span className="text-white text-4xl font-bold mt-2 tracking-wider">
            Create travel plan with AI
            <span className="text-[#00c395] ml-1">.</span>
          </span>
          {/* 나이 성별 */}
          <div className="flex justify-between mt-8 w-full">
            <div className="flex flex-col w-[45%] ">
              <span className="text-[#b8b8b8] text-base">나이</span>
              <input
                name="age"
                className={`bg-[#1F2232] mt-3 h-7 p-6 rounded-lg text-[#888888] placeholder-[#888888] text-base placeholder:text-base ${errors.age ? 'border border-red-500' : ''}`}
                placeholder="ex) 27"
                value={inputValues.age}
                onChange={handleInputChange}
              />
              {errors.age && (
                <span className="text-red-500 text-sm mt-1">{errors.age}</span>
              )}
            </div>
            <div className="flex flex-col w-[45%]">
              <span className="text-[#b8b8b8] text-base">성별</span>
              <Select
                onValueChange={(value) => handleSelectChange('gender', value)}
              >
                <SelectTrigger
                  className={`mt-3 bg-[#1F2232] text-[#888888] h-7 p-6 rounded-lg border ${errors.gender ? 'border-red-500' : 'border-none'}`}
                >
                  <SelectValue placeholder="성별" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="남성">남성</SelectItem>
                  <SelectItem value="여성">여성</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.gender}
                </span>
              )}
            </div>
          </div>
          {/* 예산 */}
          <div className="flex justify-between mt-4 w-full">
            <div className="flex flex-col w-full">
              <span className="text-[#b8b8b8] text-base">예산</span>
              <input
                name="budget"
                className={`bg-[#1F2232] mt-3 h-7 p-6 rounded-lg text-[#888888] placeholder-[#888888] text-base placeholder:text-base ${errors.budget ? 'border border-red-500' : ''}`}
                placeholder="여행을 떠나는데 사용하실 예산을 입력해주세요. ex) 200만원"
                value={inputValues.budget}
                onChange={handleInputChange}
              />
              {errors.budget && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.budget}
                </span>
              )}
            </div>
          </div>
          {/* 일정 */}
          <div className="flex justify-between mt-4 w-full">
            <div className="flex flex-col w-full">
              <span className="text-[#b8b8b8] text-base">일정</span>
              <DatePickerWithRange
                onChange={handleDateRangeChange}
                className={`overflow-hidden rounded-lg mt-3 ${errors.duration ? 'border border-red-500' : ''}`}
              />
              {errors.duration && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.duration}
                </span>
              )}
            </div>
          </div>
          {/* 나라 선택 */}
          <div className="flex justify-between mt-4 w-full ">
            <div className="flex flex-col w-full">
              <span className="text-[#b8b8b8] text-base">나라</span>
              <Select
                onValueChange={(value) => handleSelectChange('country', value)}
              >
                <SelectTrigger
                  className={`mt-3 bg-[#1F2232] text-[#888888] 
                   h-7 p-6 rounded-lg border ${errors.country ? 'border-red-500' : 'border-none'}`}
                >
                  <SelectValue placeholder="나라를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.country}
                </span>
              )}
            </div>
          </div>
          {/* submit */}
          <div className="flex justify-end mt-8 w-full">
            <button
              onClick={handleSendClick}
              className="bg-[#00C395] text-white px-4 py-2 rounded-lg hover:bg-[#00b389de] text-base"
            >
              일정 생성
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
