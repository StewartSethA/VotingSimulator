# Voting Simulator

Interactive, browser-based comparison of three convention voting procedures:

- Existing UCRP convention balloting (one modeled interpretation)
- Proposed B2026-10 candidate elimination
- Hypothetical approval-voting alternative

The simulator includes animated delegate voting and counting, editable election algorithms, candidate and voter counts, named edge-case scenarios, and randomized stress tests.

## Open the simulator

After GitHub Pages is enabled for this repository:

**https://StewartSethA.github.io/VotingSimulator/**

The web application uses plain HTML, JavaScript and CSS. No server, build tools, third-party libraries, or external requests are required.

## Run locally

Open `index.html` in a browser. Keep `voting-app.js` and `voting-app.css` beside it.

## Publish

Visit **Settings → Pages → Build and deployment → Source → GitHub Actions**. The included deployment workflow publishes the main branch. The published URL will be `https://StewartSethA.github.io/VotingSimulator/`.

## Interpretation notes

This is an educational model and is **not** official party election software. Existing and proposed UCRP rules have points requiring procedural interpretation. The approval-voting nomination adapter is hypothetical. The stress-test outcomes depend on synthetic voter behavior and do not predict real convention outcomes.

Sources: [B2026-10 proposal](https://ucrp.org/wp-content/uploads/2026/09/B2026-10-Bylaw-6.D.2.f.ii-Convention-Balloting-Multi-Candidate-Elimination.pdf) and [UCRP governing documents](https://ucrp.org/wp-content/uploads/2026/03/UCRP-Governing-Documents-2026-01-17.pdf).
