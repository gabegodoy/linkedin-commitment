import type { NextConfig } from 'next';

const config: NextConfig = {
  // Só afeta o servidor de desenvolvimento: permite abrir por 127.0.0.1 além de localhost.
  allowedDevOrigins: ['127.0.0.1'],
};

export default config;
