import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'slug',
    description: 'Client sites — each with their own domain, status, and HTML template',
    defaultColumns: ['slug', 'domain', 'professionPack', 'status'],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier — used for subdomain routing (slug.yourdomain.com)',
      },
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Custom domain (e.g. janesmith.com) — leave blank until provisioned',
      },
    },
    {
      name: 'professionPack',
      type: 'select',
      defaultValue: 'seo-specialist',
      options: [
        { label: 'SEO Specialist', value: 'seo-specialist' },
        { label: 'Physician', value: 'physician' },
        { label: 'Attorney', value: 'attorney' },
        { label: 'Athlete', value: 'athlete' },
        { label: 'Executive', value: 'executive' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'htmlTemplate',
      type: 'code',
      admin: {
        language: 'html',
        description: 'Custom HTML template rendered by the oat server. Use {{.FieldName}} for person data.',
      },
    },
  ],
}
