import type { Preview } from '@storybook/web-components';
import '../styles/global.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1d1e20' },
        { name: 'light', value: '#ffffff' }
      ]
    }
  },
};

export default preview;
