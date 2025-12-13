/**
 * Analysis Types
 * TypeScript type definitions for the swing analysis flow
 */

export type AnalysisStackParamList = {
  VideoUpload: undefined;
  ClubSelection: { videoUrl: string };
  ShotShapeSelection: { videoUrl: string; selectedClub: string };
  Paywall: { videoUrl: string; selectedClub: string; shotShape: string };
  Loading: { videoUrl: string; selectedClub: string; shotShape: string };
  Results: { videoUrl: string; selectedClub: string; shotShape: string };
};

export type ClubType =
  // Driver
  | 'Driver (1-wood)'
  // Fairway Woods
  | '3-wood'
  | '4-wood'
  | '5-wood'
  | '7-wood'
  | '9-wood'
  | '11-wood'
  // Hybrids
  | '2-hybrid'
  | '3-hybrid'
  | '4-hybrid'
  | '5-hybrid'
  | '6-hybrid'
  // Long Irons
  | '1-iron'
  | '2-iron'
  | '3-iron'
  | '4-iron'
  // Mid Irons
  | '5-iron'
  | '6-iron'
  | '7-iron'
  // Short Irons
  | '8-iron'
  | '9-iron'
  // Wedges
  | 'Pitching Wedge (PW)'
  | 'Gap Wedge (GW/AW)'
  | 'Sand Wedge (SW)'
  | 'Lob Wedge (LW)'
  | 'Ultra-lob Wedge';

export type ShotShapeType =
  | "I don't know"
  | 'Anything'
  | 'Straight'
  | 'Fade'
  | 'Draw';
