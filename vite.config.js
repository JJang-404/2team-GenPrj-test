import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_BACKEND_URL = 'https://gen-proj.duckdns.org/addhelper';

const trimTrailingSlash = (value) => {
  const trimmed = value.replace(/\/+$/, '');
  return trimmed || '/';
};

const getConfiguredBackendUrl = (env) => trimTrailingSlash(env.VITE_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL);

const getProxyPath = (backendUrl) => {
  try {
    return trimTrailingSlash(new URL(backendUrl).pathname || '/');
  } catch {
    if (backendUrl.startsWith('/')) {
      return trimTrailingSlash(backendUrl);
    }

    return '/addhelper';
  }
};

const getProxyTarget = (backendUrl) => {
  try {
    const parsedUrl = new URL(backendUrl);
    return parsedUrl.origin;
  } catch {
    return new URL(DEFAULT_BACKEND_URL).origin;
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backendUrl = getConfiguredBackendUrl(env);
  const proxyPath = getProxyPath(backendUrl);
  const proxyTarget = getProxyTarget(backendUrl);

  return {
    plugins: [react()],
    server: {
      proxy: {
        [proxyPath]: {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https://'),
        },
      },
    },
  };
});
