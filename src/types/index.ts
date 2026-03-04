// Global TypeScript types for FabRiBau

export interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    publishedTime?: string;
    tags?: string[];
    noindex?: boolean;
}

export interface NavLink {
    label: string;
    href: string;
}

export interface SocialLink {
    label: string;
    href: string;
    icon: string;
}

export interface TimelineItem {
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
    description: string;
    stack?: string[];
    achievements?: string[];
}

export interface SkillCategory {
    name: string;
    skills: Skill[];
}

export interface Skill {
    name: string;
    level: number; // 1-5
}

export interface Hobby {
    name: string;
    description: string;
    emoji: string;
}
