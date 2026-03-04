// Content helpers for FabRiBau
import { getCollection } from 'astro:content';

/**
 * Get all published blog posts, sorted by date (newest first)
 */
export async function getPublishedPosts() {
    const posts = await getCollection('blog', ({ data }) => !data.draft);
    return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Get featured blog posts
 */
export async function getFeaturedPosts() {
    const posts = await getPublishedPosts();
    return posts.filter((post) => post.data.featured);
}

/**
 * Get all projects, sorted by start date (newest first)
 */
export async function getAllProjects() {
    const projects = await getCollection('projects');
    return projects.sort((a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf());
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(status: 'completed' | 'in-progress' | 'archived') {
    const projects = await getAllProjects();
    return projects.filter((project) => project.data.status === status);
}

/**
 * Calculate reading time in minutes
 */
export function getReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Get all unique tags from blog posts
 */
export async function getAllTags(): Promise<string[]> {
    const posts = await getPublishedPosts();
    const tags = new Set<string>();
    posts.forEach((post) => post.data.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
}

/**
 * Format a date in Spanish
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format a relative date (e.g., "hace 3 días")
 */
export function formatRelativeDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
    return `Hace ${Math.floor(days / 365)} años`;
}
