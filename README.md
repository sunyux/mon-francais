# Mon Français

A French-learning site organised by topic. No build step: open `index.html` in a browser,
or run a local server:

    python3 -m http.server 8765    # then open http://localhost:8765

## What's shared across the whole site

| Feature | File |
|---|---|
| Language modes 中·EN·FR / 中·FR / EN·FR (top-right switch) | `assets/js/core.js` + CSS |
| Pronunciation: click any French text or 🔊 (browser speech, fr-FR voice) | `assets/js/core.js` |
| Verb hover → conjugation popup (auto-detected in all French text) | `assets/js/verbs.js` |
| Practice: flashcards, quiz, type-with-me (copy / recall / dictation) | `assets/js/practice.js` |
| Story "video" player: narrated scenes with word highlighting | `assets/js/story.js` |
| Book: cover, page turning, drag corners, chapter tabs, room background | `assets/js/book.js` + `assets/css/book.css` |
| Topic page → book pages | `assets/js/topic-page.js` |

## Adding a topic

1. Copy `topics/_template.js` → `topics/<id>.js` and fill in the content.
2. In `topics/index.js`, add `ready: true` and `scripts: ['topics/<id>.js']` to its entry.
3. Open `topic.html?t=<id>`.

New verbs go in `VERBS` at the top of `assets/js/verbs.js`. They then work on every page.
Regular verbs only need a meaning. Irregular verbs also need their present tense, past participle and future stem.

## Publishing

The site is static, so GitHub Pages, Netlify or Cloudflare Pages can host the folder as-is.
