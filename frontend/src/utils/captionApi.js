const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function generateAICaption(options) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/captions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
      signal: AbortSignal.timeout(35000),
    });
  } catch {
    throw new Error(
      'Backend is unreachable. Start the ReelFlow AI backend and try again.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Caption generation failed.');
    error.code = data.code || 'API_ERROR';
    error.status = response.status;
    throw error;
  }

  return data;
}
