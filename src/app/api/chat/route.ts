import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message, topic } = await req.json();

  // Replace with your OpenRouter API key
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'Missing OpenRouter API key.' }, { status: 500 });
  }

  // Dynamic system prompt based on topic
  const systemPrompt = topic
    ? `You are a helpful onboarding assistant for Microsoft specifically. This conversation is specifically for: ${topic}.`
    : 'You are a helpful onboarding assistant.';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-small-3.2-24b-instruct-2506:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error }, { status: response.status });
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  return NextResponse.json({ reply });
}
