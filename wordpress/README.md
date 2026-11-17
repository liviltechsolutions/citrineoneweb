# Citrine One WordPress back office

This repository keeps the current Citrine One single-page frontend and includes the WordPress plugin source. GitHub Pages serves the static frontend; it does not run WordPress or PHP. The CMS becomes live when this plugin is installed on a public WordPress host and the frontend API setting is pointed at it.

## Plugin

Install `citrine-headless/citrine-headless.php` as a plugin in WordPress and activate **Citrine One Headless Content**. It creates a **Citrine Content** area with content sections for services, programmes, people, insights, books, initiatives and partners. On activation it creates suggested starter items as drafts; these are not visible to the frontend until an editor approves and publishes them.

Each item uses the title, body, excerpt, optional featured image, content section, label, role, link details, sort order and portfolio lines. The API is `https://YOUR-WORDPRESS/wp-json/citrine/v1/content`. The response contains published content only. Configure allowed frontend origins under **Settings → Citrine Headless**.

## Frontend connection

The frontend reads `cms-config.js`. Its default API points to local WordPress at `http://127.0.0.1:9400`. Change `window.CITRINE_CMS_API` to the deployed WordPress API URL when hosting is ready. You can also temporarily override it with `?cmsApi=https%3A%2F%2Fcms.example.com%2Fwp-json%2Fcitrine%2Fv1%2Fcontent`.

When API data is available, published services, programmes, books and social-enterprise initiatives replace their matching static lists. When WordPress is offline or has no published items in a section, the existing Citrine frontend content stays in place.

## Local WordPress

Use WordPress Playground CLI (Node.js 20.18+). From `C:\CitrineOne`:

```powershell
npx @wp-playground/cli start --path=./wordpress/citrine-headless --blueprint=./wordpress/citrine-blueprint.json --port=9400
```

Open `http://127.0.0.1:9400/wp-admin/`. Playground auto logs in as the local admin, and the Blueprint activates the plugin and seeds draft content.

Serve the frontend separately from `C:\CitrineOne`, for example with VS Code Live Server on port 5500, which is allowed by the plugin default CORS configuration. Production WordPress needs a hosted PHP/MySQL-compatible WordPress environment; a static GitHub Pages site cannot run WordPress itself.

## Before launch

Review every seeded draft, biography, partner relationship, image and reuse permission with Citrine. Add the production CMS origin to the allowed origins. Set up HTTPS, backups, least-privilege editor accounts and an approved privacy/form workflow with the hosting provider.
