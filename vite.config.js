import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * SEO at build time. Set SITE_URL (e.g. in .env or the hosting dashboard) to the live
 * domain, such as https://kasimhusain.com, and the build adds the canonical link, og:url,
 * og:image / twitter:image and a sitemap. Without it the build still works and emits a
 * robots.txt, but share cards will have no image (they need absolute URLs).
 */
function seo(siteUrl) {
  const base = siteUrl ? siteUrl.replace(/\/+$/, '') : ''
  return {
    name: 'portfolio-seo',
    transformIndexHtml() {
      if (!base) return []
      const meta = (attrs) => ({ tag: 'meta', attrs, injectTo: 'head' })
      return [
        { tag: 'link', attrs: { rel: 'canonical', href: `${base}/` }, injectTo: 'head' },
        meta({ property: 'og:url', content: `${base}/` }),
        meta({ property: 'og:image', content: `${base}/og-image.png` }),
        meta({ name: 'twitter:image', content: `${base}/og-image.png` }),
      ]
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', base && `Sitemap: ${base}/sitemap.xml`].filter(Boolean).join('\n')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots}\n` })
      if (base) {
        const today = new Date().toISOString().slice(0, 10)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), seo(env.SITE_URL)],
    build: {
      // three.js core is ~730 kB minified (190 kB gzipped) and is only loaded with the 3D scene
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            'three-core': ['three'],
            'three-fiber': ['@react-three/fiber'],
            'three-drei': ['@react-three/drei'],
            animation: ['framer-motion'],
            scroll: ['lenis'],
          },
        },
      },
    },
  }
})
