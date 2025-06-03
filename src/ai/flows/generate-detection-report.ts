// src/ai/flows/generate-detection-report.ts
'use server';

/**
 * @fileOverview Generates a summary report of object detection events within a specified time range.
 *
 * - generateDetectionReport - A function that generates the report.
 * - GenerateDetectionReportInput - The input type for the generateDetectionReport function.
 * - GenerateDetectionReportOutput - The return type for the generateDetectionReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDetectionReportInputSchema = z.object({
  startTime: z.string().describe('The start time for the report (ISO format).'),
  endTime: z.string().describe('The end time for the report (ISO format).'),
});
export type GenerateDetectionReportInput = z.infer<typeof GenerateDetectionReportInputSchema>;

const GenerateDetectionReportOutputSchema = z.object({
  report: z.string().describe('A summary report of object detection events.'),
});
export type GenerateDetectionReportOutput = z.infer<typeof GenerateDetectionReportOutputSchema>;

export async function generateDetectionReport(input: GenerateDetectionReportInput): Promise<GenerateDetectionReportOutput> {
  return generateDetectionReportFlow(input);
}

const generateDetectionReportPrompt = ai.definePrompt({
  name: 'generateDetectionReportPrompt',
  input: {schema: GenerateDetectionReportInputSchema},
  output: {schema: GenerateDetectionReportOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing object detection data.
  Generate a report summarizing object detection events between {{startTime}} and {{endTime}}.
  Highlight frequently detected objects in specific zones to identify patterns and suggest zone configuration optimizations.
  Focus on providing actionable insights based on the detection data.
  The report should be concise and easy to understand.
`,
});

const generateDetectionReportFlow = ai.defineFlow(
  {
    name: 'generateDetectionReportFlow',
    inputSchema: GenerateDetectionReportInputSchema,
    outputSchema: GenerateDetectionReportOutputSchema,
  },
  async input => {
    const {output} = await generateDetectionReportPrompt(input);
    return output!;
  }
);
