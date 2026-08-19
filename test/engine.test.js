import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractFromCss, extractFromHtml } from '../js/engine/extract.js';
import { validate } from '../js/engine/validate.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('valid BEM in both modifier styles passes', () => {
  const result = validate({
    html: `
      <div class="header header_theme_dark header--theme-dark">
        <span class="header__logo"></span>
      </div>
      <button class="button button_disabled button--disabled"></button>
      <nav class="menu-item">
        <a class="menu-item__nav-link"></a>
      </nav>
    `,
  });
  assert.equal(result.errors.length, 0);
  assert.equal(result.total, 9);
});

test('cyrillic class is rejected', () => {
  const result = validate({ html: '<div class="шапка"></div>' });
  assert.ok(result.errors.some((error) => error.rule === 'latin'));
});

test('cyrillic lookalike c is explained', () => {
  const className = `\u0441heckout-item__image`;
  const result = validate({ html: `<div class="${className}"></div>` });
  const error = result.errors.find((item) => item.rule === 'latin');
  assert.ok(error);
  assert.match(error.message, /кириллица/i);
  assert.match(error.message, /латинск/i);
  assert.equal(error.suggest, 'checkout-item__image');
});

test('common English words in real class names pass', () => {
  const result = validate({
    html: '<div class="game-block mini-game-block-title for-mini-game__item-button hero-page__img scrollbar scrollbar__text"></div>',
  });
  assert.equal(
    result.errors.filter((error) => error.rule === 'english' || error.rule === 'translit').length,
    0,
  );
});

test('translit and misspellings in real class names are still caught', () => {
  const result = validate({
    html: '<div class="centr hero-page__img_zvezda-1 hero-page-paragraf hero-page-buton for-mini-game__item_recers hero-page__img_zvezda-mobil"></div>',
  });
  const tokens = result.errors.map((error) => error.message);
  assert.ok(tokens.some((message) => message.includes('centr')));
  assert.ok(tokens.some((message) => message.includes('zvezda')));
  assert.ok(tokens.some((message) => message.includes('paragraf')));
  assert.ok(tokens.some((message) => message.includes('buton')));
  assert.ok(tokens.some((message) => message.includes('recers')));
  assert.ok(tokens.some((message) => message.includes('mobil')));
  assert.equal(
    result.errors.filter((error) => error.message.includes('game')).length,
    0,
  );
});

test('translit and misspellings suggest the English word', () => {
  const result = validate({
    html: '<div class="centr hero-page__img_zvezda-1 hero-page-paragraf hero-page-buton for-mini-game__item_recers hero-page__img_zvezda-mobil knopka"></div>',
  });
  const byToken = Object.fromEntries(
    result.errors
      .filter((error) => error.suggest)
      .map((error) => [error.message.match(/«([^»]+)»/)[1], error.suggest]),
  );
  assert.equal(byToken.centr, 'center');
  assert.equal(byToken.zvezda, 'star');
  assert.equal(byToken.paragraf, 'paragraph');
  assert.equal(byToken.buton, 'button');
  assert.equal(byToken.recers, 'reverse');
  assert.equal(byToken.mobil, 'mobile');
  assert.equal(byToken.knopka, 'button');
  assert.ok(result.errors.some((error) => error.message.includes('Правильно: star → .hero-page__img_star-1')));
});

test('translit knopka is rejected', () => {
  const result = validate({ html: '<button class="knopka"></button>' });
  assert.ok(result.errors.some((error) => error.rule === 'translit' && error.className === 'knopka'));
});

test('nested BEM element is rejected', () => {
  const result = validate({ css: '.block__el__icon { color: red; }' });
  assert.ok(result.errors.some((error) => error.rule === 'bem' && error.className === 'block__el__icon'));
});

test('camelCase is rejected', () => {
  const result = validate({ html: '<nav class="HeaderNav"></nav>' });
  assert.ok(result.errors.some((error) => error.rule === 'latin'));
});

test('html extractor keeps line numbers and multiple classes', () => {
  const html = `<div class="header">
    <span class="header__logo header__logo_hidden"></span>
  </div>`;
  const items = extractFromHtml(html);
  const names = items.map((item) => item.className);
  assert.deepEqual(names, ['header', 'header__logo', 'header__logo_hidden']);
  assert.equal(items[1].line, 2);
});

test('css extractor skips comments, urls and reads @media', () => {
  const css = `/* .knopka { } */
.header {
  background: url("image.header.png");
  font-size: 1.5rem;
}
@media (min-width: 768px) {
  .header__nav, .header__logo { }
}`;
  const items = extractFromCss(css);
  assert.deepEqual(
    items.map((item) => item.className),
    ['header', 'header__nav', 'header__logo'],
  );
});

test('js- hooks skip BEM but still catch translit', () => {
  const result = validate({ html: '<div class="js-menu knopka"></div>' });
  assert.equal(
    result.errors.filter((error) => error.className === 'js-menu' && error.rule === 'bem').length,
    0,
  );
  assert.ok(result.errors.some((error) => error.className === 'knopka' && error.rule === 'translit'));
});

test('mixed modifier styles in one class fail', () => {
  const result = validate({ html: '<div class="button--theme_dark"></div>' });
  assert.ok(result.errors.some((error) => error.rule === 'bem'));
});

test('modifier without block or element on the same tag is rejected', () => {
  const result = validate({
    html: '<div class="hero-page"><img class="hero-page__img_star-1"></div>',
  });
  assert.ok(
    result.errors.some(
      (error) =>
        error.rule === 'bem' &&
        error.className === 'hero-page__img_star-1' &&
        error.message.includes('без блока или элемента') &&
        error.suggest === 'hero-page__img',
    ),
  );
});

test('same BEM element nested in itself is rejected', () => {
  const result = validate({
    html: '<div class="hero-page"><div class="hero-page__img"><img class="hero-page__img_star-1"></div></div>',
  });
  assert.ok(
    result.errors.some(
      (error) =>
        error.rule === 'bem' &&
        error.className === 'hero-page__img_star-1' &&
        error.message.includes('с таким же именем'),
    ),
  );
});

test('element without parent block is rejected', () => {
  const result = validate({
    html: '<div class="hero-page__img"></div>',
  });
  assert.ok(
    result.errors.some(
      (error) =>
        error.rule === 'bem' &&
        error.className === 'hero-page__img' &&
        error.message.includes('без блока') &&
        error.suggest === 'hero-page',
    ),
  );
});

test('block nested in the same block is rejected', () => {
  const result = validate({
    html: '<div class="header"><div class="header"></div></div>',
  });
  assert.ok(
    result.errors.some(
      (error) =>
        error.rule === 'bem' &&
        error.className === 'header' &&
        error.message.includes('вложен в блок с таким же именем'),
    ),
  );
});

test('modifier with owner class on the same tag passes BEM structure', () => {
  const result = validate({
    html: '<div class="hero-page"><img class="hero-page__img hero-page__img_star-1"></div>',
  });
  assert.equal(
    result.errors.filter((error) => error.rule === 'bem').length,
    0,
  );
});

test('this project UI uses valid BEM class names', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const css = readFileSync(join(root, 'css/style.css'), 'utf8');
  const result = validate({ html, css });
  assert.deepEqual(
    result.errors.map((error) => `${error.className} [${error.rule}] ${error.message}`),
    [],
  );
});
