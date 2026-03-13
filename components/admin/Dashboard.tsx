'use client'

import type React from 'react'
import type { AdminViewProps } from 'payload'
import { User, Building2, ImageIcon, ExternalLink, Plus, AlertCircle } from 'lucide-react'
import '../../styles/admin.css'

const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN ?? 'entityhome.digital'
const tenantDomain = process.env.NEXT_PUBLIC_FIRST_TENANT_DOMAIN ?? 'adriandelrosario.com'

type Item = { href: string; label: string; meta: string; Icon: React.ElementType; external?: boolean }
type Section = { label: string; items: Item[] }

const sections: Section[] = [
  {
    label: 'Content',
    items: [
      { href: '/admin/collections/person/1',      label: 'Your Profile', meta: 'Schema.org Person record', Icon: User },
      { href: '/admin/collections/media',          label: 'Media',        meta: 'Images and uploads',       Icon: ImageIcon },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/admin/collections/tenants/create', label: 'New Tenant',   meta: 'Onboard a client',         Icon: Plus },
      { href: '/admin/collections/tenants',         label: 'Tenants',      meta: 'Domains, themes, packs',   Icon: Building2 },
    ],
  },
  {
    label: 'Live',
    items: [
      { href: `https://${tenantDomain}`, label: tenantDomain, meta: 'Public profile', Icon: ExternalLink, external: true },
    ],
  },
]

export function Dashboard(_props: AdminViewProps) {
  return (
    <div className="admin admin-dashboard">

      <p className="dashboard-title">Entity Home</p>
      <p className="dashboard-subtitle">Adrian — {adminDomain}</p>

      <div className="dashboard-notice">
        <AlertCircle size={13} className="dashboard-notice-icon" />
        <span>Always upload media from <strong>{adminDomain}/admin</strong></span>
      </div>

      <div className="dashboard-sections">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="dashboard-section-header">
              <span className="dashboard-section-label">{section.label}</span>
              <span className="dashboard-section-count">{section.items.length}</span>
            </div>
            {section.items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="dashboard-row"
              >
                <item.Icon size={14} className="dashboard-row-icon" />
                <span className="dashboard-row-label">{item.label}</span>
                <span className="dashboard-row-meta">{item.meta}</span>
              </a>
            ))}
          </div>
        ))}
      </div>

    </div>
  )
}
