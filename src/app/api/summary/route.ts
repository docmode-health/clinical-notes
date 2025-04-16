import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only on the server side
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: false // Explicitly disable browser usage
});

export async function POST(request: Request) {
  try {
    const { transcription } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a medical transcription assistant. Analyze the following medical consultation transcription and provide:
          1. A concise medical summary
          2. A structured patient history
          
          Format the response as a JSON object with two fields:
          - summary: A brief summary of the consultation
          - patientHistory: An array of strings containing structured patient information (age, gender, symptoms, medical history, medications, etc.)`
        },
        {
          role: "user",
          content: transcription
        }
      ],
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Ensure patientHistory is an array
    if (typeof response.patientHistory === 'string') {
      response.patientHistory = [response.patientHistory];
    } else if (!Array.isArray(response.patientHistory)) {
      response.patientHistory = [];
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate summary',
        summary: 'Unable to generate AI summary. Please review the transcription manually.',
        patientHistory: []
      },
      { status: 500 }
    );
  }
} 
