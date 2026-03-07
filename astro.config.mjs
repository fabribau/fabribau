// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: 'https://fabribau.tech',
    output: 'server',
    adapter: cloudflare(),
    integrations: [
        mdx(),
        sitemap(),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
    env: {
        schema: {
            GOOGLE_API_KEY: envField.string({ context: 'server', access: 'secret' }),
            RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
            RESEND_FROM_EMAIL: envField.string({ context: 'server', access: 'secret' }),
            CONTACT_EMAIL: envField.string({ context: 'server', access: 'secret' }),
            TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret' }),
            PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public' }),
        }
    }
});
