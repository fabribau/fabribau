import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string().max(160),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),
        coverImage: image().optional(),
    }),
});

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        status: z.enum(['completed', 'in-progress', 'archived']),
        stack: z.array(z.string()),
        githubUrl: z.string().url().optional(),
        demoUrl: z.string().url().optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        featured: z.boolean().default(false),
        images: z.array(z.string()).optional(),
    }),
});

export const collections = { blog, projects };
