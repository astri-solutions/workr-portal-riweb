// scripts/components/resultados.js
// Fetches published trimestres/anos (portal_resultado_periodos) and their
// files (portal_resultado_arquivos) and renders them as a year-grouped
// accordion — mirrors the CMS's own "Central de Resultados" list. Unlike
// documentos.js, results aren't scoped to a page/canal — they're scoped to
// the portal + empresa, so this triggers whenever the current page/panel
// looks like the results channel (slug/href containing "resultado").
import { fileBadgeSvg } from './documentos.js';

function looksLikeResultadosPage(entry) {
  const slug = String(entry?.id ?? '').toLowerCase();
  const href = String(entry?.href ?? '').toLowerCase();
  return slug.includes('resultado') || href.includes('resultado');
}

function fileUrl(sb, filePath) {
  return `${sb.url}/storage/v1/object/public/portal-documents/${filePath}`;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

// "1T26" -> "2026"; "2026" (anual) -> "2026"
function periodYear(period) {
  const m = String(period ?? '').match(/(\d{2,4})$/);
  if (!m) return null;
  return m[1].length === 2 ? `20${m[1]}` : m[1];
}

function docItemHtml(a, sb) {
  const href = a.external_link || fileUrl(sb, a.file_path);
  return `<li class="doc-list__item">
    <div class="doc-list__info">
      <span class="doc-list__date">${formatDate(a.created_at)}</span>
      <span class="doc-list__sep" aria-hidden="true">—</span>
      <span class="doc-list__title">${a.nome}</span>
    </div>
    <div class="doc-list__actions">
      <a href="${href}" class="doc-list__link doc-list__icon" aria-label="Baixar ${a.nome}" target="_blank" rel="noopener">
        ${fileBadgeSvg(a.file_path ?? a.external_link ?? '')}
      </a>
    </div>
  </li>`;
}

function renderPeriodoItem(periodo, arquivos, sb, idx) {
  const body = arquivos.length
    ? `<ul class="doc-list" role="list">${arquivos.map(a => docItemHtml(a, sb)).join('')}</ul>`
    : `<p class="docs-vazio">Nenhum arquivo disponível.</p>`;
  return `<div class="accordion__item${idx === 0 ? ' accordion__item--open' : ''}" data-accordion-item>
    <button class="accordion__trigger" type="button" aria-expanded="${idx === 0 ? 'true' : 'false'}">
      <span class="accordion__label">📁 ${periodo.period}</span>
      <span class="accordion__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
    <div class="accordion__body">${body}</div>
  </div>`;
}

function bindAccordion(container) {
  container.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const accordion = trigger.closest('.accordion');
      const isOpen = item.classList.contains('accordion__item--open');
      accordion?.querySelectorAll('.accordion__item--open').forEach(el => el.classList.remove('accordion__item--open'));
      accordion?.querySelectorAll('.accordion__trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
      if (!isOpen) {
        item.classList.add('accordion__item--open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function renderResultados(periodos, arquivosByPeriodo, container, sb, siteConfig) {
  const empresas = siteConfig.empresas ?? [];
  const variant = siteConfig.header?.variant ?? 'sidebar';
  const showEmpresaTabs = empresas.length > 1 && variant !== 'tabmenu';
  const showEmpresaFilter = empresas.length > 1 && variant === 'tabmenu';

  const years = [...new Set(periodos.map(periodYear).filter(Boolean))].sort((a, b) => b - a);

  const filters = {
    ano: '',
    empresa: showEmpresaTabs ? (empresas[0]?.id ?? '') : '',
  };

  function passesFilters(p) {
    if (filters.ano && periodYear(p.period) !== filters.ano) return false;
    if (filters.empresa && p.entity_id !== filters.empresa) return false;
    return true;
  }

  function controlsHtml() {
    const parts = [`<div class="filter-bar__group"><span class="filter-bar__label">Filtrar por:</span>`];
    parts.push(`<div class="select"><select data-res-filter="ano" aria-label="Ano">
      <option value="">Todos os anos</option>
      ${years.map(y => `<option value="${y}"${filters.ano === String(y) ? ' selected' : ''}>${y}</option>`).join('')}
    </select></div>`);
    if (showEmpresaFilter) {
      parts.push(`<div class="select"><select data-res-filter="empresa" aria-label="Empresa">
        <option value="">Todas as empresas</option>
        ${empresas.map(e => `<option value="${e.id}"${filters.empresa === e.id ? ' selected' : ''}>${e.label}</option>`).join('')}
      </select></div>`);
    }
    parts.push(`</div>`);
    return `<div class="filter-bar">${parts.join('')}</div>`;
  }

  function empresaTabsHtml() {
    if (!showEmpresaTabs) return '';
    const tabs = empresas.map(e => `
      <button class="tab-menu__tab${e.id === filters.empresa ? ' is-active' : ''}"
        type="button" role="tab" data-res-empresa-tab="${e.id}"
        aria-selected="${e.id === filters.empresa}">${e.label}</button>`).join('');
    return `<nav class="tab-menu__nav" data-res-empresa-tabs role="tablist" aria-label="Selecionar empresa">${tabs}</nav>`;
  }

  function render() {
    const filtered = periodos.filter(passesFilters);
    let body;
    if (!filtered.length) {
      body = `<p class="docs-vazio">Nenhum resultado disponível.</p>`;
    } else {
      const byYear = [];
      for (const p of filtered) {
        const year = periodYear(p) ?? '—';
        let g = byYear.find(g => g.year === year);
        if (!g) { g = { year, periodos: [] }; byYear.push(g); }
        g.periodos.push(p);
      }
      body = byYear.map(g => `
        <h3 class="resultados-year-label">${g.year}</h3>
        <div class="accordion" data-accordion>
          ${g.periodos.map((p, idx) => renderPeriodoItem(p, arquivosByPeriodo[p.id] ?? [], sb, idx)).join('')}
        </div>`).join('');
    }
    container.innerHTML = `${controlsHtml()}${empresaTabsHtml()}<div data-res-content>${body}</div>`;
    bind();
  }

  function bind() {
    container.querySelector('[data-res-filter="ano"]')?.addEventListener('change', e => {
      filters.ano = e.target.value; render();
    });
    container.querySelector('[data-res-filter="empresa"]')?.addEventListener('change', e => {
      filters.empresa = e.target.value; render();
    });
    container.querySelectorAll('[data-res-empresa-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        filters.empresa = tab.dataset.resEmpresaTab;
        render();
      });
    });
    bindAccordion(container);
  }

  render();
}

/**
 * Fetches published períodos + arquivos for the portal and renders them into
 * container. Not page-scoped (unlike documentos.js) — Central de Resultados
 * is a single portal-wide page, scoped only by empresa.
 */
export async function loadResultadosInto(pageEntry, container, sb, siteConfig = {}) {
  const entry = typeof pageEntry === 'string' ? { id: pageEntry } : pageEntry;
  if (!container || !looksLikeResultadosPage(entry)) return false;
  if (!sb?.url || !sb?.anonKey || !sb?.portalId) return false;

  try {
    const periodosUrl = `${sb.url}/rest/v1/portal_resultado_periodos?portal_id=eq.${encodeURIComponent(sb.portalId)}&status=eq.Publicado&order=created_at.desc`;
    const periodosRes = await fetch(periodosUrl, {
      headers: { apikey: sb.anonKey, Authorization: `Bearer ${sb.anonKey}`, Accept: 'application/json' },
    });
    if (!periodosRes.ok) return false;
    const periodos = await periodosRes.json();
    if (!Array.isArray(periodos) || periodos.length === 0) return false;

    const arquivosUrl = `${sb.url}/rest/v1/portal_resultado_arquivos?portal_id=eq.${encodeURIComponent(sb.portalId)}&status=eq.Publicado&order=ordem.asc`;
    const arquivosRes = await fetch(arquivosUrl, {
      headers: { apikey: sb.anonKey, Authorization: `Bearer ${sb.anonKey}`, Accept: 'application/json' },
    });
    const arquivos = arquivosRes.ok ? await arquivosRes.json() : [];
    const arquivosByPeriodo = {};
    (Array.isArray(arquivos) ? arquivos : []).forEach(a => {
      (arquivosByPeriodo[a.periodo_id] ??= []).push(a);
    });

    renderResultados(periodos, arquivosByPeriodo, container, sb, siteConfig ?? {});
    container.classList.add('resultados--loaded');
    container.parentElement?.querySelector('.page-empty, .em-construcao')?.remove();
    return true;
  } catch {
    return false;
  }
}

export async function initResultados(siteConfig, alreadyRendered) {
  if (alreadyRendered) return;
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (!path.toLowerCase().includes('resultado')) return;
  const sb = siteConfig?.supabase;
  const container = document.querySelector('[data-materias]');
  await loadResultadosInto({ id: path }, container, sb, siteConfig);
}
