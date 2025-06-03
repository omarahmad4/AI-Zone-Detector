import { config } from 'dotenv';
config();

import '@/ai/flows/improve-detection-accuracy.ts';
import '@/ai/flows/generate-detection-report.ts';
import '@/ai/flows/generate-zone-config.ts';