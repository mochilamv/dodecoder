/**
 * Core Type Definitions for DoDecoder Anti-Forensic Engine
 */

export type DefenseLevel = 'standard' | 'hardened' | 'paranoid';

export type OutputFormat = 'original' | 'image/webp' | 'image/jpeg' | 'image/png';

export interface MetadataTag {
  category: 'EXIF' | 'GPS' | 'MakerNotes' | 'IFD1_Thumbnail' | 'XMP' | 'Container' | 'ICC';
  name: string;
  value: string;
  severity: 'low' | 'medium' | 'critical';
  description?: string;
}

export interface MarkerInfo {
  offset: number;
  marker: string;
  name: string;
  length?: number;
  isSanitizedSafe: boolean;
  description?: string;
}

export interface ForensicReport {
  fileName: string;
  fileSize: number;
  mimeType: string;
  hasExif: boolean;
  hasGps: boolean;
  hasThumbnail: boolean;
  hasMakerNotes: boolean;
  tags: MetadataTag[];
  markers: MarkerInfo[];
  prnuSusceptibility: 'low' | 'moderate' | 'high';
  sha256: string;
}

export interface SanitizedResult {
  blob: Blob;
  originalBlob?: Blob;
  originalName: string;
  sanitizedName: string;
  originalSize: number;
  sanitizedSize: number;
  format: string;
  sha256: string;
  defenseLevel: DefenseLevel;
  auditBefore: ForensicReport;
  auditAfter: ForensicReport;
  processedAt: number;
  isDeepDecontaminated?: boolean;
  extremeSanitization?: boolean;
}

export interface QueueItem {
  id: string;
  file: File;
  status: 'idle' | 'analyzing' | 'processing' | 'done' | 'error';
  progress: number;
  result?: SanitizedResult;
  error?: string;
}
