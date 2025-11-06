import type { Config } from 'orval';

const config: Config = {
  orderITY: {
    input: './spec/openapi.yaml',
    output: {
      target: './src/lib/api/generated.ts',
      schemas: './src/lib/api/models',
      client: 'react-query',     // sinh useGet..., usePost...
      httpClient: 'axios',
      mock: true,                // sinh MSW handlers
      override: {
        mutator: {
          path: './src/lib/api/axios.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
};

export default config;
