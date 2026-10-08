# LAPEE AM

![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?logo=javascript&logoColor=111111)
![Activities](https://img.shields.io/badge/Activities-180-7C3AED)
![Curriculum](https://img.shields.io/badge/Curriculum-BNCC_and_CBTC--SC-2563EB)
![License](https://img.shields.io/badge/License-MIT-0F766E)

Static educational activity platform created for the Amos Comenius Laboratory of Educational Practices and Extension.

## Scope

LAPEE AM provides 180 activities for Brazilian elementary-school years 1 through 5 across Portuguese, Mathematics, Science, History, Geography, and Art. Activities are organized by school year, subject, thematic unit, and three depth levels.

The pedagogical content is written in Portuguese and references BNCC and CBTC-SC curriculum identifiers. This README is in English to keep the public repository consistent with the rest of the portfolio.

## Features

- Seven interactive activity engines: selection, ordering, dragging, writing, drawing, word search, and crosswords.
- Text-to-speech through the Web Speech API.
- Local oral-response recording through MediaRecorder, with no upload.
- Teacher answers, objectives, mediation questions, and timing.
- Student progress and accessibility preferences stored in `localStorage`.
- Animated mascot and subject-based achievement badges.
- Worksheet and lesson-plan generation, including 445 embedded BNCC skills.
- Static deployment and offline-compatible assets.

## Run locally

Native ES modules require HTTP:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Content model

Thirty JSON files under `data/` separate activities by subject and school year:

```text
data/atividades-{subject}-{year}.json
```

Each activity declares its curriculum identifiers, learning objective, depth level, evidence type, estimated time, content payload, success criteria, Universal Design for Learning adaptations, and teacher guidance.

## Structure

```text
css/main.css       Design system, activity engines, themes, and print rules
js/                Router, store, accessibility, audio, exports, and UI
js/activities/     Seven interactive activity engines
js/dataLoader/     JSON resolution, cache, and queries
data/              Curriculum activity files
assets/            Local document, puzzle, icon, and font assets
docs/              Detailed architecture and content documentation
```

## Design decisions

- No framework, bundler, or application server.
- Hash routing works on GitHub Pages without rewrite rules.
- Curriculum data remains separate from rendering logic.
- Audio, microphone, and animation resources are released during navigation.
- Progress is device-local and does not synchronize automatically.

## License

MIT License. Pedagogical content may be adapted and redistributed with attribution to LAPEE AM.
