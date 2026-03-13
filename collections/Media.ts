import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'filename',
    description: 'Images and uploads — always upload from entityhome.digital/admin',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
    components: {
      beforeList: ['./components/admin/CollectionHeader#MediaHeader'],
    },
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
