/**
 * Content Security Policy.
 *
 * Next's App Router injects inline bootstrap scripts and next/font injects an
 * inline style block, so 'unsafe-inline' is unavoidable for script-src and
 * style-src without wiring a per-request nonce through every response. The
 * directives that actually contain an XSS — no object, no base tag hijack, no
 * framing, and a connect/img allow-list — are all pinned.
 */
const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is dev-only: Next's HMR needs it, production does not.
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // Cloudinary serves every uploaded image; blob: covers upload previews.
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "media-src 'self' https://res.cloudinary.com",
  // The browser uploads straight to Cloudinary, so it must be allowed here.
  "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com",
  // The contact section embeds a Google Maps iframe.
  'frame-src https://www.google.com https://maps.google.com',
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Two years, preloadable. Only sent over HTTPS, so local HTTP is unaffected.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Cloudinary is the only host we serve images from.
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // The admin is never cached and never indexed, wherever it is served.
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
