'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { User, Building2, ImageIcon, ExternalLink, Plus, LayoutDashboard, ChevronDown } from 'lucide-react'
import '../../styles/payload-admin-override.css'
import '../../styles/admin.css'

const tenantDomain = process.env.NEXT_PUBLIC_FIRST_TENANT_DOMAIN ?? 'adriandelrosario.com'

const workspaceItems = [
  { href: '/admin',                      label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/collections/person/1', label: 'Profile',   Icon: User },
  { href: '/admin/collections/media',    label: 'Media',     Icon: ImageIcon },
]

const platformItems = [
  { href: '/admin/collections/tenants',        label: 'Tenants',    Icon: Building2 },
  { href: '/admin/collections/tenants/create', label: 'New Tenant', Icon: Plus },
]

function NavItem({ href, label, Icon, active }: {
  href: string
  label: string
  Icon: React.ElementType
  active: boolean
}) {
  return (
    <a
      href={href}
      className={`nav-item${active ? ' nav-item--active' : ''}`}
    >
      <Icon size={15} className="nav-item-icon" />
      {label}
    </a>
  )
}

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="admin admin-nav">

      <div className="nav-brand">
        <img src="/logo.png" alt="Entity Home" className="nav-logo" />
        <span className="nav-workspace-name">Entity Home</span>
        <ChevronDown size={13} className="nav-chevron" />
      </div>

      <span className="nav-section-label">Workspace</span>
      {workspaceItems.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          active={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
        />
      ))}

      <span className="nav-section-label">Platform</span>
      {platformItems.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          active={pathname === item.href}
        />
      ))}

      <div className="nav-footer">
        <a href={`https://${tenantDomain}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={13} />
          {tenantDomain}
        </a>
      </div>

    </nav>
  )
}
