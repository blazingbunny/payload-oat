import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Users } from './collections/Users'
import { Tenants } from './collections/Tenants'
import { Person } from './collections/Person'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Tenants, Person, Media],
  secret: process.env.PAYLOAD_SECRET || '',
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM || 'onboarding@resend.dev',
    defaultFromName: 'Adrian Payload',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      clientUploads: true,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename }: { filename: string }) =>
            `https://${process.env.NEXT_PUBLIC_FIRST_TENANT_DOMAIN ?? 'adriandelrosario.com'}/${filename}`,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
    multiTenantPlugin({
      collections: {
        person: {},
        media: {},
      },
      tenantsSlug: 'tenants',
      userHasAccessToAllTenants: () => true,
    }),
    seoPlugin({
      collections: ['person'],
      generateTitle: ({ doc }) => `${doc?.name ?? ''} — ${doc?.jobTitle ?? ''}`,
      generateDescription: ({ doc }) => doc?.description ?? '',
      generateURL: ({ doc }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/${doc?.id ?? ''}`,
    }),
  ],
})
