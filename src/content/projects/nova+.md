---
title: "NoVa+"
description: "Asistente virtual basado en LLM para el abordaje y prevención de la adicción al juego online en adolescentes y adultos."
status: "completed"
stack: ["Next.js", "TypeScript", "Python", "FastAPI", "Tailwind CSS", "Drizzle ORM", "RAG", "Vercel"]
githubUrl: "https://github.com/fabribau/novamas"
demoUrl: "https://novamas.vercel.app/"
startDate: 2025-06-01
endDate: 2025-12-12
featured: true
---

El asistente conversacional NoVa+ es una aplicación web desarrollada como Proyecto Integrador Final (PIF) en la Universidad Nacional de San Luis (UNSL), junto a [Luciana Loyola](https://github.com/luuloyola) y un equipo de psicólogos de la universidad. Su objetivo es brindar apoyo, información y recursos a personas que enfrentan problemas relacionados con la adicción a las apuestas y juegos de azar online, y además servir como herramienta de recopilación de estadísticas en colegios, instituciones y público en general sobre la problemática.

## El problema

La adicción al juego online afecta cada vez más a adolescentes y adultos, pero el acceso a información confiable y apoyo inmediato sigue siendo limitado. Muchas personas no saben a dónde recurrir ni cómo reconocer señales de alerta en ellos mismos o en su entorno. 
Además en San Luis no hay suficiente información estadística de poblaciones puntuales como colegios secundarios. 

## La solución

Desarrollamos una plataforma web centrada en cuatro pilares:

- **ChatBot NoVa+**: asistente virtual especializado que utiliza RAG (Retrieval-Augmented Generation) para brindar respuestas contextuales, empáticas y fundamentadas sobre adicción al juego
- **Dashboard de estadísticas+**: profesionales de la psicología del Programa Universitario De Prevención De Consumos Problemáticos Y Adicciones podrán crear sesiones privadas de chat y recopilar estadísticas anónimas del público que utilice el asistente y asi detectar consumos problemáticos o ludopatía en grupos específicos y también en el uso público
- **Recursos y líneas de emergencia**: artículos, guías de autoayuda y material especializado sobre prevención. También acceso rápido a contactos de ayuda profesional, incluyendo la Línea Nacional Gratuita 141 y centros de San Luis
- **Diseño responsive**: interfaz moderna con Tailwind CSS, accesible desde cualquier dispositivo

## Stack técnico

El proyecto está construido con **Next.js 15** (App Router) y **TypeScript**, usando **Drizzle ORM** para la base de datos y desplegado en **Vercel**. El chatbot implementa RAG para enriquecer las respuestas del modelo de lenguaje con documentación especializada.
La parte de análisis estadístico está construido con **Python y FastAPI** para un mejor procesamiento del lenguaje natural y aprovechar sus librerías.

## Aprendizajes

Este proyecto me permitió profundizar en la implementación de sistemas RAG con LLMs, la colaboración en un proyecto académico interdisciplinario con impacto social real, la implementación de una arquitectura compleja en un entorno real. 
