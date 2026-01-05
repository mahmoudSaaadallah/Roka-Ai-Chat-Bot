const app = document.querySelector("#app");

const icon = (path, className = "icon") => `
  <svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    ${path}
  </svg>`;

const icons = {
  sparkles: icon('<path d="m12 3-1.1 3.4a6 6 0 0 1-3.8 3.8L4 11.3l3.1 1a6 6 0 0 1 3.8 3.8L12 19.5l1.1-3.4a6 6 0 0 1 3.8-3.8l3.1-1-3.1-1.1a6 6 0 0 1-3.8-3.8L12 3Z"/><path d="m5 3 .4 1.2A2 2 0 0 0 6.8 5.6L8 6l-1.2.4a2 2 0 0 0-1.4 1.4L5 9l-.4-1.2a2 2 0 0 0-1.4-1.4L2 6l1.2-.4a2 2 0 0 0-1.4-1.4L5 3Z"/>'),
  arrow: icon('<path d="M5 12h14M13 6l6 6-6 6"/>'),
};

const state = {
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
        <p class="sidebar-copy">A calm space for your next idea, question, or creative experiment.</p>
      </aside>

      <main class="main-panel">
        <header class="topbar">
          <h1>New conversation</h1>
          <span>Gemini 2.5 Flash</span>
        </header>

        <section class="content" id="conversation">
          ${renderConversation()}
        </section>

        <footer class="composer-wrap">
          <form class="composer" id="chat-form">
            <input id="chat-input" autocomplete="off" placeholder="Ask Roka anything…" aria-label="Message Roka AI" />
            <button class="primary-button" type="submit">Send ${icons.arrow}</button>
          </form>
        </footer>
      </main>
    </div>`;

  document.querySelector("#chat-form").addEventListener("submit", handleSubmit);
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
