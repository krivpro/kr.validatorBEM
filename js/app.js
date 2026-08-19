import { validate } from './engine/validate.js';

const form = document.querySelector('#form');
const htmlInput = document.querySelector('#html-input');
const cssInput = document.querySelector('#css-input');
const htmlFile = document.querySelector('#html-file');
const cssFile = document.querySelector('#css-file');
const report = document.querySelector('#report');

const RULE_LABELS = {
  latin: 'Латиница',
  english: 'Английский',
  translit: 'Транслит',
  bem: 'БЭМ',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderMessage(error) {
  let html = escapeHtml(error.message);
  if (error.suggest) {
    html = html.replace(
      `Правильно: ${error.suggest}`,
      `Правильно: <code class="suggest">${escapeHtml(error.suggest)}</code>`,
    );
  }
  if (error.suggestClass) {
    html = html.replace(
      `.${error.suggestClass}`,
      `.<code class="suggest">${escapeHtml(error.suggestClass)}</code>`,
    );
  }
  return html;
}

function renderReport(result) {
  if (!htmlInput.value.trim() && !cssInput.value.trim()) {
    report.innerHTML =
      '<p class="report__placeholder">Вставьте HTML или CSS и нажмите «Проверить».</p>';
    return;
  }

  if (result.total === 0) {
    report.innerHTML =
      '<p class="report__empty">Классы не найдены. Проверьте, что в HTML есть class="...", а в CSS — селекторы вида .block.</p>';
    return;
  }

  if (result.errors.length === 0) {
    report.innerHTML = `
      <div class="report__head">
        <h2 class="report__title">Результат</h2>
        <span class="badge badge_ok">Ок</span>
      </div>
      <p class="report__empty">Замечаний нет: ${result.total} ${plural(result.total, 'класс', 'класса', 'классов')} соответствуют правилам.</p>
    `;
    return;
  }

  const rows = result.errors
    .map(
      (error) => `
        <tr class="table__row">
          <td class="table__cell">${escapeHtml(error.file)}</td>
          <td class="table__cell">${error.line}</td>
          <td class="table__cell table__cell_code">.${escapeHtml(error.className)}</td>
          <td class="table__cell"><span class="rule rule_${error.rule}">${RULE_LABELS[error.rule] || error.rule}</span></td>
          <td class="table__cell">${renderMessage(error)}</td>
        </tr>`,
    )
    .join('');

  report.innerHTML = `
    <div class="report__head">
      <h2 class="report__title">Результат</h2>
      <span class="badge badge_fail">${result.errors.length} ${plural(result.errors.length, 'замечание', 'замечания', 'замечаний')}</span>
    </div>
    <p class="report__count">Проверено классов: ${result.total}</p>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr class="table__head">
            <th class="table__cell">Файл</th>
            <th class="table__cell">Строка</th>
            <th class="table__cell">Класс</th>
            <th class="table__cell">Правило</th>
            <th class="table__cell">Пояснение</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function runValidation() {
  const result = validate({
    html: htmlInput.value,
    css: cssInput.value,
  });
  renderReport(result);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function isCssFile(file) {
  return /\.css$/i.test(file.name) || file.type === 'text/css';
}

async function applyFile(file, target) {
  const text = await readFile(file);
  if (target === 'css' || isCssFile(file)) {
    cssInput.value = text;
  } else {
    htmlInput.value = text;
  }
}

function bindDrop(pane, target) {
  const zone = pane.querySelector('.pane__input');

  const on = () => pane.classList.add('pane_drop');
  const off = () => pane.classList.remove('pane_drop');

  zone.addEventListener('dragover', (event) => {
    event.preventDefault();
    on();
  });
  zone.addEventListener('dragleave', off);
  zone.addEventListener('drop', async (event) => {
    event.preventDefault();
    off();
    const file = event.dataTransfer?.files?.[0];
    if (file) await applyFile(file, target);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  runValidation();
});

form.addEventListener('reset', () => {
  window.setTimeout(() => {
    report.innerHTML =
      '<p class="report__placeholder">Вставьте HTML или CSS и нажмите «Проверить». Код никуда не отправляется — всё считается в браузере.</p>';
  }, 0);
});

htmlFile.addEventListener('change', async () => {
  const file = htmlFile.files?.[0];
  if (file) await applyFile(file, 'html');
  htmlFile.value = '';
});

cssFile.addEventListener('change', async () => {
  const file = cssFile.files?.[0];
  if (file) await applyFile(file, 'css');
  cssFile.value = '';
});

bindDrop(htmlInput.closest('.pane'), 'html');
bindDrop(cssInput.closest('.pane'), 'css');

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    runValidation();
  }
});
