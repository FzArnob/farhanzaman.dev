/** Cross-component signals that don't warrant a context. */
declare global {
  interface WindowEventMap {
    /** Fired after the theme stylesheet swap; carries the newly applied theme. */
    'fz:theme': CustomEvent<'dark' | 'light'>;
  }
}

export {};
