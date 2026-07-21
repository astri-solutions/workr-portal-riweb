// scripts/components/documentos.js
// Fetches published documents (portal_documents) for a page and renders them
// as an accordion of "doc-list" groups (by ano/categoria), mirroring the
// static markup in cms-lista-agrupada.html.

function resolvePageId(nav) {
  const path = location.pathname.replace(/\/$/, '') || '/';
  for (const canal of nav ?? []) {
    if (canal.href && (path === canal.href.replace(/\.html$/, '') || path + '.html' === canal.href || path === canal.href)) {
      return canal.id;
    }
    for (const sub of canal.children ?? []) {
      if (sub.href && (path === sub.href.replace(/\.html$/, '') || path + '.html' === sub.href || path === sub.href)) {
        return sub.id;
      }
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

// Groups by the CMS-configured sub-grupo for this page (e.g. "Fatos Relevantes"),
// falling back to the document's creation year.
function groupLabel(doc, pageId) {
  const subs = doc.sub_group_ids?.[pageId];
  if (Array.isArray(subs) && subs.length > 0) return subs[0];
  const year = doc.created_at ? new Date(doc.created_at).getFullYear() : null;
  return year ? String(year) : 'Documentos';
}

function renderGroup(label, docs, sb, idx) {
  const items = docs.map(d => {
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
  }).join('');

  return `<div class="accordion__item${idx === 0 ? ' accordion__item--open' : ''}" data-accordion-item>
    <button class="accordion__trigger" type="button" aria-expanded="${idx === 0 ? 'true' : 'false'}">
      <span class="accordion__label">${label}</span>
      <span class="accordion__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
    <div class="accordion__body">
      <ul class="doc-list" role="list">${items}</ul>
    </div>
  </div>`;
}

// accordion.js only binds triggers present at initial page load — content
// injected later (this fetch resolves async) needs its own toggle handling.
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
 * Fetches published documents for a given pageId and renders them into
 * container as a grouped accordion. Shared by initDocumentos (single-page)
 * and the sidebar/tabmenu inline panel loaders.
 */
export async function loadDocumentosInto(pageId, container, sb) {
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

    const groups = [];
    for (const d of docs) {
      const label = groupLabel(d, pageId);
      let g = groups.find(g => g.label === label);
      if (!g) { g = { label, docs: [] }; groups.push(g); }
      g.docs.push(d);
    }

    container.innerHTML = `<div class="accordion" data-accordion>${groups.map((g, i) => renderGroup(g.label, g.docs, sb, i)).join('')}</div>`;
    bindAccordion(container);
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
  const pageId = resolvePageId(siteConfig.nav);
  const container = document.querySelector('[data-materias]');
  await loadDocumentosInto(pageId, container, sb);
}
