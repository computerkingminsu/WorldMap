import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API,
});

const content = process.env.OPENAI_MAIN_API;
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export async function POST(request: Request) {
  const { prompt } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: content || '',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 1,
      max_tokens: 1000,
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
