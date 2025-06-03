export interface Point {
  x: number;
  y: number;
}

export interface Zone {
  name: string;
  polygon: Point[]; // For displaying, coordinates are relative (0-1)
}

export interface Detection {
  object: string;
  zone?: string; // Zone name
  timestamp?: string; // ISO date string
  box?: [number, number, number, number]; // [x, y, width, height] in pixels, relative to video frame
  confidence?: number;
}

// For the /last-seen endpoint
export interface LastSeenRecord extends Detection {
  // Inherits object, zone, timestamp
}

// For the generateZoneConfig AI flow
export interface GeneratedZone {
  name: string;
  polygon: Point[]; // Coordinates from AI are also expected to be relative
}

export interface GenerateZoneConfigInput {
  photoDataUri: string;
}

export interface GenerateZoneConfigOutput {
  zones: GeneratedZone[];
}

// For the generateDetectionReport AI flow
export interface GenerateDetectionReportInput {
  startTime: string; // ISO format
  endTime: string; // ISO format
}

export interface GenerateDetectionReportOutput {
  report: string; // The summary report text
}
