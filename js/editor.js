const SKIP_PROTO = /^(https?|mailto|ftp)$/i;

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function token(type, text) {
  if (!text) return '';
  return `<span class="pane__token pane__token_${type}">${escapeHtml(text)}</span>`;
}

function readTagEnd(source, start) {
  let i = start + 1;
  const n = source.length;
  while (i < n) {
    const ch = source[i];
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      while (i < n && source[i] !== quote) i += 1;
      i += 1;
      continue;
    }
    if (ch === '>') return i + 1;
    i += 1;
  }
  return n;
}

function highlightTag(tag) {
  let html = '';
  const n = tag.length;
  let i = 0;

  const push = (type, text) => {
    html += type ? token(type, text) : escapeHtml(text);
  };

  push('mark', '<');
  i = 1;
  if (tag[i] === '/') {
    push('mark', '/');
    i += 1;
  }

  if (tag[i] === '!' || tag[i] === '?') {
    push('tag', tag.slice(i, n - 1));
    if (tag[n - 1] === '>') push('mark', '>');
    return html;
  }

  const nameStart = i;
  while (i < n - 1 && /[A-Za-z0-9:-]/.test(tag[i])) i += 1;
  push('tag', tag.slice(nameStart, i));

  while (i < n - 1) {
    while (i < n - 1 && /\s/.test(tag[i])) {
      push('', tag[i]);
      i += 1;
    }
    if (i >= n - 1) break;
    if (tag[i] === '/') {
      push('mark', '/');
      i += 1;
      continue;
    }

    const attrStart = i;
    while (i < n - 1 && /[^\s=/>]/.test(tag[i])) i += 1;
    if (i > attrStart) push('attribute', tag.slice(attrStart, i));

    while (i < n - 1 && /\s/.test(tag[i])) {
      push('', tag[i]);
      i += 1;
    }

    if (tag[i] === '=') {
      push('mark', '=');
      i += 1;
      while (i < n - 1 && /\s/.test(tag[i])) {
        push('', tag[i]);
        i += 1;
      }
      if (tag[i] === '"' || tag[i] === "'") {
        const quote = tag[i];
        let j = i + 1;
        while (j < n - 1 && tag[j] !== quote) j += 1;
        if (tag[j] === quote) j += 1;
        push('string', tag.slice(i, j));
        i = j;
      }
    }
  }

  if (tag[n - 1] === '>') push('mark', '>');
  else if (i < n) push('', tag.slice(i));
  return html;
}

export function highlightCode(source) {
  let i = 0;
  const n = source.length;
  let html = '';

  const push = (type, text) => {
    html += type ? token(type, text) : escapeHtml(text);
  };

  const take = (re) => {
    const start = i;
    while (i < n && re.test(source[i])) i += 1;
    return source.slice(start, i);
  };

  while (i < n) {
    if (source.startsWith('<!--', i)) {
      const end = source.indexOf('-->', i + 4);
      const close = end === -1 ? n : end + 3;
      push('comment', source.slice(i, close));
      i = close;
      continue;
    }

    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      const close = end === -1 ? n : end + 2;
      push('comment', source.slice(i, close));
      i = close;
      continue;
    }

    if (source[i] === '<' && /[A-Za-z/!?]/.test(source[i + 1] || '')) {
      const end = readTagEnd(source, i);
      html += highlightTag(source.slice(i, end));
      i = end;
      continue;
    }

    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      let j = i + 1;
      while (j < n && source[j] !== quote) {
        if (source[j] === '\\') j += 1;
        j += 1;
      }
      if (j < n) j += 1;
      push('string', source.slice(i, j));
      i = j;
      continue;
    }

    if (source[i] === '#' && /[A-Za-z0-9_-]/.test(source[i + 1] || '')) {
      i += 1;
      push('selector', `#${take(/[A-Za-z0-9_-]/)}`);
      continue;
    }

    if (source[i] === '.' && /[A-Za-z_-]/.test(source[i + 1] || '')) {
      i += 1;
      push('selector', `.${take(/[A-Za-z0-9_-]/)}`);
      continue;
    }

    if (source[i] === '@' && /[A-Za-z-]/.test(source[i + 1] || '')) {
      i += 1;
      push('keyword', `@${take(/[A-Za-z-]/)}`);
      continue;
    }

    if (/[A-Za-z-]/.test(source[i])) {
      const ident = take(/[A-Za-z0-9-]/);
      let k = i;
      while (k < n && /\s/.test(source[k])) k += 1;
      if (source[k] === ':' && !SKIP_PROTO.test(ident)) {
        push('property', ident);
        continue;
      }
      push('', ident);
      continue;
    }

    if (/[0-9]/.test(source[i])) {
      const num = take(/[0-9.%]/);
      const unit = /[A-Za-z%]/.test(source[i] || '') ? take(/[A-Za-z%]/) : '';
      push('number', num + unit);
      continue;
    }

    if (/[{}();:,]/.test(source[i])) {
      push('mark', source[i]);
      i += 1;
      continue;
    }

    push('', source[i]);
    i += 1;
  }

  return html;
}

function lineCount(value) {
  return value.split('\n').length;
}

function caretLine(value, pos) {
  return value.slice(0, pos).split('\n').length;
}

export function attachEditor(textarea) {
  const pane = textarea.closest('.pane');
  const gutter = pane.querySelector('.pane__lines');
  const highlight = pane.querySelector('.pane__highlight');
  let frame = 0;

  function renderGutter(count, current) {
    const digits = String(count).length;
    gutter.style.minWidth = `${Math.max(3, digits + 2)}ch`;
    const lines = [];
    for (let i = 1; i <= count; i += 1) {
      const cls = i === current ? 'pane__line pane__line_active' : 'pane__line';
      lines.push(`<span class="${cls}">${i}</span>`);
    }
    gutter.innerHTML = lines.join('');
  }

  function sync() {
    const value = textarea.value;
    const current = caretLine(value, textarea.selectionStart || 0);
    highlight.innerHTML = highlightCode(value) + '\n';
    renderGutter(lineCount(value), current);
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
    gutter.scrollTop = textarea.scrollTop;
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      sync();
    });
  }

  textarea.addEventListener('input', schedule);
  textarea.addEventListener('scroll', () => {
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
    gutter.scrollTop = textarea.scrollTop;
  });
  textarea.addEventListener('click', schedule);
  textarea.addEventListener('keyup', schedule);
  textarea.addEventListener('select', schedule);

  textarea.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    if (event.shiftKey) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const indent = value.slice(lineStart, lineStart + 2) === '  ' ? 2 : value[lineStart] === '\t' ? 1 : 0;
      if (!indent) return;
      textarea.setRangeText('', lineStart, lineStart + indent, 'end');
      textarea.selectionStart = Math.max(lineStart, start - indent);
      textarea.selectionEnd = Math.max(lineStart, end - indent);
    } else {
      textarea.setRangeText('  ', start, end, 'end');
    }
    schedule();
  });

  gutter.addEventListener('mousedown', (event) => {
    event.preventDefault();
    textarea.focus();
    const rect = gutter.getBoundingClientRect();
    const styles = getComputedStyle(gutter);
    const lineHeight = parseFloat(styles.lineHeight);
    const paddingTop = parseFloat(styles.paddingTop);
    const y = event.clientY - rect.top - paddingTop + gutter.scrollTop;
    const line = Math.min(lineCount(textarea.value), Math.max(1, Math.floor(y / lineHeight) + 1));
    const lines = textarea.value.split('\n');
    let pos = 0;
    for (let i = 0; i < line - 1; i += 1) pos += lines[i].length + 1;
    textarea.setSelectionRange(pos, pos);
    schedule();
  });

  sync();

  return {
    getValue: () => textarea.value,
    setValue(value) {
      textarea.value = value;
      sync();
    },
    sync,
  };
}
