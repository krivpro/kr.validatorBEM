const NAME = '[a-z][a-z0-9]*(-[a-z0-9]+)*';
const MOD_PART = '[a-z0-9]+(-[a-z0-9]+)*';
const BLOCK_RE = new RegExp(`^${NAME}$`);
const ELEMENT_RE = new RegExp(`^${NAME}$`);
const DASH_MOD_RE = new RegExp(`^${MOD_PART}$`);
const UNDERSCORE_MOD_RE = new RegExp(`^${MOD_PART}(_${MOD_PART})?$`);

function issue(item, message) {
  return {
    file: item.file,
    line: item.line,
    className: item.className,
    rule: 'bem',
    message,
  };
}

export function parseBem(className) {
  if ((className.match(/__/g) || []).length > 1) {
    return { error: 'Не может быть элемента у элемента. Формат: блок__элемент, без второго __.' };
  }

  if ((className.match(/--/g) || []).length > 1) {
    return { error: 'В одном классе допустим только один модификатор с --.' };
  }

  const elemIndex = className.indexOf('__');
  const dashIndex = className.indexOf('--');

  if (elemIndex !== -1 && dashIndex !== -1 && dashIndex < elemIndex) {
    return { error: 'Элемент не может идти после модификатора. Сначала блок__элемент, затем модификатор.' };
  }

  let block;
  let element = null;
  let modifier = null;
  let rest;

  if (elemIndex !== -1) {
    block = className.slice(0, elemIndex);
    rest = className.slice(elemIndex + 2);
    const restDash = rest.indexOf('--');
    if (restDash !== -1) {
      element = rest.slice(0, restDash);
      modifier = { style: 'dash', body: rest.slice(restDash + 2) };
    } else {
      const restUnderscore = rest.indexOf('_');
      if (restUnderscore !== -1) {
        element = rest.slice(0, restUnderscore);
        modifier = { style: 'underscore', body: rest.slice(restUnderscore + 1) };
      } else {
        element = rest;
      }
    }
  } else if (dashIndex !== -1) {
    block = className.slice(0, dashIndex);
    modifier = { style: 'dash', body: className.slice(dashIndex + 2) };
  } else {
    const underscore = className.indexOf('_');
    if (underscore !== -1) {
      block = className.slice(0, underscore);
      modifier = { style: 'underscore', body: className.slice(underscore + 1) };
    } else {
      block = className;
    }
  }

  if (modifier?.style === 'dash' && modifier.body.includes('_')) {
    return { error: 'Не смешивайте форматы модификатора: либо --модификатор, либо _модификатор.' };
  }

  if (modifier?.style === 'underscore' && modifier.body.includes('--')) {
    return { error: 'Не смешивайте форматы модификатора: либо --модификатор, либо _модификатор.' };
  }

  return { block, element, modifier };
}

export function checkBem(item) {
  const { className } = item;

  if (!/^[a-z0-9_-]+$/.test(className)) {
    return [];
  }

  const parsed = parseBem(className);
  if (parsed.error) {
    return [issue(item, parsed.error)];
  }

  const errors = [];

  if (!parsed.block || !BLOCK_RE.test(parsed.block)) {
    errors.push(
      issue(item, 'Имя блока: латиница в нижнем регистре, слова через дефис (menu-item), без подчёркиваний внутри блока.'),
    );
  }

  if (parsed.element !== null && !ELEMENT_RE.test(parsed.element)) {
    errors.push(
      issue(item, 'Имя элемента после __: латиница, слова через дефис. Пример: header__logo, menu-item__link.'),
    );
  }

  if (parsed.modifier) {
    const ok =
      parsed.modifier.style === 'dash'
        ? DASH_MOD_RE.test(parsed.modifier.body)
        : UNDERSCORE_MOD_RE.test(parsed.modifier.body);
    if (!ok) {
      errors.push(
        issue(
          item,
          parsed.modifier.style === 'dash'
            ? 'Модификатор после --: kebab-case. Примеры: button--disabled, header--theme-dark.'
            : 'Модификатор после _: имя или имя_значение. Примеры: button_disabled, header_theme_dark.',
        ),
      );
    }
  }

  return errors;
}

function ownerClass(parsed) {
  return parsed.element ? `${parsed.block}__${parsed.element}` : parsed.block;
}

function elementKey(parsed) {
  if (!parsed?.block || !parsed.element) return '';
  return `${parsed.block}__${parsed.element}`;
}

function parseSafe(className) {
  if (!className || !/^[a-z0-9_-]+$/.test(className)) return null;
  const parsed = parseBem(className);
  if (parsed.error) return null;
  return parsed;
}

function ancestorHasClass(node, className) {
  return node.ancestors.some((ancestorClasses) =>
    ancestorClasses.some((ancestor) => ancestor.className === className),
  );
}

export function checkBemDom(nodes) {
  const errors = [];

  for (const node of nodes) {
    const names = node.classes.map((item) => item.className);
    const nameSet = new Set(names);

    for (const item of node.classes) {
      const { className } = item;
      if (className.startsWith('js-')) continue;
      const parsed = parseSafe(className);
      if (!parsed) continue;

      const owner = ownerClass(parsed);
      const key = elementKey(parsed);

      if (parsed.modifier && owner && !nameSet.has(owner)) {
        errors.push({
          file: item.file,
          line: item.line,
          className,
          rule: 'bem',
          suggest: owner,
          suggestClass: `${owner} ${className}`,
          message: `Модификатор используется без блока или элемента. На том же теге добавьте ${owner}. Правильно: class="${owner} ${className}".`,
        });
      }

      if (parsed.element && !ancestorHasClass(node, parsed.block)) {
        errors.push({
          file: item.file,
          line: item.line,
          className,
          rule: 'bem',
          suggest: parsed.block,
          message: `Элемент ${key} используется без блока ${parsed.block} в родителях. Оберните в блок: <div class="${parsed.block}">…</div>.`,
        });
      }

      if (key && ancestorHasClass(node, key)) {
        const hint = parsed.modifier
          ? `Модификатор поставьте на тот же тег. Правильно: class="${key} ${className}".`
          : `Внутри нужен другой элемент, например ${parsed.block}__inner.`;
        errors.push({
          file: item.file,
          line: item.line,
          className,
          rule: 'bem',
          suggest: key,
          suggestClass: parsed.modifier ? `${key} ${className}` : `${parsed.block}__inner`,
          message: `Элемент ${key} вложен в элемент с таким же именем. ${hint}`,
        });
      }

      if (!parsed.element && !parsed.modifier && ancestorHasClass(node, parsed.block)) {
        errors.push({
          file: item.file,
          line: item.line,
          className,
          rule: 'bem',
          suggest: `${parsed.block}__inner`,
          message: `Блок ${parsed.block} вложен в блок с таким же именем. Внутри используйте элемент, например ${parsed.block}__inner, или другой блок.`,
        });
      }
    }
  }

  return errors;
}
