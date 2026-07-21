// scripts/sidebar-nav.js
import { siteConfig } from './site.config.js';
import { loadMateriasInto } from './components/materias.js';
import { loadDocumentosInto } from './components/documentos.js';
import { loadResultadosInto } from './components/resultados.js';

// Sidebar-model portals (header.variant === 'sidebar') show every channel's
// matéria content inline, next to the menu — clicking a menu item loads its
// content into the panel on the right without leaving the page.
function buildSidebar() {
  const navList = document.querySelector('.sidebar-nav__list');
  const contentArea = document.querySelector('.sidebar-content');
  if (!navList || !contentArea) return;

  const channels = (siteConfig.nav ?? []).filter(ch => ch.enabled !== false);
  if (!channels.length) return;

  const sb = siteConfig.supabase;
  const loaded = new Set();

  navList.innerHTML = '';
  contentArea.innerHTML = '';

  channels.forEach((ch, i) => {
    const slug = ch.id ?? ch.slug ?? ch.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const li = document.createElement('li');
    li.className = 'sidebar-nav__item';
    const btn = document.createElement('button');
    btn.className = 'sidebar-nav__btn' + (i === 0 ? ' is-active' : '');
    btn.dataset.panel = slug;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.textContent = ch.label;
    li.appendChild(btn);
    navList.appendChild(li);

    const panel = document.createElement('div');
    panel.className = 'sidebar-panel' + (i === 0 ? ' is-active' : '');
    panel.dataset.panel = slug;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-label', ch.label);
    panel.innerHTML = `<div data-materias></div><div class="page-empty"></div>`;
    contentArea.appendChild(panel);
  });

  const btns = navList.querySelectorAll('.sidebar-nav__btn');
  const panels = contentArea.querySelectorAll('.sidebar-panel');

  const channelBySlug = new Map(channels.map(ch => [
    ch.id ?? ch.slug ?? ch.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), ch,
  ]));

  async function loadPanel(slug) {
    if (loaded.has(slug)) return;
    loaded.add(slug);
    const panel = contentArea.querySelector(`[data-panel="${slug}"]`);
    const container = panel?.querySelector('[data-materias]');
    const found = await loadMateriasInto(slug, container, sb);
    const ch = channelBySlug.get(slug) ?? slug;
    const found2 = found || await loadDocumentosInto(ch, container, sb, siteConfig);
    if (!found2) await loadResultadosInto(ch, container, sb, siteConfig);
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.panel;
      btns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      contentArea.querySelector(`[data-panel="${target}"]`)?.classList.add('is-active');
      loadPanel(target);
    });
  });

  // Eagerly load the first (default-active) panel.
  loadPanel(channels[0].id ?? channels[0].slug ?? channels[0].label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
}

buildSidebar();
