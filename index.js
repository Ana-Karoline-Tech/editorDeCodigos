// Global variables
let monacoEditors = {};
let currentTab = "js";
let explorerVisible = true;
let currentFile = "script.js";

// File System
let fileSystem = {
  "index.html": { type: "file", content: "", language: "html" },
  "style.css": { type: "file", content: "", language: "css" },
  "script.js": { type: "file", content: "", language: "javascript" },
};

// Elements
const tabs = {
  html: document.getElementById("tab-html"),
  css: document.getElementById("tab-css"),
  js: document.getElementById("tab-js"),
};
const preview = document.getElementById("preview");
const currentFileEl = document.getElementById("current-file");
const currentFileHeaderEl = document.getElementById("current-file-header");
const languageEl = document.getElementById("language");
const explorerEl = document.getElementById("explorer");
const explorerArrow = document.getElementById("explorer-arrow");
const consoleOutput = document.getElementById("js-console-output");
const consolePanel = document.getElementById("console-panel");
const toggleConsoleBtn = document.getElementById("btn-toggle-console");

// File System Functions
function getFileIcon(filename) {
  if (filename.endsWith(".html")) return "📄";
  if (filename.endsWith(".css")) return "🎨";
  if (filename.endsWith(".js") || filename.endsWith(".jsx")) return "⚡";
  if (filename.endsWith(".json")) return "📋";
  return "📄";
}

function renderFileTree() {
  const fileTree = document.getElementById("file-tree");
  fileTree.innerHTML = "";

  Object.keys(fileSystem)
    .sort()
    .forEach((name) => {
      const item = fileSystem[name];

      if (item.type === "file") {
        const fileDiv = document.createElement("div");
        fileDiv.className =
          "file-item" + (currentFile === name ? " active" : "");
        fileDiv.innerHTML = `${getFileIcon(name)} ${name}`;
        fileDiv.onclick = () => openFile(name);
        fileTree.appendChild(fileDiv);
      }
    });
}

function openFile(filename) {
  if (!fileSystem[filename] || fileSystem[filename].type !== "file") return;

  // Save current file
  if (monacoEditors[fileSystem[currentFile]?.language]) {
    fileSystem[currentFile].content =
      monacoEditors[fileSystem[currentFile].language].getValue();
  }

  currentFile = filename;
  const file = fileSystem[filename];

  // Update header
  currentFileEl.textContent = filename;
  currentFileHeaderEl.textContent = filename;

  // Switch tab
  if (file.language === "html") switchTab("html");
  else if (file.language === "css") switchTab("css");
  else if (file.language === "javascript") switchTab("js");

  // Load content
  if (monacoEditors[file.language]) {
    monacoEditors[file.language].setValue(file.content);
  }

  renderFileTree();
}

function createNewFile() {
  const name = prompt("Nome do arquivo (ex: Button.jsx):");
  if (!name || !name.trim()) return;

  if (fileSystem[name]) {
    alert("Arquivo já existe!");
    return;
  }

  let language = "html";
  if (name.endsWith(".css")) language = "css";
  else if (name.endsWith(".js") || name.endsWith(".jsx"))
    language = "javascript";
  else if (name.endsWith(".json")) language = "json";

  fileSystem[name] = { type: "file", content: "", language };
  renderFileTree();
  openFile(name);
}

function createNewFolder() {
  alert(
    'Pastas serão implementadas em breve! Por enquanto, use nomes como "components/Button.jsx"',
  );
}

function toggleExplorer() {
  explorerVisible = !explorerVisible;

  if (explorerVisible) {
    explorerEl.classList.remove("hidden");
    explorerArrow.textContent = "◀";
  } else {
    explorerEl.classList.add("hidden");
    explorerArrow.textContent = "▶";
  }
}

function switchTab(tab) {
  // Remove active from all tabs
  Object.values(tabs).forEach((t) => t.classList.remove("active"));

  // Hide all editors
  document.getElementById("editor-html").classList.add("hidden");
  document.getElementById("editor-css").classList.add("hidden");
  document.getElementById("editor-js").classList.add("hidden");

  const previewPanel = document.getElementById("preview-panel");
  const editorPanel = document.querySelector(".editor-panel");

  if (tab === "html") {
    tabs.html.classList.add("active");
    document.getElementById("editor-html").classList.remove("hidden");
    languageEl.textContent = "HTML";
    previewPanel.style.display = "block";
    editorPanel.style.width = "50%";
    editorPanel.style.borderRight = "1px solid #112240";
    if (monacoEditors.html) monacoEditors.html.focus();
  } else if (tab === "css") {
    tabs.css.classList.add("active");
    document.getElementById("editor-css").classList.remove("hidden");
    languageEl.textContent = "CSS";
    previewPanel.style.display = "block";
    editorPanel.style.width = "50%";
    editorPanel.style.borderRight = "1px solid #112240";
    if (monacoEditors.css) monacoEditors.css.focus();
  } else if (tab === "js") {
    tabs.js.classList.add("active");
    document.getElementById("editor-js").classList.remove("hidden");
    languageEl.textContent = "JavaScript";
    previewPanel.style.display = "none";
    editorPanel.style.width = "100%";
    editorPanel.style.borderRight = "none";
    toggleConsoleBtn.classList.remove("hidden");
    toggleConsoleBtn.textContent = consolePanel.classList.contains("hidden")
      ? "🖥️"
      : "×";
    toggleConsoleBtn.title = consolePanel.classList.contains("hidden")
      ? "Mostrar/Ocultar console"
      : "Ocultar console";
    if (monacoEditors.js) monacoEditors.js.focus();
  } else {
    toggleConsoleBtn.classList.add("hidden");
  }

  currentTab = tab;
}

function toggleConsole() {
  consolePanel.classList.toggle("hidden");
  const isHidden = consolePanel.classList.contains("hidden");
  toggleConsoleBtn.textContent = isHidden ? "🖥️" : "×";
  toggleConsoleBtn.title = isHidden
    ? "Mostrar/Ocultar console"
    : "Ocultar console";
}

// Console Functions
function clearConsole() {
  consoleOutput.innerHTML = "";
}

function addToConsole(message, type = "log") {
  const div = document.createElement("div");
  div.className = "console-line console-" + type;

  let displayMsg = "";
  if (typeof message === "object" && message !== null) {
    try {
      displayMsg = JSON.stringify(message, null, 2);
    } catch (e) {
      displayMsg = String(message);
    }
  } else {
    displayMsg = String(message);
  }

  div.textContent = displayMsg;
  consoleOutput.appendChild(div);
  consoleOutput.parentElement.scrollTop =
    consoleOutput.parentElement.scrollHeight;
}

function addTableToConsole(data) {
  const wrapper = document.createElement("div");

  if (Array.isArray(data)) {
    if (data.length === 0) {
      wrapper.textContent = "(vazio)";
      consoleOutput.appendChild(wrapper);
      return;
    }

    const table = document.createElement("table");
    table.className = "console-table";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const indexHeader = document.createElement("th");
    indexHeader.textContent = "(index)";
    headerRow.appendChild(indexHeader);

    const keys = Object.keys(data[0] || {});
    keys.forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach((item, index) => {
      const row = document.createElement("tr");
      const indexCell = document.createElement("td");
      indexCell.textContent = index;
      indexCell.style.color = "#888";
      row.appendChild(indexCell);

      keys.forEach((key) => {
        const td = document.createElement("td");
        const value = item[key];
        td.textContent =
          typeof value === "object" ? JSON.stringify(value) : value;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
  } else if (typeof data === "object" && data !== null) {
    const table = document.createElement("table");
    table.className = "console-table";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const keyHeader = document.createElement("th");
    keyHeader.textContent = "(index)";
    headerRow.appendChild(keyHeader);
    const valueHeader = document.createElement("th");
    valueHeader.textContent = "Value";
    headerRow.appendChild(valueHeader);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    Object.entries(data).forEach(([key, value]) => {
      const row = document.createElement("tr");
      const keyCell = document.createElement("td");
      keyCell.textContent = key;
      keyCell.style.color = "#888";
      row.appendChild(keyCell);

      const valueCell = document.createElement("td");
      valueCell.textContent =
        typeof value === "object" ? JSON.stringify(value) : value;
      row.appendChild(valueCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
  }

  consoleOutput.appendChild(wrapper);
  consoleOutput.parentElement.scrollTop =
    consoleOutput.parentElement.scrollHeight;
}

function runJavaScriptInConsole() {
  if (!monacoEditors.js) return;
  clearConsole();
}

function handleIframeConsoleMessage(event) {
  const message = event.data?.navyConsole;
  if (!message || typeof message !== "object") return;

  if (message.type === "table") {
    addTableToConsole(message.args[0]);
  } else {
    message.args.forEach((arg) => addToConsole(arg, message.type));
  }
}

window.addEventListener("message", handleIframeConsoleMessage);

// Event Listeners
document
  .getElementById("toggle-explorer")
  .addEventListener("click", toggleExplorer);
document
  .getElementById("btn-new-file")
  .addEventListener("click", createNewFile);
document
  .getElementById("btn-new-folder")
  .addEventListener("click", createNewFolder);
document
  .getElementById("btn-clear-console")
  .addEventListener("click", clearConsole);
if (toggleConsoleBtn) toggleConsoleBtn.addEventListener("click", toggleConsole);
tabs.html.addEventListener("click", () => switchTab("html"));
tabs.css.addEventListener("click", () => switchTab("css"));
tabs.js.addEventListener("click", () => switchTab("js"));

// Monaco Editor Initialization
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
  },
});

require(["vs/editor/editor.main"], function () {
  monaco.editor.defineTheme("navyTheme", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6A9955" },
      { token: "keyword", foreground: "C586C0" },
      { token: "string", foreground: "CE9178" },
      { token: "number", foreground: "B5CEA8" },
      { token: "tag", foreground: "569CD6" },
      { token: "attribute.name", foreground: "9CDCFE" },
    ],
    colors: {
      "editor.background": "#0a192f",
      "editor.foreground": "#e6f1ff",
      "editor.lineHighlightBackground": "#112240",
      "editorCursor.foreground": "#64ffda",
      "editor.selectionBackground": "#64ffda33",
    },
  });

  monacoEditors.html = monaco.editor.create(
    document.getElementById("editor-html"),
    {
      value: "",
      language: "html",
      theme: "navyTheme",
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      lineNumbers: "on",
      lineNumbersMinChars: 3,
    },
  );

  monacoEditors.css = monaco.editor.create(
    document.getElementById("editor-css"),
    {
      value: "",
      language: "css",
      theme: "navyTheme",
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      lineNumbers: "on",
      lineNumbersMinChars: 3,
    },
  );

  monacoEditors.js = monaco.editor.create(
    document.getElementById("js-monaco-editor"),
    {
      value: "",
      language: "javascript",
      theme: "navyTheme",
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      lineNumbers: "on",
      lineNumbersMinChars: 3,
    },
  );

  monacoEditors.html.onDidChangeModelContent(updatePreview);
  monacoEditors.css.onDidChangeModelContent(updatePreview);
  monacoEditors.js.onDidChangeModelContent(function () {
    updatePreview();
    runJavaScriptInConsole();
  });

  renderFileTree();
  switchTab(currentTab);
  updatePreview();
});

function updatePreview() {
  if (!monacoEditors.html) return;

  const html = monacoEditors.html.getValue();
  const css = monacoEditors.css.getValue();
  const js = monacoEditors.js.getValue();

  const previewContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        (function() {
            const sendConsole = (type, args) => {
                window.parent.postMessage({ navyConsole: { type, args } }, '*');
            };

            ['log', 'error', 'warn'].forEach(type => {
                const original = console[type];
                console[type] = function(...args) {
                    sendConsole(type, args);
                    if (original) original.apply(console, args);
                };
            });

            const originalTable = console.table;
            console.table = function(data) {
                sendConsole('table', [data]);
                if (originalTable) originalTable.call(console, data);
            };
        })();
            ${js}
        } catch(e) {
            console.error('Erro:', e);
        }
    <\/script>
</body>
</html>`;

  preview.srcdoc = previewContent;
}
