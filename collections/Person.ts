import type { CollectionConfig } from 'payload'

// Schema.org/Person — field slugs mirror Schema.org property names 1:1
// JSON-LD keys match Payload field slugs — no translation layer
export const Person: CollectionConfig = {
  slug: 'person',
  admin: {
    useAsTitle: 'name',
    description: 'Schema.org/Person record — one per tenant',
    defaultColumns: ['name', 'jobTitle', 'updatedAt'],
    components: {
      beforeList: ['./components/admin/CollectionHeader#PersonHeader'],
    },
  },
  fields: [
    // ── Core identity ─────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'schema:name — full legal or professional name' },
    },
    {
      name: 'jobTitle',
      type: 'text',
      admin: { description: 'schema:jobTitle — primary professional title' },
    },
    {
      name: 'tagline',
      type: 'text',
      admin: { description: 'Short positioning statement for hero section (not Schema.org native)' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'schema:description — professional bio (plain text, used in JSON-LD and meta)' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'schema:image — primary profile photo' },
    },

    // ── Contact & web presence ────────────────────────────────────
    {
      name: 'url',
      type: 'text',
      admin: { description: 'schema:url — canonical personal website URL' },
    },
    {
      name: 'email',
      type: 'email',
      admin: { description: 'schema:email — public contact email' },
    },
    {
      name: 'telephone',
      type: 'text',
      admin: { description: 'schema:telephone — public contact number' },
    },
    {
      name: 'sameAs',
      type: 'array',
      admin: { description: 'schema:sameAs — social profile URLs (LinkedIn, Twitter/X, GitHub…)' },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: { placeholder: 'https://linkedin.com/in/yourname' },
        },
        {
          name: 'label',
          type: 'text',
          admin: { placeholder: 'LinkedIn' },
        },
      ],
    },

    // ── Work & occupation ─────────────────────────────────────────
    {
      name: 'worksFor',
      type: 'group',
      admin: { description: 'schema:worksFor — current primary employer/organisation' },
      fields: [
        { name: 'name', label: 'Organisation name', type: 'text' },
        { name: 'url', label: 'Organisation URL', type: 'text' },
      ],
    },
    {
      name: 'hasOccupation',
      type: 'array',
      admin: { description: 'schema:hasOccupation — occupation history / current roles' },
      fields: [
        { name: 'name', label: 'Role / title', type: 'text', required: true },
        { name: 'organization', label: 'Organisation', type: 'text' },
        { name: 'startDate', label: 'Start date', type: 'date' },
        { name: 'endDate', label: 'End date (leave blank if current)', type: 'date' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ],
    },

    // ── Credentials ───────────────────────────────────────────────
    {
      name: 'alumniOf',
      type: 'array',
      admin: { description: 'schema:alumniOf — educational institutions attended' },
      fields: [
        { name: 'name', label: 'Institution name', type: 'text', required: true },
        { name: 'degree', label: 'Degree / qualification', type: 'text' },
        { name: 'startDate', label: 'Start date', type: 'date' },
        { name: 'endDate', label: 'End date', type: 'date' },
        { name: 'url', label: 'Institution URL', type: 'text' },
      ],
    },
    {
      name: 'hasCredential',
      type: 'array',
      admin: { description: 'schema:hasCredential — certifications, licences, professional credentials' },
      fields: [
        { name: 'name', label: 'Credential name', type: 'text', required: true },
        { name: 'issuedBy', label: 'Issuing organisation', type: 'text' },
        { name: 'dateIssued', label: 'Date issued', type: 'date' },
        { name: 'url', label: 'Verification URL', type: 'text' },
      ],
    },
    {
      name: 'award',
      type: 'array',
      admin: { description: 'schema:award — awards and recognitions' },
      fields: [
        { name: 'name', label: 'Award name', type: 'text', required: true },
        { name: 'issuedBy', label: 'Awarding body', type: 'text' },
        { name: 'date', label: 'Date awarded', type: 'date' },
        { name: 'url', label: 'Award URL', type: 'text' },
      ],
    },

    // ── Expertise ─────────────────────────────────────────────────
    {
      name: 'knowsAbout',
      type: 'array',
      admin: { description: 'schema:knowsAbout — topics, skills, and subject-matter expertise' },
      fields: [
        { name: 'topic', type: 'text', required: true },
        {
          name: 'level',
          type: 'select',
          options: [
            { label: 'Expert', value: 'expert' },
            { label: 'Advanced', value: 'advanced' },
            { label: 'Intermediate', value: 'intermediate' },
          ],
          defaultValue: 'expert',
        },
      ],
    },

    // ── Reviews & ratings ─────────────────────────────────────────
    {
      name: 'aggregateRating',
      type: 'group',
      admin: { description: 'schema:aggregateRating — summary rating (e.g. from Google/Yelp)' },
      fields: [
        { name: 'ratingValue', label: 'Rating (e.g. 4.9)', type: 'number' },
        { name: 'reviewCount', label: 'Review count', type: 'number' },
        { name: 'bestRating', label: 'Best possible rating', type: 'number', defaultValue: 5 },
      ],
    },
    {
      name: 'review',
      type: 'array',
      admin: { description: 'schema:review — individual reviews / testimonials' },
      fields: [
        { name: 'author', label: 'Author name', type: 'text', required: true },
        { name: 'reviewBody', label: 'Review text', type: 'textarea' },
        { name: 'ratingValue', label: 'Star rating (1–5)', type: 'number' },
        { name: 'datePublished', label: 'Date', type: 'date' },
        { name: 'isTestimonial', label: 'Display as testimonial (not schema:review)', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
