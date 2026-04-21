# Spanish Learning Tool

A lightweight browser-based Spanish practice app focused on vocabulary training, grammar topic breakdowns, and competitive learning modes.

## Features

### Vocabulary
- 5 word bundles: Body Parts, Animals, Emotions, Filler Words, Panamanian-Specific Terms
- Custom multi-bundle mode — combine any bundles into one practice set
- Wordlist view with search and sort (by English, Spanish, wrong count, skip count)
- Bundle filter for multi-bundle stats views

### Competitive Mode
- Weighted word selection based on user performance — words answered incorrectly or skipped appear more often
- Direction randomised per question (English → Spanish or Spanish → English)
- Strict or loose accent matching (configurable in settings)
- Streak tracking with confetti milestones at 5, 10, and 15
- Undo support for wrong and skipped answers
- Weight formula:
$$w = \text{clamp}\Big(100 + 15w_{\text{wrong}} + 10s_{\text{skip}} - 10s_{\text{streak}} - a_{\text{attempts}},\; 1,\; 1000\Big)$$

### Practice Mode
- Match-the-word grid game with Spanish Target or English Target direction
- Shuffle grid animation, skip/don't-know support, and progress bar
- Session progress saved to localStorage and resumed on re-entry

### Grammar Topics
- **SER or ESTAR** — acronym reference cards (DOCTOR / PLACE) with clickable word titles for pronunciation
- **PARA or POR** — acronym reference cards (PERFECT / DREAM) with clickable word titles for pronunciation
- **Locational Phrasing** — 3 color-coded horizontal zones covering all 5 Spanish distance adverbs:
  - Near the Speaker (aquí, acá)
  - Near the Listener (ahí)
  - Far from Both (allí, allá)
  - Each word has a usage explanation and example sentence; word titles are clickable for pronunciation
- Competitive tab on all grammar topics is a work-in-progress stub

### Text-to-Speech
- Male voice via Google Translate TTS (es-MX, informal endpoint)
- Female voice via native Web Speech API with Spanish voice filtering
- Randomise voice gender per utterance (configurable in settings)
- Grammar topic word titles (SER, ESTAR, PARA, POR, aquí, acá, ahí, allí, allá) are clickable to hear pronunciation

### Settings & Debug
- Voice gender toggle and volume control
- Animation speed and background theme selector
- Wordlist column count control
- Current Location tracker in the settings panel
- Debug / Active Stats panel (only active inside Vocabulary Competitive mode)
- Progress data can be randomised via the Debug menu for testing

### Persistence
- All progress, stats, and settings stored in browser localStorage
- Save frequency adjustable; unsaved-progress indicator shown in the UI

## Tech Stack
- Vanilla JavaScript (no frameworks)
- HTML / CSS
- Web Speech API + Google Translate TTS (unofficial endpoint)
- localStorage for persistence

## Project Status
Active development. Core learning flow is in place. Grammar topics are reference/breakdown only — competitive quiz modes for grammar are not yet implemented.

## Run Locally
1. Clone the repo
2. Open `index.html` in any modern browser — no build step required

## Roadmap
- Competitive quiz modes for grammar topics (SER/ESTAR, PARA/POR, Locational Phrasing)
- Expand grammar topic library
- Improve stats and progress UX
- Account management (delayed indefinitely)
