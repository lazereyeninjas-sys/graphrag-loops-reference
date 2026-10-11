import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Content Security Policy for the shipped bundle.
// Base policy plus the egress and injection directives (S8, S9).
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "connect-src 'none'",
  "img-src 'self' data:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "require-trusted-types-for 'script'",
];

const CSP = CSP_DIRECTIVES.join('; ');

// Injects the CSP meta tag into the production index.html only.
// The dev server runs without it, because the policy would block
// the dev server's HMR websocket and injected style tags.
function productionCsp() {
  return {
    name: 'production-csp',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), productionCsp()],
  // No environment variable can reach the bundle (S10).
  envPrefix: '__NONE__',
  build: {
    // Keep every asset bundled locally; no remote assets.
    assetsInlineLimit: 0,
    sourcemap: false,
  },
});
