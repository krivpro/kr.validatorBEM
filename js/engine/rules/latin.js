function issue(item, rule, message, extra = {}) {
  return {
    file: item.file,
    line: item.line,
    className: item.className,
    rule,
    message,
    ...extra,
  };
}

const CYR_TO_LATIN = {
  а: 'a',
  е: 'e',
  о: 'o',
  р: 'p',
  с: 'c',
  у: 'y',
  х: 'x',
  і: 'i',
  ѕ: 's',
  ј: 'j',
  ԁ: 'd',
  к: 'k',
  А: 'A',
  В: 'B',
  Е: 'E',
  К: 'K',
  М: 'M',
  Н: 'H',
  О: 'O',
  Р: 'P',
  С: 'C',
  Т: 'T',
  Х: 'X',
  І: 'I',
};

function listCyrillic(className) {
  const chars = [];
  for (const char of className) {
    if (/[\u0400-\u04FF]/.test(char)) {
      chars.push({
        char,
        latin: CYR_TO_LATIN[char] || '',
      });
    }
  }
  return chars;
}

function latinize(className) {
  return [...className].map((char) => CYR_TO_LATIN[char] || char).join('');
}

function uniqueLookalikes(chars) {
  const seen = new Set();
  const items = [];
  for (const item of chars) {
    if (!item.latin || seen.has(item.char)) continue;
    seen.add(item.char);
    items.push(item);
  }
  return items;
}

export function checkLatin(item) {
  const { className } = item;
  const errors = [];

  const cyrillic = listCyrillic(className);
  if (cyrillic.length > 0) {
    const lookalikes = uniqueLookalikes(cyrillic);
    const suggest = latinize(className);
    const canSuggest = suggest !== className && /^[a-zA-Z0-9_-]+$/.test(suggest);
    let message;

    if (lookalikes.length > 0) {
      const details = lookalikes
        .map((item) => `«${item.char}» выглядит как латинская «${item.latin}», но это кириллица`)
        .join('; ');
      message = `${details}. В классе «${className}» замените на латинскую букву.`;
      if (canSuggest) {
        message += ` Правильно: ${suggest}.`;
      }
    } else {
      const letters = [...new Set(cyrillic.map((item) => item.char))].map((char) => `«${char}»`).join(', ');
      message = `В классе «${className}» кириллица: ${letters}. Пишите классы только латинскими буквами a–z.`;
    }

    errors.push(
      issue(item, 'latin', message, {
        fatal: true,
        suggest: canSuggest ? suggest : '',
      }),
    );
    return errors;
  }

  if (/[^a-zA-Z0-9_-]/.test(className)) {
    errors.push(
      issue(item, 'latin', 'Допустимы только латинские буквы, цифры, дефис и подчёркивание.', {
        fatal: true,
      }),
    );
    return errors;
  }

  if (/[A-Z]/.test(className)) {
    errors.push(issue(item, 'latin', 'Класс должен быть в нижнем регистре, без camelCase и PascalCase.'));
  }

  if (/^[-_0-9]/.test(className) || /[-_]$/.test(className)) {
    errors.push(
      issue(item, 'latin', 'Класс не должен начинаться с цифры, дефиса или подчёркивания и не должен ими заканчиваться.'),
    );
  }

  return errors;
}

export function isJsHook(className) {
  return className.startsWith('js-');
}
