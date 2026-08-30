import { API_BASE_URL } from './api';

export interface ImageAnalysisResponse {
  answer: string;
  model_used?: string;
}

export async function analyzeImage(file: File, language = 'en'): Promise<ImageAnalysisResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('language', language);

  const response = await fetch(`${API_BASE_URL}/analyze-image`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — browser sets it automatically with the boundary
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Image analysis failed: ${response.status}`);
  }

  return response.json();
}
