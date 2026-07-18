// scripts/tab-menu.js
import { siteConfig } from './site.config.js';

const TAB_NAV_ID = 'home-tabs';

function buildTabMenu() {
  const nav = document.querySelector('[data-tab-nav="home-tabs"]');
  const panelArea = document.querySelector('.tab-menu__panels');
  if (!nav || !panelArea) return;

  const channels = (siteConfig.nav ?? []).filter(ch => ch.enabled !== false);
  if (!channels.length) return;

  nav.innerHTML = '';
  panelArea.innerHTML = '';

  channels.forEach((ch, i) => {
    const slug = ch.slug ?? ch.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

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
    panel.innerHTML = `<div class="page-empty"></div>`;
    panelArea.appendChild(panel);
  });

  const tabs = nav.querySelectorAll('.tab-menu__tab');
  const panels = panelArea.querySelectorAll('.tab-menu__panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      panelArea.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add('is-active');
    });
  });
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
