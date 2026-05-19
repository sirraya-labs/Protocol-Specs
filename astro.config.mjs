// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://specs.sirraya.org',
  integrations: [
    starlight({
      title: 'Sirraya Labs',
      logo: {
        src: './src/assets/sirraya-logo.svg',
      },
      favicon: '/favicon.svg',
      
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/sirraya-labs' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/sirraya' },
      ],

      editLink: {
        baseUrl: 'https://github.com/sirraya-labs/specifications/edit/main/',
      },

      head: [
        // Google Fonts import
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: true,
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;550;600;650;700&display=swap',
          },
        },
        // Inline font styles
        {
          tag: 'style',
          content: `
            :root {
              --sl-font: 'Inter', system-ui, -apple-system, sans-serif;
              --sl-font-mono: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Fira Code', monospace;
            }
            body {
              font-family: var(--sl-font);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            h1 { font-weight: 700; letter-spacing: -0.035em; }
            h2 { font-weight: 650; letter-spacing: -0.025em; }
            h3 { font-weight: 600; letter-spacing: -0.02em; }
            h4 { font-weight: 550; }
            .sidebar-content a { font-weight: 450; }
            .sidebar-content a[aria-current="page"] { font-weight: 550; }
            code { font-family: var(--sl-font-mono); }
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: var(--sl-color-gray-4); border-radius: 9999px; }
            ::-webkit-scrollbar-thumb:hover { background: var(--sl-color-gray-5); }
          `,
        },
      ],

      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'Home', slug: '' },
            { label: 'Maturity Levels', slug: 'maturity' },
          ],
        },
        {
          label: 'DID-KR — Key Recovery',
          collapsed: true,
          items: [
            { label: 'DID Recovery Spec', slug: 'did-kr/did-recovery' },
            { label: 'DID Threat Model', slug: 'did-kr/threat-model' },
          ],
        },
        {
          label: 'Verifiable Supply Chain',
          collapsed: true,
          items: [
            { 
              label: 'VSC Core Specification', 
              slug: 'vsc/vsc-core' 
            },
          ],
        },
        {
          label: 'Governance',
          collapsed: true,
          items: [
            { label: 'Contribution Process', slug: 'governance/contributing' },
            { label: 'Versioning Policy', slug: 'governance/versioning' },
            { label: 'Security Policy', slug: 'governance/security' },
            { label: 'Working Groups', slug: 'governance/working-groups' },
          ],
        },
      ],
    }),
  ],
});