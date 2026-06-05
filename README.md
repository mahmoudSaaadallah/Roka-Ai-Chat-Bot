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

The renderer covers the formats listed above rather than the full CommonMark specification. For example, use triple backticks around a code sample and optionally add a language such as `js` on the opening fence to label the block.

## Run locally

Serve the project directory with any static server. For example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173` in a browser.

Keep the terminal running while using the app. Press `Ctrl + C` in that terminal when you want to stop the local server.

Run the Markdown renderer tests with:

```powershell
npm test
```

## Image studio

Choose Square, Portrait, or Wide, then select a visual style and describe the image. When generation finishes, use **Download** to save the result or **Regenerate** to request another variation. The preview is kept in the current page session, so download an image you want to keep.

If an image fails to load, check the browser's internet connection and try again. Image creation depends on the external image service being available.

## Connect Gemini

1. Open **Settings** in the sidebar.
2. Paste a Gemini API key.
3. Choose **Save connection**.

The key is stored in `sessionStorage`, so closing the browser tab clears it. Conversation history and theme preference use `localStorage`.

If Roka cannot complete a request, verify that the Gemini key is valid and that the browser can reach the Gemini API. The green status indicator means a key is present; it does not validate the key before the first request.

Conversation history is saved only in the current browser profile and is limited to the 12 most recent conversations. It does not sync between devices. Clearing this site's browser storage also removes the saved conversations and theme preference.

## Keyboard shortcuts

- `Enter` — send the current message
- `Shift + Enter` — insert a new line in the message
- `Ctrl/⌘ + N` — start a new conversation
- `Ctrl/⌘ + K` — jump to the message composer
- `Esc` — close settings or mobile navigation

## Project structure

- `index.html` — document metadata and app entry point
- `styles.css` — visual system, components, themes, and responsive styles
- `app.js` — application state, Gemini integration, image generation, and interactions
- `markdown.js` — dependency-free, safe Markdown renderer
- `markdown.test.mjs` — renderer behavior and security tests
