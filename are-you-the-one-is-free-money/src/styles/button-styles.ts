import { css } from 'lit';

/**
 * Default button styles that match the PaperMod theme
 * Uses CSS custom properties for theme consistency
 */
export const buttonStyles = css`
  .button {
    display: inline-block;
    padding: 12px 24px;
    border-radius: var(--radius, 8px);
    border: 1px solid var(--tertiary);
    background: var(--entry);
    color: var(--primary);
    font-size: 0.9em;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .button:hover {
    border-color: var(--primary);
    transform: translateY(-1px);
  }

  .button:active {
    transform: scale(0.96);
  }

  .button-inner {
    display: inline-block;
    padding: 0 8px;
  }
`;

/**
 * Simple button styles - minimal styling for basic buttons
 */
export const simpleButtonStyles = css`
  button {
    background-color: #505050;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-family: inherit;
    transition: background-color 0.2s ease;
  }

  button:hover {
    background-color: #606060;
  }

  button:active {
    transform: scale(0.96);
  }
`;

/**
 * Themed button styles - uses theme colors
 */
export const themedButtonStyles = css`
  button {
    background: var(--entry);
    color: var(--primary);
    border: 1px solid var(--border);
    border-radius: var(--radius, 8px);
    padding: 8px 16px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  button:hover {
    border-color: var(--primary);
    background: var(--theme);
  }

  button:active {
    transform: scale(0.96);
  }
`;
