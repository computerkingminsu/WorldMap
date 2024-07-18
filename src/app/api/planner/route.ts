import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API,
});

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export async function POST(request: Request) {
  const { prompt } = await request.json();

  try {
    const systemMessage =
      '사용자가 입력한 정보로 여행 계획을 짜줘. 질문하지말고 바로 계획짜 . 사용자가 화폐단위를 입력하지 않으면 만원 단위로 계산해 예를들어 78이라고 적으면 78만원인거야.1일차부터 계획을 짜줘 .항공권이 대략얼마인지 어떤식으로 예산 분배를 했는지, 숙소나 식당도 정확히 어떤식당 어떤호텔을 갈지 명시해. 숙박비 교통비도 다 상세하게 고려하고 명시해.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      // max_tokens: 4096,
      max_tokens: 2000,
    });

    if (
      response.choices &&
      response.choices[0] &&
      response.choices[0].message &&
      response.choices[0].message.content
    ) {
      return NextResponse.json({
        result: response.choices[0].message.content.trim(),
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid response from OpenAI API' },
        { status: 500 },
      );
    }
  } catch (error) {
    if (isError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: 'An unknown error occurred' },
        { status: 500 },
      );
    }
  }
}
