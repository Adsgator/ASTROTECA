/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string
  readonly PUBLIC_SITE_NAME: string
  readonly PUBLIC_GTM_ID: string
  readonly PUBLIC_WA_NUMBER: string
  readonly PUBLIC_WA_MESSAGE: string
  readonly PUBLIC_SEO_TITLE: string
  readonly PUBLIC_SEO_DESCRIPTION: string
  readonly PUBLIC_SEO_KEYWORDS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
