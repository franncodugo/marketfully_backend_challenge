# 🏠 Marketfully Backend Challenge

Solución para la gestión de 2.2M+ registros de propiedades, integrando scraping demográfico inteligente y procesamiento de flujos de datos.

## 🎯 Decisiones de Diseño y Trade-offs

Para este desafío, se priorizo la eficiencia computacional y la robustez sobre la simplicidad superficial:

#### ETL con Node.js Streams: 
En lugar de cargar el CSV de 2.2M de filas en memoria, implementé un pipeline de lectura y transformación por bloque. Esto mantiene el consumo estable durante proceso de ingesta.

#### Caché Híbrido Persistente: 
Siguiendo la restricción de "ser amables con ZipWho", implementé una tabla zip_cache en SQLite. 

#### SQL Dinámico vs ORM: 
Evité el uso de ORMs pesados. Las consultas se construyen dinámicamente con better-sqlite3 para maximizar la velocidad de ejecución y tener control total sobre los índices.

#### Separation of Concerns: 
El código está desacoplado siguiendo patrones de servicio para que la lógica de scraping no contamine las rutas de la API.

## 🛠️ Stack

    Runtime: Node.js (TypeScript).

    Framework: Fastify.

    DB: SQLite better-sqlite3.

    Scraping: Cheerio.

## 🚀 Guía de Inicio Rápido

### 1. Instalación
```bash
npm install
```
### 2. Ingesta de Datos (ETL)

Este proceso descarga el CSV de S3, mapea estados, calcula métricas (precio por acre/sqft) y crea la DB.
Bash
```bash
npm run ingest
```
### 3. Ejecución del Servidor
Bash
```bash
npm run dev
```
### 4. Documentación y Pruebas

Accede a la documentación interactiva de Swagger:
👉 http://localhost:3000/docs
Pruebas de Calidad (Smoke Tests)

Para validar la integridad de la base de datos, la conectividad del Scraper y el enriquecimiento de datos:
Bash
```bash
npm run smoke-test
```