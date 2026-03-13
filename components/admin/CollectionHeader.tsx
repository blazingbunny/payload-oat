'use client'

import type React from 'react'
import '../../styles/admin.css'

type Props = {
  title: string
  description: string
  action?: { href: string; label: string }
}

function CollectionHeader({ title, description, action }: Props) {
  return (
    <div className="admin collection-header">
      <div>
        <p className="collection-title">{title}</p>
        <p className="collection-description">{description}</p>
      </div>
      {action && (
        <a href={action.href} className="collection-action">
          + {action.label}
        </a>
      )}
    </div>
  )
}

export function PersonHeader() {
  return (
    <CollectionHeader
      title="Person"
      description="Schema.org/Person records — one per tenant"
    />
  )
}

export function MediaHeader() {
  return (
    <CollectionHeader
      title="Media"
      description="Images and uploads — always upload from entityhome.digital/admin"
    />
  )
}

export function TenantsHeader() {
  return (
    <CollectionHeader
      title="Tenants"
      description="Client sites — each with their own domain, theme, and profession pack"
      action={{ href: '/admin/collections/tenants/create', label: 'New Tenant' }}
    />
  )
}
