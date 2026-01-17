import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: [
    '../**/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  viteFinal: async (config) => {
    // Ensure TypeScript decorators are supported
    if (config.esbuild) {
      config.esbuild = {
        ...config.esbuild,
        target: 'es2020'
      };
    } else {
      config.esbuild = {
        target: 'es2020'
      };
    }
    return config;
  }
};

export default config;
