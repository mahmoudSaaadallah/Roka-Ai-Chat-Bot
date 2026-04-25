# Roka AI

Roka AI is a polished, responsive browser workspace for AI conversations and creative image generation. It runs as a lightweight static site with no build step.

## Highlights

- Focused chat experience powered by Gemini 2.5 Flash
- Image studio with aspect-ratio and visual-style controls
- Local conversation history and persistent theme preference
- Dark and light themes, responsive mobile navigation, and keyboard shortcuts
- Session-only API key storage—credentials are never committed to the repository
- Safe Markdown rendering for structured AI replies

## Privacy and external services

Chat prompts are sent to the Google Gemini API with the API key you provide. Image prompts are sent to the Pollinations image service. Conversation history and the selected theme stay in this browser's local storage; the Gemini key stays in the current tab session.

## Markdown responses

Assistant messages support the Markdown formats commonly used in technical answers:

- Headings, paragraphs, bold, italics, and strikethrough
- Inline code and fenced or indented code blocks
- Ordered lists, unordered lists, and task lists
- Safe external links, blockquotes, horizontal rules, and tables
- Automatic right-to-left layout for Arabic responses

Code blocks include their language and a copy button. Raw HTML is escaped, and links are limited to safe web, email, anchor, and relative URLs.

## Run locally

Serve the project directory with any static server. For example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173` in a browser.

Run the Markdown renderer tests with:

```powershell
npm test
```

## Connect Gemini

1. Open **Settings** in the sidebar.
2. Paste a Gemini API key.
3. Choose **Save connection**.

The key is stored in `sessionStorage`, so closing the browser tab clears it. Conversation history and theme preference use `localStorage`.

## Keyboard shortcuts

- `Ctrl/⌘ + N` — start a new conversation
- `Ctrl/⌘ + K` — jump to the message composer
- `Esc` — close settings or mobile navigation

## Project structure

- `index.html` — document metadata and app entry point
- `styles.css` — visual system, components, themes, and responsive styles
- `app.js` — application state, Gemini integration, image generation, and interactions
- `markdown.js` — dependency-free, safe Markdown renderer
- `markdown.test.mjs` — renderer behavior and security tests
