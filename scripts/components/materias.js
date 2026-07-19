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

// Keys match FormField['type'] from apps/web-admin NovoFormularioPage.tsx
const FIELD_INPUT = {
  text:     (f) => `<input type="text" name="${f.id}" placeholder="${f.placeholder ?? ''}" ${f.required ? 'required' : ''} />`,
  email:    (f) => `<input type="email" name="${f.id}" placeholder="${f.placeholder ?? ''}" ${f.required ? 'required' : ''} />`,
  phone:    (f) => `<input type="tel" name="${f.id}" placeholder="${f.placeholder ?? ''}" ${f.required ? 'required' : ''} />`,
  textarea: (f) => `<textarea name="${f.id}" rows="5" placeholder="${f.placeholder ?? ''}" ${f.required ? 'required' : ''}></textarea>`,
  company:  (f) => `<input type="text" name="${f.id}" placeholder="${f.placeholder ?? ''}" ${f.required ? 'required' : ''} />`,
  date:     (f) => `<input type="date" name="${f.id}" ${f.required ? 'required' : ''} />`,
  checkbox: (f) => `<input type="checkbox" name="${f.id}" ${f.required ? 'required' : ''} />`,
};

function renderFieldInput(f) {
  const key = (f.type ?? '').toLowerCase();
  // 'subject' and 'select' render as <select> whenever options are configured
  const opts = String(f.options ?? '').split(',').map(o => o.trim()).filter(Boolean);
  if ((key === 'subject' || key === 'select') && opts.length > 0) {
    return `<select name="${f.id}" ${f.required ? 'required' : ''}>
      <option value="" disabled selected>Selecionar…</option>
      ${opts.map(o => `<option value="${o}">${o}</option>`).join('')}
    </select>`;
  }
  if (FIELD_INPUT[key]) return FIELD_INPUT[key](f);
  return `<input type="text" name="${f.id}" placeholder="${f.placeholder ?? ''}" ${f.required ? 'required' : ''} />`;
}

function renderFormulario(m) {
  const cfg = m.content ?? {};
  const fields = Array.isArray(cfg.fields) ? cfg.fields : [];
  const fieldsHtml = fields.map(f => `
    <label class="materia-form__field">
      <span class="materia-form__label">${f.label ?? ''}${f.required ? ' *' : ''}</span>
      ${renderFieldInput(f)}
    </label>`).join('');

  return `<article class="materia-card materia-card--form" id="materia-${m.id}">
    ${m.subtitulo ? `<p class="materia-card__subtitle">${m.subtitulo}</p>` : ''}
    <form class="materia-form" data-materia-form novalidate>
      ${fieldsHtml}
      <button class="btn btn--primary btn--lg" type="submit">${cfg.submitLabel ?? 'Enviar'}</button>
      <div class="materia-form__success" data-form-success aria-live="polite">${cfg.successMessage ?? 'Mensagem enviada com sucesso!'}</div>
    </form>
  </article>`;
}

function bindForms(container) {
  container.querySelectorAll('[data-materia-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      form.querySelector('[data-form-success]')?.classList.add('is-visible');
      form.reset();
    });
  });
}

function renderMateria(m) {
  if (m.content && !Array.isArray(m.content) && m.content.kind === 'formulario') {
    return renderFormulario(m);
  }
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
    bindForms(container);
    container.classList.add('materias--loaded');
  } catch {
    // Silently skip — page renders without dynamic content
  }
}
