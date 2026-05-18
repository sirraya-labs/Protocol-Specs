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
        { icon: 'github', label: 'GitHub', href: 'https://github.com/sirraya-labs/specifications' },
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
          label: 'Core Layer',
          collapsed: false,
          items: [
            { label: 'Architecture Overview', slug: 'core/architecture' },
            { label: 'Threat Model', slug: 'core/threat-model' },
            { label: 'Trust Model', slug: 'core/trust-model' },
            { label: 'Zero Trust Execution', slug: 'core/zero-trust' },
            { label: 'Agent Communication', slug: 'core/agent-communication' },
            { label: 'Capability & Intent', slug: 'core/capability-intent' },
            { label: 'Identity & Provenance', slug: 'core/identity-provenance' },
          ],
        },
        {
          label: 'Protocols',
          collapsed: true,
          items: [
            { label: 'Codons Specification', slug: 'protocols/codons' },
            { label: 'A2A Communication', slug: 'protocols/a2a' },
            { label: 'Intent Resolution', slug: 'protocols/intent-resolution' },
            { label: 'Payload Envelope', slug: 'protocols/payload-envelope' },
            { label: 'Secure Transport', slug: 'protocols/secure-transport' },
            { label: 'Capability Negotiation', slug: 'protocols/capability-negotiation' },
            { label: 'Runtime Semantics', slug: 'protocols/runtime-semantics' },
          ],
        },
        {
          label: 'Identity & Trust',
          collapsed: true,
          items: [
            { label: 'DID Integration', slug: 'identity/did' },
            { label: 'VC Integration', slug: 'identity/vc' },
            { label: 'Delegation Model', slug: 'identity/delegation' },
            { label: 'Trust Chain', slug: 'identity/trust-chain' },
            { label: 'Provenance Metadata', slug: 'identity/provenance' },
            { label: 'Knowledge Lifecycle', slug: 'identity/knowledge-lifecycle' },
          ],
        },
        {
          label: 'Runtime & Infra',
          collapsed: true,
          items: [
            { label: 'Runtime APIs', slug: 'runtime/apis' },
            { label: 'Execution Engine', slug: 'runtime/engine' },
            { label: 'Verification Services', slug: 'runtime/verification' },
            { label: 'Registry Services', slug: 'runtime/registry' },
            { label: 'Event Streams', slug: 'runtime/events' },
            { label: 'State Sync', slug: 'runtime/state' },
          ],
        },
        {
          label: 'Registries',
          collapsed: true,
          items: [
            { label: 'Intent Types', slug: 'registries/intents' },
            { label: 'Capability Types', slug: 'registries/capabilities' },
            { label: 'Codon Types', slug: 'registries/codons' },
            { label: 'Error Codes', slug: 'registries/errors' },
            { label: 'Trust Levels', slug: 'registries/trust-levels' },
            { label: 'Signature Profiles', slug: 'registries/signatures' },
          ],
        },
        {
          label: 'Implementations',
          collapsed: true,
          items: [
            { label: 'Rust Runtime', slug: 'implementations/rust' },
            { label: 'JavaScript SDK', slug: 'implementations/js-sdk' },
            { label: 'Gateway Server', slug: 'implementations/gateway' },
            { label: 'CLI Tools', slug: 'implementations/cli' },
            { label: 'Test Suites', slug: 'implementations/tests' },
          ],
        },
        {
          label: 'Governance',
          collapsed: true,
          items: [
            { label: 'Contribution Process', slug: 'governance/contributing' },
            { label: 'Versioning Policy', slug: 'governance/versioning' },
            { label: 'Interop Policy', slug: 'governance/interop' },
            { label: 'Security Policy', slug: 'governance/security' },
            { label: 'Working Groups', slug: 'governance/working-groups' },
          ],
        },
      ],
    }),
  ],
});