import type { Preview } from '@storybook/web-components';
import './theme.css';

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
  decorators: [
    (story) => {
      document.documentElement.classList.add('dark');
      return story();
    }
  ]
};

export default preview;
