import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const IMAGE_EXTENSIONS = 'jpg|jpeg|png|gif|webp|svg|avif|ico'

const nextConfig: NextConfig = {
  async rewrites() {
    // Derive Blob store base URL from token at build time
    const storeId = process.env.BLOB_READ_WRITE_TOKEN
      ?.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]
      ?.toLowerCase()

    if (!storeId) return []

    return [
      {
        // /{filename.ext} → Vercel Blob CDN (proxied via Vercel edge, cached)
        source: `/:filename([^/]+\\.(?:${IMAGE_EXTENSIONS}))`,
        destination: `https://${storeId}.public.blob.vercel-storage.com/:filename`,
      },
    ]
  },
}

export default withPayload(nextConfig)
