// scripts/components/materias.js
// Fetches published matérias from Supabase and renders them into the current page.

/**
 * Determines the current pageId by matching the current URL against siteConfig.nav.
 * Returns undefined if no match is found.
 */
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

function renderBlock(block) {
  const type = block.type;
  if (type === 'paragraph' || type === 'text') {
    return `<p class="materia-block materia-block--text">${block.content ?? ''}</p>`;
  }
  if (type === 'heading') {
    const level = block.level ?? 2;
    return `<h${level} class="materia-block materia-block--heading">${block.content ?? ''}</h${level}>`;
  }
  if (type === 'image') {
    return `<figure class="materia-block materia-block--image">
      <img src="${block.src ?? ''}" alt="${block.alt ?? ''}" loading="lazy" />
      ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
    </figure>`;
  }
  if (type === 'quote') {
    return `<blockquote class="materia-block materia-block--quote">${block.content ?? ''}</blockquote>`;
  }
  if (type === 'divider') {
    return `<hr class="materia-block materia-block--divider" />`;
  }
  return '';
}

function renderMateria(m) {
  const blocks = Array.isArray(m.content) ? m.content : [];
  const body = blocks.map(renderBlock).join('') || `<p class="materia-block materia-block--text">${m.subtitulo ?? ''}</p>`;

  return `<article class="materia-card" id="materia-${m.id}">
    <header class="materia-card__header">
      <h2 class="materia-card__title">${m.titulo ?? ''}</h2>
      ${m.subtitulo ? `<p class="materia-card__subtitle">${m.subtitulo}</p>` : ''}
      <time class="materia-card__date" datetime="${m.data ?? ''}">${m.data ?? ''}</time>
    </header>
    <div class="materia-card__body">${body}</div>
  </article>`;
}

export async function initMaterias(siteConfig) {
  const sb = siteConfig?.supabase;
  if (!sb?.url || !sb?.anonKey || !sb?.portalId) return;

  const pageId = resolvePageId(siteConfig.nav);
  if (!pageId) return;

  const container = document.querySelector('[data-materias]');
  if (!container) return;

  try {
    const url = `${sb.url}/rest/v1/portal_materias?portal_id=eq.${encodeURIComponent(sb.portalId)}&page_id=eq.${encodeURIComponent(pageId)}&status=eq.publicado&order=data.desc`;
    const res = await fetch(url, {
      headers: {
        'apikey': sb.anonKey,
        'Authorization': `Bearer ${sb.anonKey}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) return;
    const materias = await res.json();
    if (!Array.isArray(materias) || materias.length === 0) return;

    container.innerHTML = materias.map(m => renderMateria({
      id: m.id,
      titulo: m.titulo,
      subtitulo: m.subtitulo,
      data: m.data,
      content: m.content,
    })).join('');
    container.classList.add('materias--loaded');
  } catch {
    // Silently skip — page renders without dynamic content
  }
}
