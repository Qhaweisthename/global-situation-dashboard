# Global Situation Dashboard

A real-time open-source intelligence (OSINT), cyber threat monitoring, disaster awareness, network intelligence, space operations, aviation tracking, maritime awareness, and AI-assisted situational awareness platform built with React, Vite, Three.js, React Globe GL, Satellite.js, and Ollama.

The Global Situation Dashboard provides a centralized operational picture of events occurring across multiple intelligence domains. By combining live cyber threat feeds, disaster monitoring systems, space tracking, network intelligence, aviation monitoring, maritime awareness, and a local AI analyst assistant, the platform delivers a single pane of glass for understanding what is happening around the world.

---

# Why This Project Exists

Information is often fragmented across dozens of websites, dashboards, intelligence feeds, and monitoring platforms.

The goal of this project is to bring together multiple domains of intelligence into one interactive platform where users can quickly understand:

* What is happening right now
* Which threats are most important
* How different events may be related
* What the overall global risk level is
* Which intelligence feeds are healthy and operational
* What actions may require further investigation

The dashboard is designed for:

* Security Operations Centers (SOC)
* Open Source Intelligence (OSINT) enthusiasts
* Cybersecurity professionals
* Students and researchers
* Intelligence analysts
* Disaster monitoring teams
* Aviation and maritime enthusiasts
* Anyone interested in global situational awareness

---

# Key Features

## Interactive 3D Globe

The platform is built around a real-time 3D globe providing a visual representation of intelligence events occurring around the world.

Features include:

* Interactive 3D Earth visualization
* Automatic globe rotation
* Country border rendering
* Zoom controls
* Drag navigation
* Real-time event markers
* Event auto-focus
* Dynamic filtering system
* Threat heatmap visualization
* Multi-domain intelligence awareness

---

# Intelligence Domains

## Space Domain

### International Space Station (ISS)

Live ISS tracking powered by orbital calculations and TLE propagation.

Features:

* Live ISS position
* Orbital path visualization
* Ground track display
* Altitude monitoring
* Velocity monitoring
* Crew monitoring
* Crew manifest display
* Real-time updates

### Space Weather

Powered by NOAA Space Weather data.

Features:

* KP Index monitoring
* Geomagnetic storm awareness
* Solar activity awareness
* Space weather operational status

### Satellite Awareness

Features:

* Simulated Starlink constellation
* Orbital object visualization
* Space situational awareness

---

## Air Domain

### Aircraft Tracking

Powered by OpenSky Network.

Features:

* Live aircraft monitoring
* Aircraft position tracking
* Callsign information
* Origin country information
* Altitude monitoring
* Speed monitoring
* Aircraft statistics
* Air domain awareness

---

## Maritime Domain

### Vessel Tracking

Features:

* Maritime traffic visualization
* Cargo vessel monitoring
* Tanker monitoring
* Port activity awareness
* Vessel movement simulation
* Maritime statistics

---

## Earth Domain

### Earthquake Monitoring

Powered by the United States Geological Survey (USGS).

Features:

* Live earthquake feed
* Magnitude reporting
* Depth reporting
* Global earthquake tracking

### Volcano Monitoring

Powered by NASA EONET.

Features:

* Active volcano monitoring
* Eruption awareness
* Global volcanic activity tracking

### Weather Monitoring

Features:

* Severe weather alerts
* Active weather warnings
* Weather event visualization

### Disaster Intelligence

Powered by GDACS.

Features:

* Global disaster monitoring
* Emergency event tracking
* Disaster awareness visualization

---

## Cyber Threat Intelligence

### CVE Monitoring

Powered by the National Vulnerability Database (NVD).

Features:

* Live CVE monitoring
* CVSS scoring
* Critical vulnerability identification
* Severity prioritization

### Known Exploited Vulnerabilities (KEV)

Powered by CISA.

Features:

* Active exploitation monitoring
* Known exploited vulnerability tracking
* High-priority threat awareness

### Threat Intelligence

Features:

* Cybersecurity advisory monitoring
* Threat intelligence tracking
* Security event monitoring

### Ransomware Monitoring

Powered by Ransomware.live.

Features:

* Victim monitoring
* Campaign awareness
* Sector tracking
* Incident monitoring

### Data Breach Monitoring

Features:

* Public breach intelligence
* Records exposure awareness
* Breach event tracking
* Breach monitoring

---

## Network Intelligence

### Internet Outage Monitoring

Features:

* Regional outage awareness
* Connectivity disruption monitoring
* Network event tracking

### BGP Monitoring

Features:

* BGP anomaly monitoring
* Route hijack awareness
* Internet routing visibility

---

# Intelligence Operations

## Threat Timeline

The timeline provides a chronological view of intelligence events.

Supported views:

* Last Hour
* Last 24 Hours
* Last 7 Days
* Last 30 Days
* Last Year

Features:

* Historical event analysis
* Event filtering
* Timeline navigation
* Event prioritization

---

## Correlation Engine

The correlation engine attempts to identify relationships between intelligence events.

Features:

* Threat correlation
* CVE correlation
* KEV matching
* Threat intelligence matching
* Confidence scoring
* Severity scoring
* Correlation reasoning
* Threat prioritization

---

## Threat Heatmap

The heatmap layer visualizes concentrations of activity across the globe.

Threat levels are calculated using:

* CVEs
* KEVs
* Threat intelligence
* Data breaches
* Ransomware activity
* Internet outages
* BGP anomalies
* Natural disasters

---

## News Ticker

A live intelligence ticker provides continuously updated event information across the platform.

Includes:

* Earthquakes
* Cyber threats
* KEV additions
* Data breaches
* Threat intelligence updates
* Ransomware activity

---

## Global Risk Assessment

The platform calculates an overall global risk score.

Risk Levels:

* LOW
* ELEVATED
* HIGH
* CRITICAL

Factors include:

* Critical vulnerabilities
* Active KEVs
* Ransomware incidents
* Threat intelligence alerts
* Data breaches
* Network events

---

## Feed Health Monitoring

Feed health monitoring provides operational awareness of platform data sources.

Monitored Feeds:

* ISS Tracking
* Space Weather
* Earthquakes
* Volcanoes
* Aircraft Tracking
* Maritime Tracking
* CVE Feed
* KEV Feed
* Threat Intelligence Feed
* Ransomware Feed
* Data Breach Feed
* Internet Outage Feed
* BGP Monitoring Feed

---

# AI Intelligence Assistant

One of the core features of the platform is the built-in AI Intelligence Assistant.

The assistant is powered locally using Ollama and can answer questions using live dashboard data.

Unlike traditional AI chatbots, the assistant receives structured intelligence data directly from the dashboard.

Example Questions:

* What is the current global risk level?
* What is the top threat right now?
* Summarize the last 24 hours.
* Are there any correlated threats?
* How many aircraft are currently being tracked?
* What are the most significant cyber events?
* Explain why the risk level is elevated.

Features:

* Local AI processing
* No cloud dependency
* No API costs
* Dashboard-aware responses
* Analyst-style summaries
* Natural language interaction

---

# Technology Stack

## Frontend

* React
* Vite
* React Globe GL
* Three.js

## Geospatial Processing

* GeoJSON
* TopoJSON

## Orbital Processing

* Satellite.js
* TLE Propagation

## Backend

* Node.js
* Express
* CORS

## Artificial Intelligence

* Ollama
* Llama 3.1

---

# Data Sources

## Space

* Open Notify
* WhereTheISS.at
* NOAA Space Weather Prediction Center

## Aviation

* OpenSky Network

## Earth & Disaster

* USGS Earthquake Feed
* NASA EONET
* GDACS
* Weather.gov

## Cyber Intelligence

* National Vulnerability Database (NVD)
* CISA KEV Catalog
* Ransomware.live
* Public Threat Intelligence Sources

## Network Intelligence

* Internet Outage Monitoring Sources
* BGP Monitoring Sources

---

# Edge AI Models (Task 1): Deterministic vs Probabilistic vs Tencent R3-Skill

All three models run **entirely on this machine**. Model weights are downloaded once; after that no request ever leaves `localhost`, and no cloud AI API is called.

## Model note

**Model A (Deterministic)** is Llama 3.1 running locally in Ollama with greedy decoding (`temperature: 0`, `top_k: 1`, fixed `seed: 42`), so the same question on the same dashboard data always returns the same answer. **Model B (Probabilistic)** is the same local Llama 3.1 with sampling enabled (`temperature: 0.9`, `top_p: 0.95`, `top_k: 40`) and a fresh random seed on every call, so repeated runs on identical input produce different answers. **Model C (Tencent R3-Skill)** runs Tencent's R3-Embedding-0.6B and R3-Rerank-0.6B locally to route each question to the most relevant dashboard "skill" (e.g. earthquake-analyst, cve-kev-analyst), then sends only that skill's slice of dashboard data to Llama 3.1 with Model A's deterministic settings; R3 itself is a retrieval model, not a text generator, and involves no sampling.

## How it fits together

```
Browser (React, :5173)
   │  question + live dashboard data + selected mode
   ▼
AI server (Node/Express, :5050)  server/index.js
   ├── mode=deterministic ──► Ollama llama3.1 (temp 0, top_k 1, seed 42)
   ├── mode=probabilistic ──► Ollama llama3.1 (temp 0.9, top_p 0.95, random seed)
   └── mode=r3 ──► R3-Skill service (Python/Flask, :5055)  r3_service/app.py
                     R3-Embedding recall ──► R3-Rerank ──► best skill
                   ──► Ollama llama3.1 (deterministic) with that skill's data only
```

The skill library R3 routes over is in `server/skills/dashboard_skills.json` (10 skills, in Tencent's `name | description | body` format).

## Extra requirements

- Python 3.10+ (for Model C)
- ~5 GB free disk for Llama 3.1 8B, plus ~2.5 GB for the two R3 models
- 8 GB+ RAM recommended. If your machine is slow, set `OLLAMA_MODEL=llama3.2:3b` (see below)

## Setup and run (four terminals)

**Terminal 1: Ollama (Models A and B)**
```
ollama pull llama3.1
ollama serve
```
(On Windows/macOS the Ollama app usually runs the server already; `ollama serve` will then say the port is in use, which is fine.)

**Terminal 2: Tencent R3-Skill service (Model C)**
```
cd r3_service
python -m venv .venv
# Windows:  .venv\Scripts\activate
# mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
hf download tencent/R3-embedding-0.6b --local-dir models/r3-embedding
hf download tencent/R3-rerank-0.6b --local-dir models/r3-reranker
python app.py
```
Expected: `Tencent R3-Skill router running on http://localhost:5055`

**Terminal 3: AI backend**
```
node server/index.js
```
Check all three models: open http://localhost:5050/api/health and confirm `"ollama":"OK"` and `"r3":"OK"`.

**Terminal 4: Dashboard**
```
npm install
npm run dev
```
Open http://localhost:5173, choose a model in the **AI DASHBOARD ASSISTANT** panel, and ask a question.

## Proving deterministic vs probabilistic

- In the dashboard, click **Run 3× consistency test**. It freezes one snapshot of the dashboard data and sends the same question three times. Model A and Model C show "All 3 answers identical"; Model B shows "Answers differ between runs", with a different seed per run.
- From the command line (uses a fixed data fixture): `npm run test:models`. Full answers are saved to `consistency_results.json`.

Note: temperature 0 with a fixed seed is deterministic on a given machine and Ollama version. Tiny differences across different hardware (e.g. CPU vs GPU) are possible because of floating-point arithmetic; this is a known property of local LLM inference.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `OLLAMA_MODEL` | `llama3.1` | Local LLM used by Models A, B and C |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama server |
| `R3_URL` | `http://127.0.0.1:5055` | R3-Skill service |
| `R3_PORT` | `5055` | Port the R3 service listens on |

(Port 5055 is used rather than 5060 because the fetch standard blocks 5060 as the SIP port.)

---

## Task 2: Standard question set

In the dashboard, click **Run all 6 questions × 3 models × 2 runs** (under STANDARD QUESTION SET). It freezes one snapshot of the live data, asks every model each question twice, and shows a same/different table. Then use **Download results (Markdown)** and **Download data snapshot (JSON)** to keep the evidence.

To replay the exact same snapshot later from the command line:
```
npm run task2 -- task2-snapshot-XXXX.json
```
This writes `task2-results.md` and `task2-results.json`.

Note: the dashboard data has no per-region risk score and no weekly volcano history, so Q2 and Q4 test whether each model admits the data is missing or invents an answer.

---

# Installation

## Requirements

Install:

* Node.js 20+
* npm
* Ollama

---

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/global-situation-dashboard.git
cd global-situation-dashboard
```

---

## Install Frontend Dependencies

```bash
npm install
```

---

## Install Ollama

Download and install Ollama.

Pull the required model:

```bash
ollama pull llama3.1
```

---

## Start Ollama

```bash
ollama run llama3.1
```

---

## Start AI Backend

```bash
node server/index.js
```

Expected output:

```text
Local AI assistant running on http://localhost:5050
```

---

## Start Dashboard

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Current Development Status (Completed)

## Phase 1 Complete

* Interactive Globe
* Country Borders
* Event Markers
* Earthquake Monitoring
* ISS Tracking

## Phase 2 Complete

* Space Weather
* Volcano Monitoring
* Weather Alerts
* Event Filtering
* ISS Crew Tracking

## Phase 3 Complete

* CVE Monitoring
* KEV Monitoring
* Threat Intelligence
* Ransomware Monitoring
* Data Breach Monitoring
* Global Risk Assessment
* Feed Health Monitoring

## Phase 4 Complete

* Threat Timeline
* Correlation Engine
* News Ticker
* Aircraft Tracking
* Maritime Tracking
* Threat Heatmap
* Local AI Intelligence Assistant

---

# Future Enhancements & Ideas

## Intelligence & Analytics

* Historical Event Playback
* Alert Subscriptions
* Export Intelligence Reports
* Automated Threat Assessment
* Predictive Intelligence Models
* AI-Assisted Event Classification
* Geopolitical Intelligence Monitoring
* Conflict Monitoring
* Threat Actor Tracking
* Country Risk Scoring

## Disaster Monitoring

* Wildfire Monitoring
* Hurricane Tracking
* Flood Monitoring
* Tsunami Monitoring

## Air & Maritime

* Real-Time AIS Integration
* Expanded Aircraft Tracking
* Military Aircraft Monitoring
* Port Activity Monitoring
* Shipping Route Analysis

## User Experience

* User Configurable Dashboards
* Multi-User Support
* Saved Dashboard Layouts
* Custom Alert Rules
* Mobile Dashboard Support

## Infrastructure

* Docker Deployment
* Kubernetes Deployment
* Authentication & User Management
* External API Access

---

# Contributing

Contributions, feature requests, bug reports, and suggestions are welcome.

---

# License

MIT License
