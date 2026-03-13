import type { CollectionConfig } from 'payload'

export const Person: CollectionConfig = {
  slug: 'person',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    // --- Core Schema.org/Person fields ---
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'jobTitle',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'telephone',
      type: 'text',
    },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Canonical personal URL' },
    },
    // --- worksFor (Organization) ---
    {
      name: 'worksFor',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text' },
      ],
    },
    // --- alumniOf (EducationalOrganization) ---
    {
      name: 'alumniOf',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text' },
        { name: 'startDate', type: 'text' },
        { name: 'endDate', type: 'text' },
        { name: 'studyField', type: 'text' },
        { name: 'degree', type: 'text' },
      ],
    },
    // --- hasCredential ---
    {
      name: 'hasCredential',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text' },
        { name: 'issuedBy', type: 'text' },
        { name: 'dateIssued', type: 'text' },
      ],
    },
    // --- hasOccupation ---
    {
      name: 'hasOccupation',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'skills', type: 'text', admin: { description: 'Comma-separated skills' } },
      ],
    },
    // --- knowsAbout ---
    {
      name: 'knowsAbout',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'url', type: 'text' },
      ],
    },
    // --- award ---
    {
      name: 'award',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'year', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    // --- sameAs (social/identity links) ---
    {
      name: 'sameAs',
      type: 'array',
      fields: [
        { name: 'url', type: 'text', required: true },
        { name: 'label', type: 'text', admin: { description: 'e.g. LinkedIn, Twitter, GitHub' } },
      ],
    },
    // --- Review / testimonials ---
    {
      name: 'review',
      type: 'array',
      fields: [
        { name: 'author', type: 'text', required: true },
        { name: 'reviewBody', type: 'textarea' },
        { name: 'ratingValue', type: 'number', min: 1, max: 5 },
        { name: 'datePublished', type: 'text' },
      ],
    },
  ],
}
