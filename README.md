# EDX AI Resume Analyzer

A full stack web app that analyses a PDF resume with its own built-in analysis engine (no external AI needed), gives an ATS score with the evidence behind it, and checks how well the resume fits a specific job description.

**Stack:** React 19 + Vite + Bootstrap · Node.js + Express 5 · MongoDB (Mongoose) · pdf.js · JWT auth  
**Optional:** Google Gemini for extra written advice (off by default)

## Features

- Register / login (JWT, bcrypt) with protected pages and real logout
- Upload a PDF resume (real PDF check, 5 MB limit) or test instantly with **1-click Sample Resumes (Strong, Average, Weak)**
- Get an ATS score with a 5-part score breakdown **with the evidence for each part**, skills, strengths, weaknesses, and suggestions
- **Re-analyze** any saved resume with the current engine, without uploading again
- **Job Match:** paste a job description and get a match score, keywords you have / are missing, and tailoring advice. The score blends keyword coverage, text similarity (cosine similarity) and job-title match
- Dashboard with real statistics and an ATS score progress chart
- Analysis history, delete, duplicate-resume detection
- **Export options:** "Download Report" (print to PDF) & "Export JSON" (full structured data export) & "Copy Suggestions"
- Security: helmet headers, rate limiting (login, and per-user on AI endpoints), upload cleanup, path-safe deletes, prompt-injection guard
- Automated tests for the backend (`npm test`), including real sample PDFs

## Run it locally

### Option 1: 1-Click Launch (Recommended)
- **Windows:** Double-click `start.bat` (automatically installs missing dependencies, starts backend & frontend, and opens http://localhost:5173).
- **macOS / Linux:** Run `chmod +x start.sh && ./start.sh`.

### Option 2: Using npm from root
```bash
npm run install:all
npm run dev
```

### Option 3: Manual Startup
1. Ensure Node 20+ and MongoDB are installed (or set a free MongoDB Atlas URL in `server/.env`).
2. Backend:
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. Frontend (in a new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. Open http://localhost:5173

## How the analysis engine works

The engine (`server/services/localAnalyzer.js`) reads the resume text and measures five things with explainable rules. Each one is a 0-100 score, combined with fixed weights:

| Check | Weight | What is measured |
|---|---|---|
| Keywords | 25% | How many skills a recruiter expects for the detected role (Full Stack, Frontend, Backend, Data/ML, DevOps) appear |
| Impact | 25% | Share of bullet points that contain numbers and start with an action verb, and use of weak phrases like "responsible for" |
| Skills | 20% | Number of recognised skills and how many technical areas they cover |
| Structure | 20% | Contact details and the key sections (Summary, Experience / Projects, Education, Skills) |
| Formatting | 10% | Length, bullet usage, unreadable symbols, very long (multi-column) lines |

Job Match (`server/services/jobMatchService.js`) compares a job description with the resume using keyword coverage (65%), cosine similarity of the words (25%) and job-title overlap (10%).
The result for a given resume is always the same, and the page shows the evidence behind each score.

## Tests

```bash
cd server
npm test
```

## API (new endpoints)

| Method | Route | What it does |
|---|---|---|
| POST | `/api/resume/:id/match` | Match a saved resume against `{ jobDescription, jobTitle?, company? }` |
| POST | `/api/resume/:id/reanalyze` | Analyse the saved resume text again with the current engine |
| GET | `/api/resume/stats` | Dashboard numbers and score trend |

## Project structure

```
server/  app.js (express app) · server.js (start) · controllers · services (ai, jobMatch, resume) · utils (keywordMatcher, promptBuilder) · models · middleware · tests
client/  src/pages · src/component · src/api · src/utils · src/routes (ProtectedRoute)
```
