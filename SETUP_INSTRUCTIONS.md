# Guía de Configuración del Entorno - TalentAI Pro

¡Hola! He detectado que **Node.js** no está instalado o configurado correctamente en tu sistema. Esto es la causa de las "líneas rojas" y errores que ves en el código.

Sigue estos pasos para solucionar el problema definitivamente:

## Paso 1: Instalar Node.js
TalentAI Pro es una aplicación moderna que requiere Node.js para funcionar.

1.  Ve al sitio oficial: [https://nodejs.org/](https://nodejs.org/)
2.  Descarga la versión **LTS** (actualmente v20.x o v22.x recomenda).
3.  Ejecuta el instalador.
4.  **IMPORTANTE**: Durante la instalación, asegúrate de marcar la casilla que dice:
    - `[x] Add to PATH` (normalmente está marcada por defecto).
5.  Una vez finalizado, **reinicia tu computadora** para asegurar que los cambios surtan efecto.

## Paso 2: Verificar la Instalación
1.  Abre una terminal (PowerShell o CMD).
2.  Escribe `node -v` y presiona Enter. Deberías ver un número de versión (ej. `v20.11.0`).
3.  Escribe `npm -v` y presiona Enter. Deberías ver otro número (ej. `10.2.4`).

## Paso 3: Instalar Dependencias del Proyecto
Una vez que tengas Node.js:

1.  Abre la carpeta del proyecto en la terminal.
2.  Ejecuta el siguiente comando:
    ```bash
    npm install
    ```
    *(O simplemente haz doble clic en el archivo `install_dependencies.bat` que he creado en tu escritorio)*.

3.  Espera a que termine. Esto descargará todas las librerías necesarias (`react`, `next`, `shadcn`, etc.) y creará la carpeta `node_modules`.

## Paso 4: Iniciar la Aplicación
Cuando `npm install` termine sin errores:

1.  Ejecuta:
    ```bash
    npm run dev
    ```
2.  Abre tu navegador en `http://localhost:3000`.

---
**Nota**: Si sigues viendo líneas rojas en VS Code después de hacer esto, intenta cerrar y volver a abrir VS Code, o presiona `Ctrl+Shift+P` y busca "TypeScript: Restart TS Server".
