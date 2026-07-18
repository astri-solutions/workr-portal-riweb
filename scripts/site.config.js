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
    favicon:      '/favicon.png',
  },

  colors: {
    primary:   "#ff0026",
    secondary: "#0070ff",
    tertiary:  "#0def81",
  },

  fonts: {
    display: "poppins",
    body:    "inter",
  },

  ticker: {
    type:      "iframe",
    iframeUrl: "",
    items: [],
  },

  nav: [
    { id: "central-resultados", label: "Canal teste", href: "/central-resultados.html", children: [] },
    { id: "docs-cvm", label: "Documentos CVM", href: "/documentos-cvm.html", children: [] },
    { id: "fale-ri", label: "Fale com RI", href: "/fale-com-ri.html", children: [] },
    { id: "mailing", label: "Mailing", href: "/mailing.html", children: [] },
  ],

  empresas: [
    { id: 'principal', label: "Riweb", short: 'R' },
  ],

  supabase: {
    url:      "https://mmhuwlpsgnvoxyuofliq.supabase.co",
    anonKey:  "sb_publishable_BBSPbQc2kZngiK45ecfXaA_X4NANiGj",
    portalId: null,
  },

  header: { variant: 'sidebar' },

  seo: {
    title:             "Riweb - Relações com Investidores",
    description:       "",
    googleAnalyticsId: "",
    clarityId:         "",
  },

  contact: {
    email: "",
  },

  languages: ["pt-BR","en","es"],

  restrictedNav: [],

  footer: {
    variant:   'simple',
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

};
