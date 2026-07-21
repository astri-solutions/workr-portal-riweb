// scripts/components/documentos.js
// Fetches published documents (portal_documents) for a page and renders them
// either as a flat filterable list ("lista") or as an accordion grouped by
// sub-grupo/ano ("lista-agrupada"), mirroring cms-lista.html / cms-lista-agrupada.html.
// Also handles the empresa dimension: when the portal has more than one empresa,
// sidebar/banner layouts get an in-content tab menu (one company at a time,
// like a nested nav), while tabmenu layouts get a second "Empresa" filter select
// next to "Ano" (adding tabs-inside-tabs there would be confusing).

function resolvePageEntry(nav) {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const matches = href => href && (path === href.replace(/\.html$/, '') || path + '.html' === href || path === href);
  for (const canal of nav ?? []) {
    if (matches(canal.href)) return canal;
    for (const sub of canal.children ?? []) {
      if (matches(sub.href)) return sub;
    }
  }
  return undefined;
}

const EXT_ICON = {
  pdf: 'pdf.svg',
  xls: 'excel.svg', xlsx: 'excel.svg',
  doc: 'doc.svg', docx: 'doc.svg',
  ppt: 'ppt.svg', pptx: 'ppt.svg',
  mp3: 'audio.svg', wav: 'audio.svg', m4a: 'audio.svg',
  mp4: 'video.svg', mov: 'video.svg', avi: 'video.svg',
};

function extOf(path) {
  const m = String(path ?? '').match(/\.([^.?]+)(?:\?.*)?$/);
  return m ? m[1].toLowerCase() : '';
}

function iconFor(pathOrUrl) {
  return EXT_ICON[extOf(pathOrUrl)] ?? 'download.svg';
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

function titleOf(doc) {
  const t = doc.titulo ?? {};
  return t['pt-BR'] ?? Object.values(t)[0] ?? 'Documento';
}

function yearOf(doc) {
  return doc.created_at ? new Date(doc.created_at).getFullYear() : null;
}

// Groups by the CMS-configured sub-grupo for this page (e.g. "Fatos Relevantes"),
// falling back to the document's creation year.
function groupLabel(doc, pageId) {
  const subs = doc.sub_group_ids?.[pageId];
  if (Array.isArray(subs) && subs.length > 0) return subs[0];
  const year = yearOf(doc);
  return year ? String(year) : 'Documentos';
}

function docItemHtml(d, sb) {
  const href = d.external_link || fileUrl(sb, d.file_path);
  const title = titleOf(d);
  return `<li class="doc-list__item">
    <div class="doc-list__info">
      <span class="doc-list__title">${title}</span>
      <span class="doc-list__date">${formatDate(d.created_at)}</span>
    </div>
    <div class="doc-list__actions">
      <a href="${href}" class="doc-list__link" aria-label="Baixar ${title}" target="_blank" rel="noopener">
        <img src="/assets/icons/${iconFor(d.file_path ?? d.external_link ?? '')}" width="20" height="20" alt="" />
      </a>
    </div>
  </li>`;
}

function renderFlatList(list, sb) {
  if (!list.length) return `<p class="docs-vazio">Nenhum documento disponível.</p>`;
  return `<ul class="doc-list" role="list">${list.map(d => docItemHtml(d, sb)).join('')}</ul>`;
}

function renderGroupedList(list, pageId, sb) {
  if (!list.length) return `<p class="docs-vazio">Nenhum documento disponível.</p>`;
  const groups = [];
  for (const d of list) {
    const label = groupLabel(d, pageId);
    let g = groups.find(g => g.label === label);
    if (!g) { g = { label, docs: [] }; groups.push(g); }
    g.docs.push(d);
  }
  const groupHtml = groups.map((g, idx) => `
    <div class="accordion__item${idx === 0 ? ' accordion__item--open' : ''}" data-accordion-item>
      <button class="accordion__trigger" type="button" aria-expanded="${idx === 0 ? 'true' : 'false'}">
        <span class="accordion__label">${g.label}</span>
        <span class="accordion__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      <div class="accordion__body">
        <ul class="doc-list" role="list">${g.docs.map(d => docItemHtml(d, sb)).join('')}</ul>
      </div>
    </div>`).join('');
  return `<div class="accordion" data-accordion>${groupHtml}</div>`;
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

/**
 * Renders the full documentos UI (filters + optional empresa tabs/select +
 * flat or grouped list) into container, and wires up client-side filtering
 * (no refetch — all published docs for the page are already in memory).
 */
function renderDocumentos(entry, docs, container, sb, siteConfig) {
  const pageId = entry.id;
  const listType = entry.pageType === 'lista' ? 'lista' : 'lista-agrupada';
  const empresas = siteConfig.empresas ?? [];
  const variant = siteConfig.header?.variant ?? 'sidebar';
  const showEmpresaTabs = empresas.length > 1 && variant !== 'tabmenu';
  const showEmpresaFilter = empresas.length > 1 && variant === 'tabmenu';

  const years = [...new Set(docs.map(yearOf).filter(Boolean))].sort((a, b) => b - a);
  const tipos = [...new Set(docs.map(d => extOf(d.file_path ?? d.external_link ?? '')).filter(Boolean))].sort();

  const filters = {
    ano: '',
    tipo: '',
    empresa: showEmpresaTabs ? (empresas[0]?.id ?? '') : '',
  };

  function passesFilters(d) {
    if (filters.ano && String(yearOf(d)) !== filters.ano) return false;
    if (filters.tipo && extOf(d.file_path ?? d.external_link ?? '') !== filters.tipo) return false;
    if (filters.empresa && d.entity_id !== filters.empresa) return false;
    return true;
  }

  function controlsHtml() {
    const parts = [`<div class="filter-bar__group"><span class="filter-bar__label">Filtrar por:</span>`];
    parts.push(`<div class="select"><select data-doc-filter="ano" aria-label="Ano">
      <option value="">Todos os anos</option>
      ${years.map(y => `<option value="${y}"${filters.ano === String(y) ? ' selected' : ''}>${y}</option>`).join('')}
    </select></div>`);
    if (listType === 'lista' && tipos.length > 0) {
      parts.push(`<div class="select"><select data-doc-filter="tipo" aria-label="Tipo">
        <option value="">Todos os tipos</option>
        ${tipos.map(t => `<option value="${t}"${filters.tipo === t ? ' selected' : ''}>${t.toUpperCase()}</option>`).join('')}
      </select></div>`);
    }
    if (showEmpresaFilter) {
      parts.push(`<div class="select"><select data-doc-filter="empresa" aria-label="Empresa">
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
        type="button" role="tab" data-doc-empresa-tab="${e.id}"
        aria-selected="${e.id === filters.empresa}">${e.label}</button>`).join('');
    return `<nav class="tab-menu__nav" data-doc-empresa-tabs role="tablist" aria-label="Selecionar empresa">${tabs}</nav>`;
  }

  function render() {
    const filtered = docs.filter(passesFilters);
    const body = listType === 'lista' ? renderFlatList(filtered, sb) : renderGroupedList(filtered, pageId, sb);
    container.innerHTML = `${controlsHtml()}${empresaTabsHtml()}<div data-doc-content>${body}</div>`;
    bind();
  }

  function bind() {
    container.querySelector('[data-doc-filter="ano"]')?.addEventListener('change', e => {
      filters.ano = e.target.value; render();
    });
    container.querySelector('[data-doc-filter="tipo"]')?.addEventListener('change', e => {
      filters.tipo = e.target.value; render();
    });
    container.querySelector('[data-doc-filter="empresa"]')?.addEventListener('change', e => {
      filters.empresa = e.target.value; render();
    });
    container.querySelectorAll('[data-doc-empresa-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        filters.empresa = tab.dataset.docEmpresaTab;
        render();
      });
    });
    bindAccordion(container);
  }

  render();
}

/**
 * Fetches published documents for a given page and renders them into
 * container. Shared by initDocumentos (single-page) and the sidebar/tabmenu
 * inline panel loaders (one page's worth of documents per channel, loaded
 * on demand without navigating away).
 *
 * `pageEntry` is the channel's nav entry ({ id, pageType, ... }); a bare
 * string pageId is also accepted for backwards compatibility.
 */
export async function loadDocumentosInto(pageEntry, container, sb, siteConfig = {}) {
  const entry = typeof pageEntry === 'string' ? { id: pageEntry } : pageEntry;
  const pageId = entry?.id;
  if (!pageId || !container) return false;
  if (!sb?.url || !sb?.anonKey || !sb?.portalId) return false;

  try {
    const containsFilter = `cs.%7B${encodeURIComponent(pageId)}%7D`;
    const url = `${sb.url}/rest/v1/portal_documents?portal_id=eq.${encodeURIComponent(sb.portalId)}&pagina_ids=${containsFilter}&status=eq.Publicado&order=created_at.desc`;
    const res = await fetch(url, {
      headers: { apikey: sb.anonKey, Authorization: `Bearer ${sb.anonKey}`, Accept: 'application/json' },
    });
    if (!res.ok) return false;
    const docs = await res.json();
    if (!Array.isArray(docs) || docs.length === 0) return false;

    renderDocumentos(entry, docs, container, sb, siteConfig ?? {});
    container.classList.add('documentos--loaded');
    container.parentElement?.querySelector('.page-empty, .em-construcao')?.remove();
    return true;
  } catch {
    return false;
  }
}

export async function initDocumentos(siteConfig, alreadyRendered) {
  if (alreadyRendered) return;
  const sb = siteConfig?.supabase;
  const entry = resolvePageEntry(siteConfig.nav);
  const container = document.querySelector('[data-materias]');
  await loadDocumentosInto(entry, container, sb, siteConfig);
}
