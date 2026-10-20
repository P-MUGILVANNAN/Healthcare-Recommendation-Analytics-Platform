import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary, ModelMetricsResponse } from '../types';

export const useAnalytics = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalyticsSummary(),
      api.getModelMetrics()
    ])
      .then(([summaryData, metricsData]) => {
        setSummary(summaryData);
        setMetrics(metricsData);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { summary, metrics, loading };
};
