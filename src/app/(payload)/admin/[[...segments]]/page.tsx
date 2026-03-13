import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
export const generateMetadata = ({ params }: any): Promise<Metadata> => generatePageMetadata({ config, params })
export default function Page({ params, searchParams }: any) {
  return RootPage({ config, params, searchParams })
}
