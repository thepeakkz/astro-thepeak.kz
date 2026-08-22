# Astro staging, cutover and rollback runbook

## Required staging configuration

1. Deploy the repository root as the legacy Next.js project on `legacy-admin.thepeak.kz`.
2. Deploy `apps/astro-site` as a separate Vercel project and copy the public runtime variables listed in `.env.example` plus Supabase, R2, Telegram and analytics values.
3. Keep Production, Preview and Development variable scopes separate. Never expose R2 secret keys or Telegram tokens through `PUBLIC_` variables.
4. Verify that `/admin`, `/admin/login` and `/api/admin/*` are served by the legacy origin and that its auth cookies remain scoped correctly.
5. Run `npm run astro:check`, `npm run astro:build`, `npm test`, `npm run typecheck` and the staging Playwright suite.

## Dry run

1. Capture the production Git SHA, Vercel deployment IDs, DNS export, Supabase project ID, R2 object count and current sitemap.
2. Create and verify the Git bundle, Supabase dump and R2 checksum backup described in `thepeak-astro-migration-plan.md`.
3. Route a staging hostname to Astro. Test desktop/mobile viewports, forms, UTM attribution, page-view events, every case gallery and 50 client-side navigation cycles.
4. Rehearse switching the staging alias back to Next.js and record elapsed time. The target rollback time is under 30 minutes.

## Production cutover

1. Announce a 15–30 minute content freeze and take the final database dump (RPO at most 15 minutes).
2. Confirm a green Astro deployment and a green legacy admin deployment.
3. Switch the production domain alias to Astro. Do not change Supabase or R2 data.
4. Smoke-test `/`, `/cases`, two case pages, `/privacy`, `/services/web`, a real form submission, `/admin/login`, authenticated `/admin`, `sitemap.xml` and `robots.txt`.
5. Monitor 404 rate, lead inserts, Telegram notifications, admin authentication, R2 media errors and WebGL/client exceptions.

## Immediate rollback

Rollback on mass 404s, failed lead capture, admin login failure, R2 upload failure or critical WebGL crashes. Move the production domain alias back to the retained Next.js deployment. Database restore is not required unless data was physically damaged. Retain the previous deployment and Cloudinary assets for at least 60–90 days.
