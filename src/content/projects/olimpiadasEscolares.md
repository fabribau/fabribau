---
title: "Olimpiadas Escolares de Atletismo"
description: "Sistema para la gestión de torneos de atletismo, desde creación de olimpiada, etapas, recepción de inscripciones, generación de series, planillas y cargas de resultados, generación de finales y calculo de puntajes. Para la Secretaría de Deportes del gobierno de la provincia de San Luis, Argentina."
status: "completed"
stack: ["Java", "Spring Boot", "Next.js", "TypeScript", "Material UI", "Tailwind CSS", "MySQL"]
startDate: 2024-3-1
endDate: 2025-9-31
featured: true
---

Sistema de gestión desarrollado junto a [Damián Matus](https://github.com/) para la Secretaría de Deportes de la provincia de San Luis, utilizado en las ediciones 2024 y 2025 de las Olimpiadas Escolares de Atletismo. A lo largo de ambas ediciones, el sistema gestionó la participación de **más de 2500 atletas** provenientes de **más de 100 escuelas** de la provincia.

## El problema

La organización del evento se gestionaba completamente en papel y hojas de cálculo. Armar las series de competencia, registrar tiempos, calcular puntajes y publicar resultados era un proceso lento, propenso a errores y difícil de escalar con la cantidad de atletas e instituciones participantes.

## La solución

Desarrollamos una plataforma interna de administración que cubre todo el ciclo de vida del evento:

- **Gestión de olimpiadas y etapas**: configuración de cada edición del evento y sus fases de competencia
- **Inscripción de atletas y escuelas**: carga y administración de participantes por institución
- **Generación automática de series**: asignación de atletas a series según categoría y disciplina, reduciendo tiempos de organización
- **Carga de resultados y tiempos**: registro ágil durante la competencia
- **Cálculo de puntajes y clasificación**: lógica automática para rankings y avance de etapas
- **Generación de finales**: determinación de clasificados en base a resultados previos
- **Exportación de planillas**: generación de documentos PDF y Excel para uso oficial y archivo

## Stack técnico

El backend está desarrollado en **Java con Spring Boot**, usando **Spring Data JPA e Hibernate** sobre una base de datos **MySQL**. El frontend es una aplicación **Next.js con TypeScript** y **Material UI**.

## Aprendizajes

Este proyecto me permitió trabajar en un contexto real con impacto directo en un evento provincial, desde la captura de requerimientos con el equipo de la Secretaría hasta el despliegue y uso en producción. Ver el sistema funcionando en cancha —y volver a usarlo en la edición siguiente— fue una experiencia más que satisfactoria.