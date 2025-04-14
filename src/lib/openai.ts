'use client';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateMedicalSummary(transcription: string) {
  try {
    if (!transcription.trim()) {
      throw new Error('Empty transcription');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a medical transcription assistant. Analyze the following consultation transcript and generate:
          1. A concise medical summary
          2. A structured patient history
          
          Format the response as a JSON object with two fields:
          - summary: A brief summary of the consultation
          - patientHistory: An array of key medical points from the patient's history
          
          Focus on medical conditions, symptoms, medications, and relevant medical history.`
        },
        {
          role: "user",
          content: transcription
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const result = JSON.parse(content);
      return {
        summary: result.summary || 'Unable to generate summary',
        patientHistory: Array.isArray(result.patientHistory) ? result.patientHistory : []
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        summary: 'Unable to generate AI summary. Please review the transcription manually.',
        patientHistory: []
      };
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      summary: 'Unable to generate AI summary. Please review the transcription manually.',
      patientHistory: []
    };
  }
} 