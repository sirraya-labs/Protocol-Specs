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

      customCss: ['./src/styles/sirraya.css'],

      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'Home', slug: '' },
            { label: 'Maturity Levels', slug: 'maturity' },
          ],
        },
        
        {
          label: 'Verifiable Supply Chain',
          collapsed: true,
          items: [
            { 
              label: 'VSC Requirements & Use Cases', 
              slug: 'vsc/requirements-and-use-cases' 
            },
            { 
              label: 'VSC Core Specification', 
              slug: 'vsc/vsc-core' 
            },
          ],
        },
        
        {
          label: 'DID-KR — Key Recovery',
          collapsed: true,
          items: [
            { label: 'DID Recovery Spec', slug: 'did-kr/did-recovery' },
            { label: 'DID Threat Model', slug: 'did-kr/threat-model' },
            { label: 'Social Recovery', slug: 'did-kr/social' },
            { label: 'MPC Recovery', slug: 'did-kr/mpc' },
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