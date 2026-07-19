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
    primary:   "#ff0000",
    secondary: "#f200ff",
    tertiary:  "#03ff00",
  },

  fonts: {
    display: "Playfair Display",
    body:    "Playfair Display",
  },

  ticker: {
    type:      "static",
    iframeUrl: "",
    items: [
      { symbol: 'WRLT3', price: 'R$ 00,00', change: '0,00%', direction: 'up' }
    ],
  },

  nav: [
    { id: "docs-cvm", label: "Documentos CVM", href: "/documentos-cvm.html", pageType: "lista", children: [] },
    { id: "mailing", label: "Mailing", href: "/mailing.html", children: [] },
    { id: "xfg1mh9", label: "Teste 3", href: "/", pageType: "lista", children: [] },
  ],

  empresas: [
    { id: "principal-1784395631398", label: "Riweb", short: "R" }
  ],

  header: { variant: 'tabmenu' },

  restrictedNav: [],

  footer: {
    variant: 'simple',
    address:   "Av. Brigadeiro Faria Lima, 2.277, 17º andar — São Paulo/SP, CEP 01452-000",
    email:     "workrlite@astri.com",
    phone:     "(11) 1234-5678",
    hours:     "Segunda a sexta, das 08h às 18h, exceto feriados.",
    copyright: "©Copyright Workr Lite - Riweb 2026",
    social: { linkedin: "#", instagram: "#", facebook: "#" },
    legalLinks: [
      { label: "Termos e Condições", href: "/termos-e-condicoes.html" },
      { label: "Política de Privacidade", href: "/politica-de-privacidade.html" },
      { label: "Definições de Cookies", href: "/definicao-de-cookies.html" }
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
    "theme": "light",
    "title": "Utilizamos cookies",
    "layout": "right",
    "buttons": [],
    "enabled": true,
    "linkUrl": "/politica-de-privacidade",
    "linkText": "Política de Privacidade",
    "showReject": true,
    "acceptLabel": "Aceitar todos",
    "description": "Usamos cookies para melhorar sua experiência, personalizar conteúdos e analisar o tráfego do nosso site.",
    "rejectLabel": "Rejeitar",
    "showCustomize": true,
    "customizeLabel": "Personalizar"
  },

  errorPages: [],

  banner: [],

  supabase: {
    url:      "https://mmhuwlpsgnvoxyuofliq.supabase.co",
    anonKey:  "sb_publishable_BBSPbQc2kZngiK45ecfXaA_X4NANiGj",
    portalId: "b7f60951-ff5e-4432-9002-0c39f6cd0657",
  },

};
