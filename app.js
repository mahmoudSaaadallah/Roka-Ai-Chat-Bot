import { GoogleGenAI } from "@google/genai";

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
  copy: icon('<rect x="9" y="9" width="10" height="10" rx="2"/><path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>'),
  paperclip: icon('<path d="m20.5 11.5-8.8 8.8a6 6 0 0 1-8.5-8.5l9.1-9.1a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 1 1-2.8-2.8l8.5-8.5"/>'),
  wand: icon('<path d="m15 4 5 5L8 21H3v-5L15 4Z"/><path d="m13 6 5 5M6 3v3M4.5 4.5h3M19 16v4M17 18h4"/>'),
  download: icon('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>'),
  refresh: icon('<path d="M20 7h-5V2"/><path d="M20 7a9 9 0 1 0 1 7"/>'),
};

const state = {
  mode: "chat",
  messages: [],
  loading: false,
  apiKey: sessionStorage.getItem("roka_api_key") || "",
  imageLoading: false,
  imagePrompt: "",
  imageUrl: "",
  imageRatio: "square",
  imageStyle: "cinematic",
  imageError: "",
  showSettings: false,
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
          <div class="model-status">
            <span class="status-dot ${state.apiKey ? "" : "offline"}"></span>
            <span>Gemini 2.5 Flash</span>
          </div>
        </header>

        <section class="content" id="conversation">
          ${state.mode === "chat" ? renderConversation() : renderImagePlaceholder()}
        </section>

        <footer class="composer-wrap" ${state.mode === "image" ? "hidden" : ""}>
          <form class="composer" id="chat-form">
            <textarea id="chat-input" rows="1" maxlength="2000" autocomplete="off" placeholder="Ask Roka anything…" aria-label="Message Roka AI"></textarea>
            <div class="composer-actions">
              <div class="composer-tools">
                <button class="icon-button" type="button" aria-label="Attach a file" title="Attachments coming soon">${icons.paperclip}</button>
                <span class="composer-hint">Enter to send · Shift + Enter for a new line</span>
              </div>
              <button class="send-button" type="submit" aria-label="Send message">${icons.arrow}</button>
            </div>
          </form>
          <p class="composer-note">Roka can make mistakes. Check important information.</p>
        </footer>
      </main>
    </div>
    ${state.showSettings ? renderSettingsModal() : ""}`;

  document.querySelector("#chat-form").addEventListener("submit", handleSubmit);
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      render();
    });
  });
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector("#chat-input");
      input.value = button.dataset.prompt;
      input.focus();
    });
  });
  document.querySelector('[data-action="new-chat"]').addEventListener("click", () => {
    state.mode = "chat";
    state.messages = [];
    render();
    document.querySelector("#chat-input").focus();
  });
  document.querySelector('[data-action="settings"]').addEventListener("click", () => {
    state.showSettings = true;
    render();
    document.querySelector("#api-key").focus();
  });
  document.querySelectorAll("[data-close-settings]").forEach((button) => {
    button.addEventListener("click", () => {
      state.showSettings = false;
      render();
    });
  });
  const settingsForm = document.querySelector("#settings-form");
  if (settingsForm) settingsForm.addEventListener("submit", handleSettingsSubmit);
  document.querySelectorAll("[data-copy-message]").forEach((button) => {
    button.addEventListener("click", async () => {
      const message = state.messages[Number(button.dataset.copyMessage)];
      await navigator.clipboard.writeText(message.text);
      button.querySelector("span").textContent = "Copied";
    });
  });
  const composerInput = document.querySelector("#chat-input");
  composerInput.addEventListener("input", () => {
    composerInput.style.height = "auto";
    composerInput.style.height = `${Math.min(composerInput.scrollHeight, 160)}px`;
  });
  composerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      document.querySelector("#chat-form").requestSubmit();
    }
  });
  if (state.loading) composerInput.disabled = true;
  const imageForm = document.querySelector("#image-form");
  if (imageForm) imageForm.addEventListener("submit", handleImageSubmit);
  const regenerateButton = document.querySelector("[data-regenerate]");
  if (regenerateButton) {
    regenerateButton.addEventListener("click", () => document.querySelector("#image-form").requestSubmit());
  }
  document.querySelectorAll("[data-image-ratio]").forEach((button) => {
    button.addEventListener("click", () => {
      state.imagePrompt = document.querySelector("#image-prompt").value;
      state.imageRatio = button.dataset.imageRatio;
      render();
    });
  });
  document.querySelectorAll("[data-image-style]").forEach((button) => {
    button.addEventListener("click", () => {
      state.imagePrompt = document.querySelector("#image-prompt").value;
      state.imageStyle = button.dataset.imageStyle;
      render();
    });
  });
  requestAnimationFrame(() => {
    const conversation = document.querySelector("#conversation");
    conversation.scrollTop = conversation.scrollHeight;
  });
}

function renderSettingsModal() {
  return `
    <div class="modal-backdrop" data-close-settings>
      <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <span class="eyebrow">Preferences</span>
            <h2 id="settings-title">Connect your model</h2>
          </div>
          <button class="modal-close" type="button" data-close-settings aria-label="Close settings">×</button>
        </div>
        <p class="modal-copy">Add a Gemini API key to power conversations. The key is kept in this browser tab only and is cleared when the tab closes.</p>
        <form id="settings-form">
          <label for="api-key">Gemini API key</label>
          <input id="api-key" name="apiKey" type="password" value="${escapeHtml(state.apiKey)}" placeholder="AIza…" autocomplete="off" />
          <div class="privacy-note">
            <span class="status-dot"></span>
            <span>Session-only storage · never committed to the project</span>
          </div>
          <div class="modal-actions">
            <button class="secondary-button" type="button" data-close-settings>Cancel</button>
            <button class="primary-button" type="submit">Save connection</button>
          </div>
        </form>
      </section>
    </div>`;
}

function handleSettingsSubmit(event) {
  event.preventDefault();
  const apiKey = new FormData(event.currentTarget).get("apiKey").trim();
  state.apiKey = apiKey;
  if (apiKey) sessionStorage.setItem("roka_api_key", apiKey);
  else sessionStorage.removeItem("roka_api_key");
  state.showSettings = false;
  render();
}

function renderImagePlaceholder() {
  return `
    <div class="image-studio">
      <div class="studio-intro">
        <span class="welcome-kicker">Image studio</span>
        <h2>Give your imagination<br /><span>somewhere to land.</span></h2>
        <p>Start with a vivid description. Roka will turn it into a high-resolution square image.</p>
      </div>

      <div class="studio-card">
        <div class="image-canvas ratio-${state.imageRatio} ${state.imageLoading ? "loading" : ""}">
          ${renderImageCanvas()}
        </div>
        <form class="image-form" id="image-form">
          <label for="image-prompt">Describe your image</label>
          <textarea id="image-prompt" rows="3" maxlength="600" placeholder="A quiet glass cabin beneath the northern lights, cinematic light…">${escapeHtml(state.imagePrompt)}</textarea>
          ${state.imageError ? `<p class="studio-error" role="alert">${escapeHtml(state.imageError)}</p>` : ""}
          <fieldset class="studio-fieldset">
            <legend>Aspect ratio</legend>
            <div class="option-row">
              <button class="option-chip ${state.imageRatio === "square" ? "active" : ""}" type="button" data-image-ratio="square"><i class="ratio-icon square"></i>Square</button>
              <button class="option-chip ${state.imageRatio === "portrait" ? "active" : ""}" type="button" data-image-ratio="portrait"><i class="ratio-icon portrait"></i>Portrait</button>
              <button class="option-chip ${state.imageRatio === "landscape" ? "active" : ""}" type="button" data-image-ratio="landscape"><i class="ratio-icon landscape"></i>Wide</button>
            </div>
          </fieldset>
          <fieldset class="studio-fieldset">
            <legend>Visual style</legend>
            <div class="style-row">
              ${["cinematic", "editorial", "anime", "minimal"]
                .map((style) => `<button class="style-chip ${state.imageStyle === style ? "active" : ""}" type="button" data-image-style="${style}">${style}</button>`)
                .join("")}
            </div>
          </fieldset>
          <button class="primary-button studio-generate" type="submit" ${state.imageLoading ? "disabled" : ""}>
            ${icons.wand}<span>${state.imageLoading ? "Creating…" : "Create image"}</span>
          </button>
        </form>
      </div>
    </div>`;
}

function renderImageCanvas() {
  if (state.imageLoading) {
    return `<div class="image-loading"><span>${icons.sparkles}</span><strong>Bringing your idea to life</strong><small>This can take a few moments.</small></div>`;
  }
  if (state.imageUrl) {
    return `
      <img src="${state.imageUrl}" alt="${escapeHtml(state.imagePrompt)}" />
      <div class="image-result-actions">
        <a class="canvas-action" href="${state.imageUrl}" target="_blank" rel="noopener" download="roka-ai-image.jpg">${icons.download}<span>Download</span></a>
        <button class="canvas-action" type="button" data-regenerate>${icons.refresh}<span>Regenerate</span></button>
      </div>`;
  }
  return `<div class="image-empty"><span>${icons.image}</span><strong>Your canvas is ready</strong><small>The generated image will appear here.</small></div>`;
}

function handleImageSubmit(event) {
  event.preventDefault();
  const input = document.querySelector("#image-prompt");
  const prompt = input.value.trim();
  if (!prompt || state.imageLoading) return;

  state.imagePrompt = prompt;
  state.imageLoading = true;
  state.imageUrl = "";
  state.imageError = "";
  render();

  const sizes = {
    square: [1024, 1024],
    portrait: [832, 1040],
    landscape: [1216, 832],
  };
  const [width, height] = sizes[state.imageRatio];
  const styledPrompt = `${prompt}, ${state.imageStyle} visual style`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(styledPrompt)}?width=${width}&height=${height}&nologo=true`;
  const generated = new Image();
  generated.onload = () => {
    state.imageUrl = url;
    state.imageLoading = false;
    render();
  };
  generated.onerror = () => {
    state.imageLoading = false;
    state.imageError = "The image service didn't respond. Please try again in a moment.";
    render();
  };
  generated.src = url;
}

function renderConversation() {
  if (!state.messages.length) {
    return `
      <div class="empty-state welcome-state">
        <div class="welcome-orb" aria-hidden="true">
          <span>${icons.sparkles}</span>
        </div>
        <span class="welcome-kicker">Your creative thinking partner</span>
        <h2>Where ideas<br /><span>find momentum.</span></h2>
        <p>Think out loud, untangle a problem, or turn a rough thought into something worth sharing.</p>

        <div class="prompt-grid" aria-label="Suggested prompts">
          <button class="prompt-card" type="button" data-prompt="Help me turn a rough idea into a clear plan">
            <span class="prompt-number">01</span>
            <strong>Shape an idea</strong>
            <span>Turn scattered thoughts into a clear direction.</span>
            <span class="prompt-arrow">${icons.arrow}</span>
          </button>
          <button class="prompt-card" type="button" data-prompt="Explain a complex topic to me in simple terms">
            <span class="prompt-number">02</span>
            <strong>Learn something</strong>
            <span>Make a complex topic feel approachable.</span>
            <span class="prompt-arrow">${icons.arrow}</span>
          </button>
          <button class="prompt-card" type="button" data-prompt="Help me write something memorable and concise">
            <span class="prompt-number">03</span>
            <strong>Write with impact</strong>
            <span>Find the words that make the message land.</span>
            <span class="prompt-arrow">${icons.arrow}</span>
          </button>
        </div>
      </div>`;
  }

  return `
    <div class="message-list">
      ${state.messages
        .map((message, index) => {
          const isUser = message.role === "user";
          return `
            <article class="message-row ${isUser ? "user-message" : "assistant-message"}">
              <div class="message-avatar" aria-hidden="true">
                ${isUser ? "Y" : icons.sparkles}
              </div>
              <div class="message-body">
                <div class="message-meta">
                  <strong>${isUser ? "You" : "Roka"}</strong>
                  <span>${message.time || "Just now"}</span>
                </div>
                <div class="message-bubble">${escapeHtml(message.text).replaceAll("\n", "<br />")}</div>
                ${
                  isUser
                    ? ""
                    : `<button class="message-action" type="button" data-copy-message="${index}" aria-label="Copy response">${icons.copy}<span>Copy</span></button>`
                }
              </div>
            </article>`;
        })
        .join("")}
      ${state.loading ? renderTypingIndicator() : ""}
    </div>`;
}

function renderTypingIndicator() {
  return `
    <article class="message-row assistant-message typing-row">
      <div class="message-avatar" aria-hidden="true">${icons.sparkles}</div>
      <div class="message-body">
        <div class="message-meta"><strong>Roka</strong><span>Thinking</span></div>
        <div class="message-bubble typing-bubble" aria-label="Roka is thinking">
          <i></i><i></i><i></i>
        </div>
      </div>
    </article>`;
}

async function generateReply(prompt) {
  if (!state.apiKey) {
    return "Add your Gemini API key in Settings to start chatting. It stays only in this browser session.";
  }

  const ai = new GoogleGenAI({ apiKey: state.apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: state.messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.text }],
    })),
  });
  return response.text;
}

async function handleSubmit(event) {
  event.preventDefault();
  const input = document.querySelector("#chat-input");
  const prompt = input.value.trim();
  if (!prompt || state.loading) return;

  state.messages.push({
    role: "user",
    text: prompt,
    time: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date()),
  });
  input.value = "";
  state.loading = true;
  render();

  try {
    const reply = await generateReply(prompt);
    state.messages.push({
      role: "assistant",
      text: reply,
      time: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date()),
    });
  } catch (error) {
    console.error("Gemini request failed", error);
    state.messages.push({
      role: "assistant",
      text: "I couldn't complete that request. Check your API key and connection, then try again.",
      time: "Error",
    });
  } finally {
    state.loading = false;
    render();
    document.querySelector("#chat-input").focus();
  }
}

render();
