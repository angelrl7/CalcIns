# CalcIns — Calculadora de Bolo de Insulina

PWA mobile-first para calcular dosis de insulina en bolo. Funciona offline, es instalable en el celular y no tiene backend.

## Aviso médico importante

Esta app es una herramienta de apoyo personal. **No reemplaza al criterio de tu equipo médico.** Los parámetros (ICR, FSI, objetivo) son indicados por tu endocrinólogo o diabetólogo. Ante valores inesperados, no inyectar y consultar.

---

## Fórmula aplicada

```
boloComida      = carbohidratos / ICR
boloCorreción   = max(0, (glucemia − objetivo) / FSI)
dosisTotal      = max(0, boloComida + boloCorreción − IOB)
dosisFinal      = round(dosisTotal, paso)          // paso: 0.5u o 1u
```

### Reglas de seguridad implementadas

| Regla | Comportamiento |
|-------|----------------|
| Insulina basal seleccionada | Bloquea el cálculo con mensaje explicativo |
| Glucemia < umbral de hipo | Bloquea el cálculo, pide tratar la baja primero |
| Corrección negativa | Se fija en 0 (nunca resta del bolo de comida) |
| Dosis total negativa | Se fija en 0 |
| Dosis supera tope de alerta | Muestra aviso visible sin bloquear |
| Parámetros sin configurar | Bloquea el cálculo con mensaje |
| Desglose | Siempre visible: bolo comida, corrección, IOB restado, total |

---

## Instalación y desarrollo local

```bash
git clone <url-del-repo>
cd calcins
npm install
npm run dev
```

La app corre en `http://localhost:5173`.

### Tests

```bash
npm test          # Corre todos los tests una vez
npm run test:watch # Modo watch
```

Los tests cubren las 7 reglas de seguridad en `src/lib/bolus.test.ts`.

### Regenerar íconos PWA

Si cambiás el favicon:

```bash
node scripts/generate-icons.mjs
```

---

## Deploy en Vercel

### Opción A — Desde GitHub (recomendado)

1. Subí el proyecto a un repositorio GitHub.
2. Entrá a [vercel.com](https://vercel.com) → **Add New Project**.
3. Importá el repositorio.
4. Vercel detecta automáticamente Vite:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
5. Clic en **Deploy**. Cada push a `main` redespliega automáticamente.

### Opción B — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel         # deploy de preview
vercel --prod  # deploy de producción
```

### vercel.json (incluido)

El archivo `vercel.json` ya está configurado para servir la SPA correctamente con fallback a `index.html`.

---

## Stack

- **Vite 8** + **React 19** + **TypeScript 6**
- **Tailwind CSS 4** (vía `@tailwindcss/vite`)
- **vite-plugin-pwa** — service worker con Workbox, modo offline completo
- **Vitest** — tests unitarios
- **localStorage** — persistencia de parámetros e historial
- Sin backend, sin dependencias de runtime externas

## Estructura del proyecto

```
src/
  lib/
    bolus.ts          # Lógica de cálculo + catálogo de insulinas (sin UI)
    bolus.test.ts     # Tests unitarios de las reglas de seguridad
    storage.ts        # Persistencia localStorage (parámetros, historial)
  components/
    ParametersPanel.tsx  # ICR, FSI, objetivo, paso, umbrales
    CalculatorForm.tsx   # Insulina, glucemia, carbos, IOB
    ResultPanel.tsx      # Resultado con desglose y botón registrar
    HistoryPanel.tsx     # Historial con export/import JSON
  App.tsx             # Orquestador de estado y tabs
  main.tsx            # Entry point React
  index.css           # Tailwind v4 + utilidades PWA
public/
  favicon.svg
  icons/
    icon-192.png
    icon-512.png
scripts/
  generate-icons.mjs  # Genera los PNGs desde el SVG (requiere sharp)
```
