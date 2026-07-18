// scripts/site.config.js
// Gerado pelo Workr Lite CMS — não editar manualmente.
export const siteConfig = {

  company: {
    name:        "Riweb",
    nameShort:   "Riweb",
    description: 'Relações com Investidores — Riweb.',
    logoOriginal: '/assets/logotipo/logotipo-original.webp',
    logoNegative: '/assets/logotipo/logotipo-negative.webp',
    logoContrast: '/assets/logotipo/logotipo-negative.webp',
    favicon:      '/favicon.svg',
  },

  colors: {
    primary:   undefined,
    secondary: undefined,
    tertiary:  undefined,
  },

  fonts: {
    display: undefined,
    body:    undefined,
  },

  ticker: {
    type:      "static",
    iframeUrl: "",
    items: [
      { symbol: 'WRLT3', price: 'R$ 00,00', change: '0,00%', direction: 'up' }
    ],
  },

  nav: [
    { id: "central-resultados", label: "Canal teste", href: "/central-resultados.html", children: [] },
    { id: "docs-cvm", label: "Documentos CVM", href: "/documentos-cvm.html", children: [] },
    { id: "fale-ri", label: "Fale com RI", href: "/fale-com-ri.html", children: [] },
    { id: "mailing", label: "Mailing", href: "/mailing.html", children: [] },
  ],

  empresas: [
    { id: "principal-1784395631398", label: "Riweb", short: "R" }
  ],

  header: { variant: 'sidebar' },

  restrictedNav: [],

  footer: {
    variant: 'simple',
    address:   "",
    email:     "",
    phone:     "",
    hours:     "",
    copyright: "©Copyright Riweb 2026",
    social: { linkedin: "#", instagram: "#", facebook: "#" },
    legalLinks: [
      { label: "Termos e Condições", href: '/termos-e-condicoes.html' },
      { label: "Política de Privacidade", href: '/politica-de-privacidade.html' },
      { label: "Definições de Cookies", href: '/definicao-de-cookies.html' }
    ],
    legalText: "As informações contidas neste site são de caráter meramente informativo e não constituem oferta de valores mobiliários.",
  },

  splash: {
    enabled: false,
    size: 'md',
    titulo: '',
    texto: '',
    conteudo: '',
    legenda: '',
    buttons: [],
  },

  cookies: {
    enabled: true,
    layout: 'full',
    theme: 'light',
    title: 'Utilizamos cookies',
    description: 'Usamos cookies para melhorar sua experiência.',
    acceptLabel: 'Aceitar todos',
    rejectLabel: 'Rejeitar',
    showReject: true,
    showCustomize: false,
  },

  errorPages: [],

  banner: [],

  supabase: {
    url:      "https://mmhuwlpsgnvoxyuofliq.supabase.co",
    anonKey:  "sb_publishable_BBSPbQc2kZngiK45ecfXaA_X4NANiGj",
    portalId: "b7f60951-ff5e-4432-9002-0c39f6cd0657",
  },

};
