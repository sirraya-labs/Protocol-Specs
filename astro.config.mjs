// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://specs.sirraya.org',
  
  // ─── View Transitions API — SPA-like navigation ───
  experimental: {
    viewTransitions: true,
  },
  
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

      // ─── Head injections — fonts, meta, analytics ───
      head: [
        // Preconnect for performance
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
        
        // Inter font — full weight range
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;550;600;650;700&display=swap',
          },
        },
        
        // View Transitions meta
        {
          tag: 'meta',
          attrs: {
            name: 'view-transition',
            content: 'same-origin',
          },
        },
        
        // Font + visual polish (no layout changes)
        {
          tag: 'style',
          content: `
            :root {
              --sl-font: 'Inter', system-ui, -apple-system, sans-serif;
              --sl-font-mono: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Fira Code', monospace;
            }
            
            body {
              font-family: var(--sl-font);
              font-weight: 400;
              letter-spacing: -0.01em;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            
            h1 { font-weight: 700; letter-spacing: -0.035em; line-height: 1.1; text-wrap: balance; }
            h2 { font-weight: 650; letter-spacing: -0.025em; }
            h3 { font-weight: 600; letter-spacing: -0.02em; }
            h4 { font-weight: 550; }
            
            a { transition: color 150ms ease; }
            a:hover { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; }
            
            code { font-family: var(--sl-font-mono); font-size: 0.88em; font-weight: 500; }
            pre code { font-weight: 400; }
            
            .sidebar-content a { font-weight: 450; }
            .sidebar-content a[aria-current="page"] { font-weight: 550; }
            
            th { font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.04em; }
            
            ::selection { background: var(--sl-color-accent); color: var(--sl-color-white); }
            :focus-visible { outline: 2px solid var(--sl-color-accent); outline-offset: 3px; border-radius: 0.25rem; }
            
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: var(--sl-color-gray-4); border-radius: 9999px; }
            ::-webkit-scrollbar-thumb:hover { background: var(--sl-color-gray-5); }
            
            /* View Transitions — morph between pages */
            @view-transition {
              navigation: auto;
            }
            
            ::view-transition-old(root),
            ::view-transition-new(root) {
              animation-duration: 0.3s;
            }
            
            /* Spec status badges */
            .spec-status {
              display: inline-flex;
              align-items: center;
              gap: 0.35em;
              padding: 0.15em 0.6em;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 600;
              letter-spacing: 0.02em;
            }
            .spec-status.stable {
              background: #ecfdf5;
              color: #059669;
            }
            .spec-status.draft {
              background: #fef3c7;
              color: #d97706;
            }
            .spec-status.deprecated {
              background: #fef2f2;
              color: #dc2626;
            }
            [data-theme="dark"] .spec-status.stable {
              background: rgba(5, 150, 105, 0.15);
            }
            [data-theme="dark"] .spec-status.draft {
              background: rgba(217, 119, 6, 0.15);
            }
            [data-theme="dark"] .spec-status.deprecated {
              background: rgba(220, 38, 38, 0.15);
            }
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