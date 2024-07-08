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
            '사용자의 정보에 따라 한국, 일본, 러시아, 미국, 영국 중 한 나라를 추천해. 사용자가 위치를 말하지 않으면 기본적으로 한국에 위치해 있다고 가정해. 답변은 무조건 나라 이름을 영어로 먼저 말하고, 그 뒤에 설명을 하면돼. 예를들어 Japan : 사용자님은 한국에 위치해있고 일정이 이틀밖에 없기 때문에 가까운 일본을 추천합니다. 난해한 질문을 하면 랜덤으로 나라를 추천해주면 돼. 답변은 80자 이내로 말을 끝맺음해. 나라이름 첫글자는 대문자로 ,한국은 South Korea로, 미국은 USA, 영국이나 영국에 속한나라는(예를 들어 잉글랜드) United Kindom로 답변해.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 1,
      max_tokens: 150,
    });

    if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
      return NextResponse.json({ result: response.choices[0].message.content.trim() });
    } else {
      return NextResponse.json({ error: 'Invalid response from OpenAI API' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
