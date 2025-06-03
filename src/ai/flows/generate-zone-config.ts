// src/ai/flows/generate-zone-config.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate zone configurations from an uploaded image.
 *
 * - generateZoneConfig - A function that generates a zone configuration based on the provided image.
 * - GenerateZoneConfigInput - The input type for the generateZoneConfig function.
 * - GenerateZoneConfigOutput - The return type for the generateZoneConfig function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateZoneConfigInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the camera feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateZoneConfigInput = z.infer<typeof GenerateZoneConfigInputSchema>;

const GenerateZoneConfigOutputSchema = z.object({
  zones: z.array(
    z.object({
      name: z.string().describe('The name of the zone.'),
      polygon: z.array(
        z.object({
          x: z.number().describe('The x coordinate of the polygon point.'),
          y: z.number().describe('The y coordinate of the polygon point.'),
        })
      ).describe('The polygon defining the zone boundary. Represented as an array of x, y coordinate pairs'),
    })
  ).describe('An array of zones with their names and polygon coordinates.'),
});
export type GenerateZoneConfigOutput = z.infer<typeof GenerateZoneConfigOutputSchema>;

export async function generateZoneConfig(input: GenerateZoneConfigInput): Promise<GenerateZoneConfigOutput> {
  return generateZoneConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateZoneConfigPrompt',
  input: {schema: GenerateZoneConfigInputSchema},
  output: {schema: GenerateZoneConfigOutputSchema},
  prompt: `You are an expert in computer vision and can identify distinct zones within a camera feed.

  Based on the provided image, propose initial zone boundaries. Each zone consists of a name and polygon coordinates.
  Provide the zone configuration as JSON data adhering to the specified schema.
  Ensure that the coordinates are relative to the image dimensions and create zones that logically separate areas within the view.  Consider common room layouts, furniture, and other visual cues to create useful zones.

  Image: {{media url=photoDataUri}}
  `,
});

const generateZoneConfigFlow = ai.defineFlow(
  {
    name: 'generateZoneConfigFlow',
    inputSchema: GenerateZoneConfigInputSchema,
    outputSchema: GenerateZoneConfigOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
