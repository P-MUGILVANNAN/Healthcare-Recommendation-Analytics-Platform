import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { ProfileInput, RecommendationResponse } from '../types';

export const useRecommendations = (initialProfile?: ProfileInput) => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [alpha, setAlpha] = useState(0.45);
  const [beta, setBeta] = useState(0.20);
  const [gamma, setGamma] = useState(0.20);
  const [delta, setDelta] = useState(0.15);
  const [topK, setTopK] = useState(5);
  const [applySafety, setApplySafety] = useState(true);

  const fetchRecommendations = useCallback(async (profileToUse?: ProfileInput) => {
    setLoading(true);
    setError(null);

    const saved = sessionStorage.getItem('active_health_profile');
    const profile: ProfileInput = profileToUse || (saved ? JSON.parse(saved) : (initialProfile || {
      age: 56,
      sex: 1,
      trestbps: 148,
      chol: 252,
      interests: ['hypertension', 'blood pressure'],
      preferred_categories: ['Nutrition Education'],
      acute_symptoms: []
    }));

    try {
      const res = await api.getRecommendations(
        profile,
        topK,
        applySafety,
        { alpha, beta, gamma, delta }
      );
      setData(res);
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
      setError(err?.message || 'Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  }, [alpha, beta, gamma, delta, topK, applySafety, initialProfile]);

  return {
    data,
    loading,
    error,
    alpha,
    setAlpha,
    beta,
    setBeta,
    gamma,
    setGamma,
    delta,
    setDelta,
    topK,
    setTopK,
    applySafety,
    setApplySafety,
    fetchRecommendations,
  };
};
