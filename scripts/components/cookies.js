// scripts/components/cookies.js
// Renders the CMS-configured cookie-consent banner (siteConfig.cookies).
// Consent choice persists in localStorage so it's remembered across visits.

const STORAGE_KEY = 'workr_cookie_consent';

function buildExtraButtons(buttons) {
  if (!Array.isArray(buttons) || buttons.length === 0) return '';
  return buttons.map(b => `<a class="cookie-banner__extra-btn cookie-banner__extra-btn--${b.variant ?? 'primary'}" href="${b.url ?? '#'}">${b.label ?? ''}</a>`).join('');
}

export function initCookies(siteConfig) {
  const cfg = siteConfig?.cookies;
  if (!cfg?.enabled) return;
  if (localStorage.getItem(STORAGE_KEY)) return;

  const banner = document.createElement('div');
  banner.className = `cookie-banner cookie-banner--${cfg.layout ?? 'full'} cookie-banner--${cfg.theme ?? 'light'}`;
  banner.innerHTML = `
    <div class="cookie-banner__text">
      ${cfg.title ? `<strong class="cookie-banner__title">${cfg.title}</strong>` : ''}
      <p class="cookie-banner__desc">${cfg.description ?? ''}
        ${cfg.linkText && cfg.linkUrl ? ` <a class="cookie-banner__link" href="${cfg.linkUrl}">${cfg.linkText}</a>` : ''}
      </p>
    </div>
    <div class="cookie-banner__actions">
      ${buildExtraButtons(cfg.buttons)}
      ${cfg.showCustomize ? `<button type="button" class="cookie-banner__btn cookie-banner__btn--ghost" data-cookie-customize>${cfg.customizeLabel ?? 'Personalizar'}</button>` : ''}
      ${cfg.showReject ? `<button type="button" class="cookie-banner__btn cookie-banner__btn--ghost" data-cookie-reject>${cfg.rejectLabel ?? 'Rejeitar'}</button>` : ''}
      <button type="button" class="cookie-banner__btn cookie-banner__btn--accept" data-cookie-accept>${cfg.acceptLabel ?? 'Aceitar todos'}</button>
    </div>`;

  function choose(value) {
    localStorage.setItem(STORAGE_KEY, value);
    banner.classList.remove('is-visible');
    setTimeout(() => banner.remove(), 250);
  }

  banner.querySelector('[data-cookie-accept]')?.addEventListener('click', () => choose('accepted'));
  banner.querySelector('[data-cookie-reject]')?.addEventListener('click', () => choose('rejected'));
  // "Personalizar" has no preference sub-screen configured yet — treat as accept-and-dismiss.
  banner.querySelector('[data-cookie-customize]')?.addEventListener('click', () => choose('customized'));

  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('is-visible'));
}
