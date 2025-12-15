import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement basées sur le mode actuel
  // Vercel injecte les variables d'environnement lors du build
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Injection de la clé API pour satisfaire l'exigence `process.env.API_KEY` du SDK Gemini
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Fallback pour éviter les erreurs si process.env est accédé ailleurs
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    }
  };
});