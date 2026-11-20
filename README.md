# AuraGen — Week 1 Starter Project

A working Week 1 foundation for **AuraGen: Self-Healing Generative UI via Cognitive Load**.

## What is included

### Frontend (`client/`)
- React + Vite
- Telemetry hook for pointer movement, field hesitation, repeated clicks, and invalid form submissions
- Browser-side cognitive-friction score (0–100)
- Socket.IO client that streams telemetry to the backend
- A demo financial form and a live monitoring panel

### Backend (`server/`)
- Node.js + Express
- Socket.IO server receiving telemetry
- Server-side score calculation and broadcast to connected clients
- LangChain + OpenAI ChatGPT model integration to generate a React component as **code text**
- Prompt includes a small AuraGen design-system contract

> The AI endpoint generates code text only. It does not execute or render generated code. AST validation, sandboxing, compilation, and dynamic injection belong to Week 2 and later. Do not execute generated code from an untrusted model response.

## Prerequisites
- Node.js 20 or later (LTS recommended)
- npm
- Git
- An OpenAI API key to test AI generation (telemetry works without it)

## 1. Run the backend

Open a terminal:

```bash
cd AuraGen_Week1/server
npm install
cp .env.example .env
```

Edit `server/.env` and add your API key:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Backend health check: http://localhost:4000/api/health

## 2. Run the frontend

Open a **second** terminal:

```bash
cd AuraGen_Week1/client
npm install
cp .env.example .env
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173.

## 3. Try the Week 1 demo

1. Open the demo financial form.
2. Move the pointer around, pause on a field, click Next repeatedly, or submit invalid data.
3. Watch the live telemetry panel and Cognitive Friction Score.
4. Click **Generate simplified wizard code** to call the backend AI endpoint.
5. The generated React code is displayed as text for inspection. It is not executed.

If the API key is missing, telemetry still works; the AI endpoint will return a clear configuration error.

## API endpoints

- `GET /api/health` — backend health
- `POST /api/generate-ui` — accepts `{ "task": "...", "formContext": {...} }` and returns `{ "code": "...", "model": "..." }`
- Socket.IO event `telemetry` — client sends interaction telemetry
- Socket.IO event `telemetry:update` — server broadcasts latest score and signals

## Project structure

```text
AuraGen_Week1/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── ai/
│   │   ├── telemetry/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Notes about the cognitive-friction score

This is an engineering heuristic for a prototype, not a validated psychological or medical measurement. A high score means the observed interaction pattern may indicate friction; it does not prove a user is frustrated. The demo uses:
- repeated clicks
- field hesitation
- unusual pointer movement
- invalid form attempts

The score is clamped to 0–100 and calculated on both client and server for Week 1 demonstration.

## Troubleshooting

- **`npm` is not recognized:** install Node.js LTS, then restart the terminal.
- **Port 4000 already in use:** change `PORT` in `server/.env`.
- **Frontend cannot connect:** make sure the backend is running and `VITE_SOCKET_URL` is `http://localhost:4000`.
- **AI generation fails:** check `OPENAI_API_KEY`, API billing/access, and the server terminal. Never commit `.env`.
- **Friend cannot run the project:** both collaborators should use the same Node.js major version and run `npm install` in both folders.

## GitHub collaboration workflow

Recommended: one shared GitHub repository, with each person working on a separate branch.

1. One person creates a GitHub repository (for example `AuraGen-Week1`).
2. Extract this ZIP. In the extracted folder, open a terminal and run:

```bash
git init
git add .
git commit -m "Initial AuraGen Week 1 implementation"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/AuraGen-Week1.git
git push -u origin main
```

3. Invite your friend:
   - GitHub repository → **Settings** → **Collaborators** (or **Collaborators and teams**) → **Add people**
   - Enter your friend's GitHub username and send the invitation.
   - Your friend must accept it.

4. Your friend clones the repo:

```bash
git clone https://github.com/YOUR-USERNAME/AuraGen-Week1.git
cd AuraGen-Week1
```

5. Before working, each person creates their own branch:

```bash
git checkout -b feature/telemetry
```

Use a different branch name for your friend's task, e.g. `feature/ai-codegen`.

6. After making changes:

```bash
git add .
git commit -m "Add telemetry tracking"
git push -u origin feature/telemetry
```

7. On GitHub, open a **Pull Request** from your branch into `main`. Review and merge it after checking the changes.

8. Before starting new work, sync with `main`:

```bash
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
```

### Suggested division of work
- **You:** React telemetry hook, demo form, score display, frontend integration.
- **Friend:** Express + Socket.IO backend, LangChain prompt and UI code-generation endpoint.

Agree on the Socket.IO event shape and API contract before changing them. Avoid both people editing the same files at the same time.

### Git safety
- Never commit `.env` files or API keys.
- `.gitignore` is included.
- Do not share your OpenAI API key in WhatsApp, GitHub issues, or source code. Each collaborator should use their own local `.env`.
