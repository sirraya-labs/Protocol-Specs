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
          label: 'Protocols',
          collapsed: false,
          items: [
            { label: 'UDNA', slug: 'protocols/udna' },
            { label: 'SCP — Codon Protocol', slug: 'protocols/scp' },
            { label: 'DID-KR', slug: 'protocols/did-kr' },
          ],
        },
        {
          label: 'SCP — Protocol Specs',
          collapsed: true,
          items: [
            { label: 'Codons Specification', slug: 'scp/codons' },
            { label: 'A2A Communication', slug: 'scp/a2a' },
            { label: 'Intent Resolution', slug: 'scp/intent-resolution' },
            { label: 'Payload Envelope', slug: 'scp/payload-envelope' },
            { label: 'Secure Transport', slug: 'scp/secure-transport' },
            { label: 'Capability Negotiation', slug: 'scp/capability-negotiation' },
            { label: 'Runtime Semantics', slug: 'scp/runtime-semantics' },
          ],
        },
        {
          label: 'UDNA — DID-Native Addressing',
          collapsed: true,
          items: [
            { label: 'Address Resolution', slug: 'udna/resolution' },
            { label: 'Handshake Protocol', slug: 'udna/handshake' },
            { label: 'Key Lifecycle', slug: 'udna/key-lifecycle' },
            { label: 'Relay Fallback', slug: 'udna/relay' },
          ],
        },
        {
          label: 'DID-KR — Key Recovery',
          collapsed: true,
          items: [
            { label: 'DID Recovery Spec', slug: 'did-kr/did-recovery' },
            { label: 'Recovery Methods', slug: 'did-kr/methods' },
            { label: 'Social Recovery', slug: 'did-kr/social' },
            { label: 'MPC Recovery', slug: 'did-kr/mpc' },
          ],
        },
        {
          label: 'Implementations',
          collapsed: false,
          items: [
            { label: 'Sirraya One', slug: 'implementations/sirraya-one' },
            { label: 'PQC Suite', slug: 'implementations/pqc' },
            { label: 'ZKP Auth', slug: 'implementations/zkp' },
            { label: 'QKD Stack', slug: 'implementations/qkd' },
          ],
        },
        {
          label: 'Security Engineering',
          collapsed: true,
          items: [
            { label: 'Threat Model', slug: 'security/threat-model' },
            { label: 'Trust Model', slug: 'security/trust-model' },
            { label: 'Key Compromise', slug: 'security/key-compromise' },
            { label: 'Replay Attacks', slug: 'security/replay' },
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
