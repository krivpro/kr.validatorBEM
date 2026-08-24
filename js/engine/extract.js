function lineAt(source, index) {
  let line = 1;
  for (let i = 0; i < index && i < source.length; i += 1) {
    if (source[i] === '\n') line += 1;
  }
  return line;
}

function blankComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, (block) => block.replace(/[^\n]/g, ' '));
}

function pushClasses(results, value, valueStart, source, file) {
  let offset = 0;
  for (const chunk of value.split(/(\s+)/)) {
    if (!chunk.trim()) {
      offset += chunk.length;
      continue;
    }
    results.push({
      className: chunk,
      line: lineAt(source, valueStart + offset),
      file,
    });
    offset += chunk.length;
  }
}

export function extractFromHtml(html, file = 'html') {
  if (!html) return [];
  const source = blankComments(html);
  const results = [];
  const quoted = /class\s*=\s*(["'])([\s\S]*?)\1/gi;
  let match = quoted.exec(source);
  while (match) {
    const value = match[2];
    const valueStart = match.index + match[0].length - 1 - value.length;
    pushClasses(results, value, valueStart, source, file);
    match = quoted.exec(source);
  }
  return results;
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title']);

function readQuoted(source, start) {
  const quote = source[start];
  let i = start + 1;
  while (i < source.length && source[i] !== quote) {
    if (source[i] === '\\') i += 1;
    i += 1;
  }
  return i < source.length ? i + 1 : i;
}

function skipRawBlock(source, i, tag) {
  const close = new RegExp(`</${tag}\\s*>`, 'i');
  const rest = source.slice(i);
  const match = close.exec(rest);
  if (!match) return source.length;
  return i + match.index + match[0].length;
}

function classesFromOpenTag(tagText, tagStart, source, file) {
  const items = [];
  const quoted = /class\s*=\s*(["'])([\s\S]*?)\1/gi;
  let match = quoted.exec(tagText);
  while (match) {
    const value = match[2];
    const valueStart = tagStart + match.index + match[0].length - 1 - value.length;
    pushClasses(items, value, valueStart, source, file);
    match = quoted.exec(tagText);
  }
  return items;
}

export function walkHtml(html, file = 'html') {
  if (!html) return [];
  const source = blankComments(html);
  const nodes = [];
  const stack = [];
  let i = 0;
  const n = source.length;

  while (i < n) {
    const lt = source.indexOf('<', i);
    if (lt === -1) break;
    i = lt + 1;
    if (i >= n) break;

    if (source.startsWith('!--', i)) {
      const end = source.indexOf('-->', i);
      i = end === -1 ? n : end + 3;
      continue;
    }

    if (source[i] === '!' || source[i] === '?') {
      const end = source.indexOf('>', i);
      i = end === -1 ? n : end + 1;
      continue;
    }

    const isClose = source[i] === '/';
    if (isClose) i += 1;

    const nameStart = i;
    while (i < n && /[A-Za-z0-9:-]/.test(source[i])) i += 1;
    const tag = source.slice(nameStart, i).toLowerCase();
    if (!tag) continue;

    if (isClose) {
      const end = source.indexOf('>', i);
      i = end === -1 ? n : end + 1;
      for (let s = stack.length - 1; s >= 0; s -= 1) {
        if (stack[s].tag === tag) {
          stack.length = s;
          break;
        }
      }
      continue;
    }

    const tagStart = lt;
    while (i < n) {
      const ch = source[i];
      if (ch === '"' || ch === "'") {
        i = readQuoted(source, i);
        continue;
      }
      if (ch === '>') break;
      i += 1;
    }
    const tagEnd = i < n ? i + 1 : i;
    const tagText = source.slice(tagStart, tagEnd);
    const selfClosing = /\/\s*>$/.test(tagText) || VOID_TAGS.has(tag);
    const classes = classesFromOpenTag(tagText, tagStart, source, file);

    nodes.push({
      tag,
      file,
      classes,
      ancestors: stack.map((frame) => frame.classes),
    });

    i = tagEnd;

    if (RAW_TAGS.has(tag) && !selfClosing) {
      i = skipRawBlock(source, i, tag);
      continue;
    }

    if (!selfClosing) {
      stack.push({ tag, classes });
    }
  }

  return nodes;
}

export function maskNonCss(source) {
  if (!source) return '';
  const html = blankComments(source);
  const chars = html.split('');
  const n = html.length;
  let i = 0;
  const stack = [];

  const spaceRange = (from, to) => {
    for (let k = from; k < to && k < n; k += 1) {
      if (chars[k] !== '\n') chars[k] = ' ';
    }
  };

  const keepText = () => stack.length === 0 || stack[stack.length - 1] === 'style';

  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      if (!keepText()) spaceRange(i, n);
      break;
    }

    if (lt > i && !keepText()) spaceRange(i, lt);

    i = lt + 1;
    if (i >= n) {
      spaceRange(lt, n);
      break;
    }

    if (html.startsWith('!--', i)) {
      const end = html.indexOf('-->', i);
      const tagEnd = end === -1 ? n : end + 3;
      spaceRange(lt, tagEnd);
      i = tagEnd;
      continue;
    }

    if (html[i] === '!' || html[i] === '?') {
      const end = html.indexOf('>', i);
      const tagEnd = end === -1 ? n : end + 1;
      spaceRange(lt, tagEnd);
      i = tagEnd;
      continue;
    }

    const isClose = html[i] === '/';
    if (isClose) i += 1;

    const nameStart = i;
    while (i < n && /[A-Za-z0-9:-]/.test(html[i])) i += 1;
    const tag = html.slice(nameStart, i).toLowerCase();
    if (!tag) {
      i = lt + 1;
      continue;
    }

    while (i < n) {
      const ch = html[i];
      if (ch === '"' || ch === "'") {
        i = readQuoted(html, i);
        continue;
      }
      if (ch === '>') break;
      i += 1;
    }
    const tagEnd = i < n ? i + 1 : i;
    const tagText = html.slice(lt, tagEnd);
    const selfClosing = /\/\s*>$/.test(tagText) || VOID_TAGS.has(tag);

    spaceRange(lt, tagEnd);
    i = tagEnd;

    if (isClose) {
      for (let s = stack.length - 1; s >= 0; s -= 1) {
        if (stack[s] === tag) {
          stack.length = s;
          break;
        }
      }
      continue;
    }

    if (RAW_TAGS.has(tag) && tag !== 'style' && !selfClosing) {
      const close = skipRawBlock(html, i, tag);
      spaceRange(i, close);
      i = close;
      continue;
    }

    if (!selfClosing) {
      stack.push(tag);
    }
  }

  return chars.join('');
}

const SELECTOR_STOP = /[\s.#\[\]:,>+~(){}/@]/;
const GROUPING_AT = /^(media|supports|layer|container|scope|document|starting-style)$/i;

export function extractFromCss(css, file = 'css') {
  if (!css) return [];
  const results = [];
  let i = 0;
  let line = 1;
  const n = css.length;
  const stack = [];
  let inAtPrelude = false;
  let nextBraceGrouping = false;

  const bump = (ch) => {
    if (ch === '\n') line += 1;
  };

  const skipString = (quote) => {
    i += 1;
    while (i < n && css[i] !== quote) {
      if (css[i] === '\\') {
        i += 1;
        if (i < n) bump(css[i]);
      } else {
        bump(css[i]);
      }
      i += 1;
    }
    if (i < n) i += 1;
  };

  const skipComment = () => {
    i += 2;
    while (i < n && !(css[i] === '*' && css[i + 1] === '/')) {
      bump(css[i]);
      i += 1;
    }
    i += 2;
  };

  const skipUrl = () => {
    while (i < n && css[i] !== '(') {
      bump(css[i]);
      i += 1;
    }
    if (i < n && css[i] === '(') {
      i += 1;
      while (i < n && css[i] !== ')') {
        if (css[i] === '"' || css[i] === "'") {
          skipString(css[i]);
          continue;
        }
        bump(css[i]);
        i += 1;
      }
      if (i < n) i += 1;
    }
  };

  while (i < n) {
    const ch = css[i];
    const next = css[i + 1];

    if (ch === '/' && next === '*') {
      skipComment();
      continue;
    }

    if (ch === '"' || ch === "'") {
      skipString(ch);
      continue;
    }

    if (ch === 'u' && /url\(/i.test(css.slice(i, i + 4))) {
      skipUrl();
      continue;
    }

    if (ch === '@') {
      inAtPrelude = true;
      i += 1;
      let name = '';
      while (i < n && /[a-zA-Z-]/i.test(css[i])) {
        name += css[i];
        i += 1;
      }
      nextBraceGrouping = GROUPING_AT.test(name);
      continue;
    }

    if (ch === ';' && inAtPrelude) {
      inAtPrelude = false;
      nextBraceGrouping = false;
      i += 1;
      continue;
    }

    if (ch === '{') {
      if (inAtPrelude) {
        stack.push(nextBraceGrouping ? 'grouping' : 'rule');
        inAtPrelude = false;
        nextBraceGrouping = false;
      } else {
        stack.push('rule');
      }
      i += 1;
      continue;
    }

    if (ch === '}') {
      stack.pop();
      i += 1;
      continue;
    }

    const inSelector = !inAtPrelude && (stack.length === 0 || stack[stack.length - 1] === 'grouping');
    if (inSelector && ch === '.') {
      const startLine = line;
      i += 1;
      let name = '';
      while (i < n && !SELECTOR_STOP.test(css[i])) {
        name += css[i];
        bump(css[i]);
        i += 1;
      }
      if (name) {
        results.push({ className: name, line: startLine, file });
      }
      continue;
    }

    bump(ch);
    i += 1;
  }

  return results;
}
