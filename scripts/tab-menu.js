// scripts/tab-menu.js
import { siteConfig } from './site.config.js';
import { loadMateriasInto } from './components/materias.js';
import { loadDocumentosInto } from './components/documentos.js';
import { loadResultadosInto } from './components/resultados.js';

const TAB_NAV_ID = 'home-tabs';

// Tabmenu-model portals (header.variant === 'tabmenu') show every channel's
// matéria content inline, below the tab bar — clicking a tab loads its
// content into the panel below without leaving the page.
function buildTabMenu() {
  const nav = document.querySelector('[data-tab-nav="home-tabs"]');
  const panelArea = document.querySelector('.tab-menu__panels');
  if (!nav || !panelArea) return;

  const channels = (siteConfig.nav ?? []).filter(ch => ch.enabled !== false);
  if (!channels.length) return;

  const sb = siteConfig.supabase;
  const loaded = new Set();

  nav.innerHTML = '';
  panelArea.innerHTML = '';

  channels.forEach((ch, i) => {
    const slug = ch.id ?? ch.slug ?? ch.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const btn = document.createElement('button');
    btn.className = 'tab-menu__tab' + (i === 0 ? ' is-active' : '');
    btn.dataset.tab = slug;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.textContent = ch.label;
    nav.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'tab-menu__panel' + (i === 0 ? ' is-active' : '');
    panel.dataset.tabPanel = TAB_NAV_ID;
    panel.dataset.panel = slug;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-label', ch.label);
    panel.innerHTML = `<div data-materias></div><div class="page-empty"></div>`;
    panelArea.appendChild(panel);
  });

  const tabs = nav.querySelectorAll('.tab-menu__tab');
  const panels = panelArea.querySelectorAll('.tab-menu__panel');

  const channelBySlug = new Map(channels.map(ch => [
    ch.id ?? ch.slug ?? ch.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), ch,
  ]));

  async function loadPanel(slug) {
    if (loaded.has(slug)) return;
    loaded.add(slug);
    const panel = panelArea.querySelector(`[data-panel="${slug}"]`);
    const container = panel?.querySelector('[data-materias]');
    const found = await loadMateriasInto(slug, container, sb);
    const ch = channelBySlug.get(slug) ?? slug;
    const found2 = found || await loadDocumentosInto(ch, container, sb, siteConfig);
    if (!found2) await loadResultadosInto(ch, container, sb, siteConfig);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      panelArea.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add('is-active');
      loadPanel(tab.dataset.tab);
    });
  });

  loadPanel(channels[0].id ?? channels[0].slug ?? channels[0].label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
}

// Also handle any static [data-tab-nav] sets that are not home-tabs (other pages)
document.querySelectorAll('[data-tab-nav]:not([data-tab-nav="home-tabs"])').forEach(staticNav => {
  const group = staticNav.dataset.tabNav;
  const tabs = staticNav.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll(`[data-tab-panel="${group}"]`);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      document.querySelector(`[data-tab-panel="${group}"][data-panel="${tab.dataset.tab}"]`)
        ?.classList.add('is-active');
    });
  });
});

buildTabMenu();
