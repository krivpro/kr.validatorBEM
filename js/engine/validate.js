import { extractFromCss, extractFromHtml, walkHtml } from './extract.js';
import { checkBem, checkBemDom } from './rules/bem.js';
import { checkEnglish } from './rules/english.js';
import { checkLatin, isJsHook } from './rules/latin.js';

export function validate({ html = '', css = '' } = {}) {
  const items = [...extractFromHtml(html, 'html'), ...extractFromCss(css, 'css')];
  const errors = [];

  for (const item of items) {
    if (!item.className) continue;

    const latinErrors = checkLatin(item);
    errors.push(...latinErrors);
    if (latinErrors.some((error) => error.fatal)) continue;

    errors.push(...checkEnglish(item));

    if (!isJsHook(item.className)) {
      errors.push(...checkBem(item));
    }
  }

  if (html) {
    errors.push(...checkBemDom(walkHtml(html, 'html')));
  }

  return {
    errors,
    total: items.length,
  };
}
