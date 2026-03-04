// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: 'https://fabribau.com',
    output: 'static',
    adapter: vercel(),
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
        }
    }
});
