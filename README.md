# Citrine One website concept

The site is a responsive, single-page frontend published with GitHub Pages. Its editable content is stored in [`data/homepage.json`](data/homepage.json). The Pages CMS schema is in [`.pages.yml`](.pages.yml).

## Open the CMS

1. Go to [Pages CMS](https://app.pagescms.org/) and sign in with the GitHub account that owns `liviltechsolutions/citrineoneweb`.
2. Install/authorize the Pages CMS GitHub App for this repository when prompted.
3. Choose `citrineoneweb`, open **Citrine One homepage**, and edit the labeled fields.
4. Save the changes. Pages CMS commits the content and uploaded images to this GitHub repository. GitHub Pages then republishes the site.

Editors need repository access or must be invited as Pages CMS collaborators. Do not share a personal access token. Image uploads are stored in the repository under `assets/`.

## What editors can change

The CMS includes the hero, company introduction, people and biographies, profile photos, collaborators, services, C-suite programmes, insights and article links, books, social enterprise initiatives, contact information and privacy draft. Updates to this content file appear on the frontend after the GitHub Pages deployment completes.

The CMS manages website content and images. Layout, typography, colors, navigation structure and responsive behavior remain in `index.html`, `styles.css` and `cms.js`; design changes are made in code and pushed to GitHub.

To preview locally, serve the repository root (for example, use VS Code Live Server) and open the local page. The site uses its embedded content if the JSON file cannot be loaded.

## RFP alignment and approvals

The RFP leaves the CMS and hosting choice open and asks vendors to justify a recommendation. Pages CMS is the current GitHub-backed concept for content editing, not a platform specified by Citrine. See [RFP coverage and launch dependencies](RFP-COVERAGE.md) for the complete scope and approval items.

Names, titles, affiliations, partner agreements, photos and claims still require Citrine approval before publication. The enquiry form is a preview that opens the visitor's email application; production form delivery, privacy, analytics, hosting, backups and support need final approval and setup.
