---
name: monepicks
description: Contexto y lineamientos para el proyecto de Monepicks (plataforma de predicciones deportivas).
---

# Proyecto Monepicks - Plataforma de Predicciones Deportivas

Este proyecto es una aplicación web (Single Page Application) que lee predicciones deportivas (empezando con la MLB) desde un archivo CSV y las muestra en una interfaz moderna y llamativa.

## Stack Tecnológico
- **Frontend Framework:** React (inicializado vía Vite)
- **Estilos:** Vanilla CSS moderno (Dark mode, glassmorphism, flexbox/grid)
- **Lectura de Datos:** `PapaParse` para leer archivos CSV desde el frontend
- **Iconos:** `lucide-react`

## Estructura de Directorios Clave
- `webapp/` - Carpeta raíz del frontend.
- `webapp/public/data/` - Aquí se almacenan los CSVs de origen (ej. `Predicciones_MLB.csv`).
- `webapp/src/components/` - Componentes reutilizables (tarjetas, cabecera, banners de publicidad).
- `webapp/src/modules/` - Módulos específicos por deporte (ej. `mlb/`).
- `webapp/src/styles/` - Estilos globales (`global.css`) con variables CSS para consistencia visual.

## Lineamientos de Diseño Obligatorios (Premium)
- **Tema:** Dark mode por defecto. Usar colores de fondo como `#0f172a` (slate-900) o `#18181b` (zinc-900).
- **Acentos:** Colores vibrantes como cyan, violeta o verde neón para botones o detalles importantes.
- **Tipografía:** Usar fuentes sin serifa modernas (Inter, Roboto, Poppins).
- **Tarjetas:** Efecto glassmorphism (fondos semi-transparentes con `backdrop-filter: blur`), bordes sutiles redondeados (`border-radius: 12px` o superior).
- **Publicidad:** Espacios no invasivos intercalados o laterales, diseñados para monetizar sin arruinar la experiencia de usuario.
- **Micro-animaciones:** Efectos de hover suaves en tarjetas y botones (`transition: all 0.3s ease`).

## Comandos Útiles
Para desarrollar y correr localmente:
1. `cd webapp`
2. `npm install` (si hay dependencias nuevas)
3. `npm run dev`

## Cómo Continuar el Trabajo
Al iniciar una nueva sesión, asegúrate de correr el servidor local si el usuario lo requiere. Si el usuario sube un nuevo archivo CSV, sobreescribe el existente en `webapp/public/data/` y verifica si las columnas han cambiado para actualizar la lógica en `webapp/src/utils/` o en el componente.
