/**
 * Recording Service
 * Handles saving and retrieving swing analysis recordings from Supabase
 */

import { supabase } from './supabase';

export interface AnalysisResult {
  overall_score: number;
  skill_level: string;
  club_used: string;
  shot_shape: string;
  category_scores: {
    [key: string]: {
      score: number;
      feedback: string;
    };
  };
  what_was_good: string[];
  what_was_bad: string[];
  immediate_focus: Array<{
    issue: string;
    why_it_matters: string;
    simple_fix: string;
    youtube_url?: string;
  }>;
  confidence_note: string;
}

export interface Annotations {
  keyframes?: {
    [key: string]: {
      timestamp: number;
      description: string;
    };
  };
  annotation?: {
    type: string;
    purpose: string;
    show_during: {
      start_timestamp: number;
      end_timestamp: number;
    };
    coordinates: {
      from: { x: number; y: number };
      to: { x: number; y: number };
    };
    label: string;
  };
  annotation_meta?: {
    normalized_coordinates: boolean;
    max_annotations: number;
    generated_at: string;
  };
}

export interface SaveRecordingParams {
  userId: string;
  videoUrl: string;
  analysis: AnalysisResult;
  annotations?: Annotations;
  clubUsed: string;
  shotShape: string;
}

/**
 * Save a swing analysis recording to Supabase
 */
export const saveRecording = async ({
  userId,
  videoUrl,
  analysis,
  annotations,
  clubUsed,
  shotShape,
}: SaveRecordingParams): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        user_id: userId,
        video_url: videoUrl,
        analysis: analysis,
        annotations: annotations,
        score: analysis.overall_score,
        club_used: clubUsed,
        shot_shape: shotShape,
        status: 'analyzed',
        analyzed_at: new Date().toISOString(),
        analysis_version: 'v1',
      })
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return data.id;
  } catch (error) {
    console.error('Error saving recording:', error);
    throw error;
  }
};

/**
 * Get user's recording history
 */
export const getUserRecordings = async (userId: string, limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recordings:', error);
    throw error;
  }
};

/**
 * Get a single recording by ID
 */
export const getRecording = async (recordingId: string) => {
  try {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recording:', error);
    throw error;
  }
};
