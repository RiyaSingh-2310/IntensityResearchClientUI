# Intensity Research — Client UI

Panelist web app for [Intensity Research](https://intensityresearch.com/): registration with profile questions, email verification, login, assigned surveys, points, payout requests, and profile settings.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, and React Router.

## Getting started

```bash
npm install
npm run dev
```

| Script            | Purpose                               |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server             |
| `npm run build`   | Type-check and build to `dist/`       |
| `npm run lint`    | Run ESLint                            |
| `npm run preview` | Preview the production build locally  |

## Configuration

Optional environment variables (for example in `.env.local`):

| Variable              | Default                                     |
| --------------------- | ------------------------------------------- |
| `VITE_API_BASE_URL`   | `https://intensityresearch.com/intensityapi` |
| `VITE_CLIENT_BASE_URL`| Current browser origin                      |

API reference: <https://intensityresearch.com/intensityapi/docs/>

## Project structure

- `src/services/` — API calls (`http.ts` handles the response envelope, auth token, and 401 handling)
- `src/lib/` — mapping and helpers shared by pages
- `src/content/` and `src/config/brand.ts` — page copy and brand details
- `src/components/` — UI primitives (`ui/`), layout, and feature components
- `src/pages/` — public, auth, and panelist pages

Static hosting rewrites for client-side routing are included in `public/` (`_redirects`, `staticwebapp.config.json`, `web.config`).
