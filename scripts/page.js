// scripts/page.js
import { siteConfig }  from './site.config.js';
import { initTheme, refreshThemeFromSupabase } from './components/theme.js';
import { initTopbar }  from './components/topbar.js';
import { initHeader }  from './components/header.js';
import { initFooter }  from './components/footer.js';
import { initSearch }  from './components/search.js';
import { initMaterias } from './components/materias.js';
import './icons.js';
import './reveal.js';
import './accordion.js';
import './counter.js';
import './empresa-tabs.js';

// Injeta cores e fontes do CMS antes de qualquer outro componente
initTheme(siteConfig);
// Reaplica em background do Supabase — sem push/redeploy para mudanças visuais
refreshThemeFromSupabase(siteConfig);

// Atualiza title e favicon com os dados do portal
if (siteConfig.company?.name) {
  const raw = document.title.trim();
  if (!raw || raw.includes('Workr Lite')) {
    document.title = siteConfig.company.name + ' — RI';
  } else {
    document.title = raw + ' — ' + siteConfig.company.name;
  }
}
if (siteConfig.company?.favicon) {
  const faviconEl = document.querySelector('link[rel="icon"]');
  if (faviconEl) {
    faviconEl.setAttribute('href', siteConfig.company.favicon);
    const ext = siteConfig.company.favicon.split('.').pop()?.toLowerCase();
    faviconEl.setAttribute('type', ext === 'svg' ? 'image/svg+xml' : ext === 'ico' ? 'image/x-icon' : `image/${ext}`);
  }
}

// Inicializa todos os componentes compartilhados
initTopbar(siteConfig);
initHeader(siteConfig);
initFooter(siteConfig);
initSearch();
initMaterias(siteConfig);

// ── Banner hero — shortcuts e CTA dinâmicos de siteConfig.nav ─────────────────
const shortcutsInner = document.querySelector('[data-hero-shortcuts]');
if (shortcutsInner && siteConfig.nav?.length) {
  const enabled = siteConfig.nav.filter(ch => ch.enabled !== false);
  shortcutsInner.innerHTML = enabled.map(ch =>
    `<a href="${ch.href}" class="home-hero__shortcut">
      <span class="home-hero__shortcut-label">${ch.label}</span>
    </a>`
  ).join('');
}
const heroCta = document.querySelector('[data-hero-cta]');
if (heroCta && siteConfig.nav?.length) {
  const first = siteConfig.nav.find(ch => ch.enabled !== false);
  if (first) heroCta.setAttribute('href', first.href);
}

// Marca o link ativo no nav
document.querySelectorAll('.nav-dropdown__link').forEach(link => {
  if (link.getAttribute('href') === location.pathname.replace(/\/$/, '') ||
      link.getAttribute('href') === location.pathname + 'index.html') {
    link.setAttribute('aria-current', 'page');
  }
});

// Substitui elementos .page-empty por bloco "Em construção"
function emConstrucaoHTML() {
  return `<div class="em-construcao">
    <svg class="em-construcao__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.598-2.346a3.025 3.025 0 0 0-4.243-2.43L8.31 9.5l-2.5-1.25-1.81.906L3 10.531l1.16 1.628.637-.22 2.24 1.12 5.154-5.154M17.25 3l.591.591a2.25 2.25 0 0 1 0 3.182l-8.862 8.862a4.5 4.5 0 0 1-1.897 1.13L6 16.5l.497-1.582a4.5 4.5 0 0 1 1.13-1.897l8.862-8.862A2.25 2.25 0 0 1 17.25 3Z" />
    </svg>
    <p class="em-construcao__title">Em construção</p>
    <p class="em-construcao__desc">Este conteúdo ainda não foi publicado. Em breve estará disponível.</p>
  </div>`;
}

document.querySelectorAll('.page-empty').forEach(el => {
  el.outerHTML = emConstrucaoHTML();
});

// MutationObserver para capturar .page-empty adicionados dinamicamente
const emConstrucaoObserver = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof Element)) continue;
      node.querySelectorAll?.('.page-empty').forEach(el => { el.outerHTML = emConstrucaoHTML(); });
      if (node.classList?.contains('page-empty')) node.outerHTML = emConstrucaoHTML();
    }
  }
});
emConstrucaoObserver.observe(document.body, { childList: true, subtree: true });

// Formulário de contato simples
document.querySelectorAll('[data-contact-form]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.querySelector('[data-form-success]')?.classList.add('is-visible');
    form.reset();
  });
});
