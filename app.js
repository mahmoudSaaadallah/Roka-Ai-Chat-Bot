const app = document.querySelector("#app");

const icon = (path, className = "icon") => `
  <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    ${path}
  </svg>`;

const icons = {
  sparkles: icon('<path d="m12 3-1.1 3.4a6 6 0 0 1-3.8 3.8L4 11.3l3.1 1a6 6 0 0 1 3.8 3.8L12 19.5l1.1-3.4a6 6 0 0 1 3.8-3.8l3.1-1-3.1-1.1a6 6 0 0 1-3.8-3.8L12 3Z"/><path d="m5 3 .4 1.2A2 2 0 0 0 6.8 5.6L8 6l-1.2.4a2 2 0 0 0-1.4 1.4L5 9l-.4-1.2a2 2 0 0 0-1.4-1.4L2 6l1.2-.4a2 2 0 0 0-1.4-1.4L5 3Z"/>'),
  arrow: icon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  chat: icon('<path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.3-4A9 9 0 1 1 21 12Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>'),
  image: icon('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 15-4.5-4.5L8 19"/>'),
  plus: icon('<path d="M12 5v14M5 12h14"/>'),
  settings: icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>'),
};

const state = {
  mode: "chat",
  messages: [],
  loading: false,
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  app.innerHTML = `
    <div class="workspace">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">${icons.sparkles}</span>
          <span>Roka AI</span>
        </div>
        <button class="new-chat-button" type="button" data-action="new-chat">
          ${icons.plus}<span>New conversation</span>
        </button>

        <nav class="primary-nav" aria-label="Workspace">
          <p class="nav-label">Workspace</p>
          <button class="nav-item ${state.mode === "chat" ? "active" : ""}" type="button" data-mode="chat">
            ${icons.chat}<span>AI chat</span><span class="nav-badge">Live</span>
          </button>
          <button class="nav-item ${state.mode === "image" ? "active" : ""}" type="button" data-mode="image">
            ${icons.image}<span>Image studio</span>
          </button>
        </nav>

        <div class="sidebar-spacer"></div>
        <p class="sidebar-copy">A calm space for your next idea, question, or creative experiment.</p>
        <button class="nav-item settings-button" type="button" data-action="settings">
          ${icons.settings}<span>Settings</span>
        </button>
      </aside>

      <main class="main-panel">
        <header class="topbar">
          <div>
            <span class="eyebrow">${state.mode === "chat" ? "AI chat" : "Creative studio"}</span>
            <h1>${state.mode === "chat" ? "New conversation" : "Image studio"}</h1>
          </div>
          <span>Gemini 2.5 Flash</span>
        </header>

        <section class="content" id="conversation">
          ${state.mode === "chat" ? renderConversation() : renderImagePlaceholder()}
        </section>

        <footer class="composer-wrap" ${state.mode === "image" ? "hidden" : ""}>
          <form class="composer" id="chat-form">
            <input id="chat-input" autocomplete="off" placeholder="Ask Roka anything…" aria-label="Message Roka AI" />
            <button class="primary-button" type="submit">Send ${icons.arrow}</button>
          </form>
        </footer>
      </main>
    </div>`;

  document.querySelector("#chat-form").addEventListener("submit", handleSubmit);
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      render();
    });
  });
}

function renderImagePlaceholder() {
  return `
    <div class="empty-state">
      <h2>Imagine it.<br />Make it visible.</h2>
      <p>Describe a scene, mood, or concept and shape it into a polished visual.</p>
    </div>`;
}

function renderConversation() {
  if (!state.messages.length) {
    return `
      <div class="empty-state">
        <h2>Where ideas<br />find momentum.</h2>
        <p>Think out loud, untangle a problem, or turn a rough thought into something worth sharing.</p>
      </div>`;
  }

  return state.messages
    .map((message) => `<p><strong>${message.role === "user" ? "You" : "Roka"}:</strong> ${escapeHtml(message.text)}</p>`)
    .join("");
}

function handleSubmit(event) {
  event.preventDefault();
  const input = document.querySelector("#chat-input");
  const prompt = input.value.trim();
  if (!prompt) return;

  state.messages.push({ role: "user", text: prompt });
  input.value = "";
  render();
}

render();
