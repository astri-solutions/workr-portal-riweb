// scripts/sidebar-nav.js
import { siteConfig } from './site.config.js';

const NAV_ID = 'home-sidebar';

function buildSidebar() {
  const navList = document.querySelector('.sidebar-nav__list');
  const contentArea = document.querySelector('.sidebar-content');
  if (!navList || !contentArea) return;

  const channels = (siteConfig.nav ?? []).filter(ch => ch.enabled !== false);
  if (!channels.length) return;

  navList.innerHTML = '';
  contentArea.innerHTML = '';

  channels.forEach((ch, i) => {
    const slug = ch.slug ?? ch.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Nav item
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

    // Panel
    const panel = document.createElement('div');
    panel.className = 'sidebar-panel' + (i === 0 ? ' is-active' : '');
    panel.dataset.sidebarPanel = NAV_ID;
    panel.dataset.panel = slug;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-label', ch.label);
    panel.innerHTML = `<div class="page-empty"></div>`;
    contentArea.appendChild(panel);
  });

  // Wire up tab switching
  const btns = navList.querySelectorAll('.sidebar-nav__btn');
  const panels = contentArea.querySelectorAll('.sidebar-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.panel;
      btns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      contentArea.querySelector(`[data-panel="${target}"]`)?.classList.add('is-active');
    });
  });
}

buildSidebar();
