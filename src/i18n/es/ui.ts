// i18n — Strings de UI en Español
// Estructura preparada para expansión a inglés (src/i18n/en/ui.ts)

export const ui = {
    // Site
    siteName: 'FabRiBau',
    siteDescription: 'Blog, proyectos y portafolio personal de Fabrizio Riera Bauer — Ingeniero en Informática, desarrollador y docente universitario.',

    // Navigation
    nav: {
        home: 'Inicio',
        blog: 'Blog',
        projects: 'Proyectos',
        about: 'Sobre mí',
        contact: 'Contacto',
        ask: 'Ask',
    },

    // Home
    home: {
        greeting: 'Hola, soy',
        name: 'Fabrizio Riera Bauer',
        tagline: 'Ingeniero en Informática · Desarrollador · Docente Universitario',
        description: 'Construyo software con propósito, enseño lo que aprendo y escribo sobre tecnología, IA y desarrollo web.',
        ctaProjects: 'Ver proyectos',
        ctaBlog: 'Leer el blog',
        recentPosts: 'Últimas publicaciones',
        featuredPosts: 'Posts destacados',
        viewAll: 'Ver todos los posts →',
    },

    // Blog
    blog: {
        title: 'Blog',
        description: 'Artículos sobre desarrollo web, inteligencia artificial, docencia y tecnología.',
        readingTime: 'min de lectura',
        allTags: 'Todos',
        noPosts: 'No hay publicaciones todavía.',
        prevPost: '← Post anterior',
        nextPost: 'Siguiente post →',
        share: 'Compartir',
        copyLink: 'Copiar enlace',
        linkCopied: '¡Enlace copiado!',
        subscribe: 'Suscríbete al newsletter',
        subscribeDesc: 'Recibe nuevos posts directamente en tu email.',
    },

    // Projects
    projects: {
        title: 'Proyectos',
        description: 'Cosas que construí, estoy construyendo o construí alguna vez.',
        filterAll: 'Todos',
        filterCompleted: 'Terminado',
        filterInProgress: 'En desarrollo',
        filterArchived: 'Archivado',
        viewDemo: 'Demo en vivo',
        viewCode: 'Ver código',
        statusCompleted: 'Terminado',
        statusInProgress: 'En desarrollo',
        statusArchived: 'Archivado',
    },

    // About
    about: {
        title: 'Sobre mí',
        description: 'Conocé más sobre mi trayectoria, experiencia, habilidades e intereses.',
        intro: 'Un poco sobre mí',
        values: 'Lo que me mueve',
        experience: 'Experiencia',
        education: 'Educación',
        skills: 'Habilidades',
        hobbies: 'Intereses y hobbies',
        downloadCV: 'Descargar CV',
    },

    // Contact
    contact: {
        title: 'Contacto',
        description: 'Hablemos. Ya sea por un proyecto, una idea o simplemente para saludar.',
        intro: 'Si querés charlar sobre un proyecto, una colaboración o simplemente decir hola, escribime. Respondo siempre que puedo.',
        nameLabel: 'Nombre',
        emailLabel: 'Email',
        subjectLabel: 'Asunto',
        messageLabel: 'Mensaje',
        send: 'Enviar mensaje',
        sending: 'Enviando...',
        success: '¡Mensaje enviado! Te respondo pronto.',
        error: 'Hubo un error al enviar. Intentá de nuevo.',
    },

    // Ask
    ask: {
        title: 'Preguntame',
        description: 'Hacele preguntas a una IA que sabe sobre mí.',
        intro: 'Tenés 5 preguntas por sesión. Preguntá lo que quieras sobre mi experiencia, proyectos, habilidades o intereses.',
        remaining: 'Preguntas disponibles',
        placeholder: 'Escribí tu pregunta...',
        send: 'Preguntar',
        exhausted: '¡Usaste tus 5 preguntas! Refrescá la página para empezar de nuevo.',
        thinking: 'Pensando...',
    },

    // Footer
    footer: {
        madeWith: 'Hecho con',
        and: 'y',
        by: 'por Fabrizio Riera Bauer',
        rights: 'Todos los derechos reservados.',
    },

    // Common
    common: {
        views: 'vistas',
        likes: 'likes',
        dark: 'Tema oscuro',
        light: 'Tema claro',
    },
} as const;
