import axios from 'axios';
import {
  ProfileInput,
  ProfileValidationResponse,
  RiskPredictionResponse,
  RecommendationResponse,
  ModelMetricsResponse,
  AnalyticsSummary,
  Resource
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const api = {
  async getHealth() {
    const res = await client.get('/health');
    return res.data;
  },

  async getResources(): Promise<Resource[]> {
    const res = await client.get('/resources');
    return res.data;
  },

  async getResource(itemId: string): Promise<Resource> {
    const res = await client.get(`/resources/${itemId}`);
    return res.data;
  },

  async validateProfile(profile: ProfileInput): Promise<ProfileValidationResponse> {
    const res = await client.post('/profiles/validate', profile);
    return res.data;
  },

  async predictRisk(profile: ProfileInput): Promise<RiskPredictionResponse> {
    const res = await client.post('/predictions', { profile });
    return res.data;
  },

  async getRecommendations(
    profile: ProfileInput,
    topK = 5,
    applySafety = true,
    weights?: { alpha: number; beta: number; gamma: number; delta: number }
  ): Promise<RecommendationResponse> {
    const res = await client.post('/recommendations', {
      profile,
      top_k: topK,
      apply_safety: applySafety,
      weights,
    });
    return res.data;
  },

  async submitFeedback(payload: {
    item_id: string;
    rating: number;
    usefulness_score?: number;
    comments?: string;
    session_id?: string;
  }) {
    const res = await client.post('/feedback', payload);
    return res.data;
  },

  async getModelMetrics(): Promise<ModelMetricsResponse> {
    const res = await client.get('/model/metrics');
    return res.data;
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await client.get('/analytics/summary');
    return res.data;
  },

  async getModelVersion() {
    const res = await client.get('/model/version');
    return res.data;
  }
};
