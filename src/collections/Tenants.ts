import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug for this tenant (e.g. adriandelrosario)',
      },
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Custom domain (e.g. adriandelrosario.com)',
      },
    },
    {
      name: 'professionPack',
      type: 'select',
      options: [
        { label: 'SEO Specialist', value: 'seo-specialist' },
        { label: 'General', value: 'general' },
      ],
      defaultValue: 'general',
    },
    {
      name: 'htmlTemplate',
      type: 'textarea',
      admin: {
        description: 'Go html/template source used by oat server. Leave empty to use default template.',
        rows: 20,
      },
    },
  ],
}
