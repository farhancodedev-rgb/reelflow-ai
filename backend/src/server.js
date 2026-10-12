import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ReelFlow AI backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
