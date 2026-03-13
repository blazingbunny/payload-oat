import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'filename',
    description: 'Images and uploads',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alt text for accessibility and SEO',
      },
    },
  ],
}
