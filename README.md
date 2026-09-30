# Four Link Site — Cloudflare Pages + Pages Function

Minimal four-button website with server-side primary/fallback redirects.

## Files

- `index.html` — four buttons only
- `styles.css` — simple responsive design
- `functions/go/[id].js` — server-side fallback logic
- `_routes.json` — invokes the Function only for `/go/*`

## Add your URLs

Open `functions/go/[id].js` and replace each `primary` and `fallback` URL.
You do not need to change the button `href` values.

## Fallback behavior

Button 1 → `/go/1`
Button 2 → `/go/2`
Button 3 → `/go/3`
Button 4 → `/go/4`

For each request, Cloudflare checks the primary destination server-side. It uses `HEAD` first. If the server rejects `HEAD` with 405/501, it retries with `GET`. If the primary gives a final 2xx response, the user is redirected to it. If the request fails or times out, the user is redirected to the fallback URL.

The timeout is 2.5 seconds to keep failed links from making the user wait unnecessarily long.

## Important limitation

This solves the browser-side CORS limitation of a pure JavaScript solution. It does not provide a universal guarantee for user-specific failures such as an ISP blocking the primary site after Cloudflare has successfully reached it.

## Deploy through GitHub

1. Create a GitHub repository and upload all project files to its root.
2. Create/sign in to a Cloudflare account.
3. Open Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
4. Authorize GitHub and select the repository.
5. Select your production branch, normally `main`.
6. This is a plain HTML/CSS/Functions project, so no framework is required. Leave the build command blank. Use the repository root as the build/output directory when the UI asks for it.
7. Deploy.
8. Cloudflare will give the project a free `*.pages.dev` URL. A custom domain is optional.

After deployment, opening the four buttons will use the `/go/*` Pages Function for the fallback check.
