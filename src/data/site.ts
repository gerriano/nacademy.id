export const site = {
  name: 'Nacademy',
  url: 'https://nacademy.id',
  tagline: 'Kendalikan stres dan kecemasan, dengan metode yang seru.',
  description:
    'Nacademy membuat guidebook interaktif ala infografis untuk membantu kamu mengenali, memahami, dan mengendalikan stres serta kecemasan sehari-hari.',
  instagram: 'https://www.instagram.com/nacademy.id',
  instagramHandle: '@nacademy.id',
  locale: 'id_ID',
  // Cloudflare Worker endpoint for the contact form. Set PUBLIC_FORM_ENDPOINT
  // at build time (see README). Empty = form shows a "not configured" note.
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT ?? '',
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '',
};

export const nav = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang/', label: 'Tentang' },
  { href: '/pendekatan/', label: 'Pendekatan' },
  { href: '/karya/', label: 'Karya' },
  { href: '/jurnal/', label: 'Jurnal' },
  { href: '/kontak/', label: 'Kontak' },
];
