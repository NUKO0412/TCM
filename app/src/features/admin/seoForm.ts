import { SEO_CANONICAL, SEO_PAGE, seoSnapshot } from '../../config/seoSnapshot'
import type { SeoData } from '../../config/business'

export type SeoFormState = {
  page: string
  title: string
  h1: string
  description: string
  keywords: string
  canonical: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  structuredData: string
  geoAreaServed: string
  geoServices: string
}

function joinList(values?: string[]) {
  return values?.join(', ') ?? ''
}

function prettyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

export function toSeoForm(seo: SeoData | null): SeoFormState {
  const source = seo ?? seoSnapshot
  return {
    page: SEO_PAGE,
    title: source.title ?? '',
    h1: source.h1 ?? '',
    description: source.description ?? '',
    keywords: joinList(source.keywords),
    canonical: source.canonical ?? SEO_CANONICAL,
    ogTitle: source.og?.title ?? '',
    ogDescription: source.og?.description ?? '',
    ogImage: source.og?.image ?? '',
    twitterTitle: source.twitter?.title ?? source.og?.title ?? '',
    twitterDescription: source.twitter?.description ?? source.og?.description ?? '',
    twitterImage: source.twitter?.image ?? source.og?.image ?? '',
    structuredData: prettyJson(source.structuredData),
    geoAreaServed: joinList(source.geo?.areaServed),
    geoServices: joinList(source.geo?.services),
  }
}

export function splitSeoList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}
