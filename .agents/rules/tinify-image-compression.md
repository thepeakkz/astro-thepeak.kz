# Tinify Image Compression & WebP Rules

All website images and media upload workflows must adhere to the following constraints:

1. **Mandatory WebP Format**:
   - Every image uploaded to or served on the website must be in `.webp` format.

2. **Tinify Compression & Free Quota Protection (500/month)**:
   - Account is on the **Free Tier (500 compressions/month)**.
   - **No Bulk Re-processing**: Do not execute batch re-compression scripts on already compressed images. Only process new incoming uploads.
   - **Graceful Fallback**: If Tinify returns a quota error (`429` / quota exceeded), the code must fall back to saving the standard WebP file without throwing an error or interrupting the user's upload flow.
   - Use `process.env.TINIFY_API_KEY` configured in `.env.local`.

3. **Automatic CMS Pipeline**:
   - Media upload routes (e.g. `/api/admin/media/*`) must handle image optimization transparently while protecting the free quota limit.
