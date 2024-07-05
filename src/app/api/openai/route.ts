// app/api/openai/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API,
});

export async function POST(request: Request) {
  const { prompt } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            '사용자의 위치와 (선택적으로) 예산에 따라 한국, 일본, 러시아 중 한 나라를 추천해주세요. 답변은 나라 이름을 영어로 말해. 나라이름 첫글자는 대문자로 , 예를 들어 Korea',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 10,
    });

    return NextResponse.json({ result: response.choices[0].message.content.trim() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
