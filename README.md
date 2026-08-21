# 🌱 EcoVoice AI

**EcoVoice AI** is a multilingual, voice-first environmental intelligence web application that helps users make smarter decisions about **waste management, recycling, water conservation, and sustainable living**.

🔗 **Live Demo:** https://ecovoice-one.vercel.app

## ✨ Features

- ♻️ **AI Waste Scanner** – Analyze a waste image and get its category, material, contamination level, confidence score, disposal instructions, and explanation.
- 🎙️ **AI Assistant** – Ask sustainability questions conversationally and use voice-oriented navigation.
- 🌍 **Multilingual Support** – English, Hindi, Telugu, Tamil, and Kannada.
- 💧 **Water Conservation** – Guidance for leaks, grey-water reuse, water wastage estimation, and conservation.
- 📍 **Location-Aware Guidance** – Uses location context for more relevant Indian recycling and sustainability recommendations.
- 📊 **Dashboard & History** – View sustainability activity and previous analyses.
- 👥 **Community** – Sustainability-focused community experience.
- 📱 **Responsive UI** – Modern interface for web and mobile-sized screens.

## 🧠 AI Capabilities

### Waste Image Analysis

The waste scanner sends an image to an AI gateway powered by **Google Gemini 2.5 Flash** and returns structured information:

- Category: Recycle / Compost / Landfill / Hazardous / E-waste
- Material
- Contamination level
- Confidence score
- Disposal instructions
- Explanation

### Conversational Sustainability Assistant

The assistant uses **Google Gemini 3 Flash Preview** through an AI gateway to provide actionable waste, water, and sustainability advice. The backend supports language selection, location context, tone, streaming responses, and India-specific municipal guidance.

## 🛠️ Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack React Query
- Lucide React
- Recharts

### Backend & AI

- Supabase
- Supabase Edge Functions
- Deno / TypeScript
- Supabase JavaScript Client
- Lovable AI Gateway
- Google Gemini 2.5 Flash – waste image analysis
- Google Gemini 3 Flash Preview – conversational assistant

### Development & Testing

- ESLint
- Vitest
- Testing Library
- PostCSS / Autoprefixer
- npm / Bun

The repository is a Vite + React + TypeScript application with Supabase Edge Functions for AI workflows. fileciteturn3file0L2-L2

## 🏗️ Project Structure

```text
ECOVOICE_AI/
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── integrations/
│   ├── lib/
│   ├── pages/
│   ├── test/
│   ├── types/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── supabase/
│   └── functions/
│       ├── analyze-waste/
│       └── chat-waste/
├── package.json
└── README.md
```

The app includes dedicated pages for the landing experience, scanner, assistant, dashboard, history, water, about, and community sections. fileciteturn6file0L2-L2

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm or Bun
- A configured Supabase project
- Required AI gateway environment variables

### Installation

```bash
git clone https://github.com/REDDIPALLIPHANIKOUSHIK/ECOVOICE_AI.git
cd ECOVOICE_AI
npm install
```

### Environment Variables

Configure the required environment variables for your frontend and Supabase Edge Functions.

For the AI Edge Functions, the backend expects an AI gateway secret such as:

```env
LOVABLE_API_KEY=your_api_key_here
```

> Never commit real API keys or secrets to GitHub.

### Run Locally

```bash
npm run dev
```

Available scripts include development, production build, preview, linting, and testing. fileciteturn3file0L2-L2

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

### Tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

## 🔄 How It Works

```text
                     ┌──────────────────┐
                     │      User        │
                     └────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
       Upload waste image              Ask AI / voice query
              │                               │
              ▼                               ▼
     Supabase Edge Function          Supabase Edge Function
      analyze-waste                    chat-waste
              │                               │
              ▼                               ▼
      Gemini 2.5 Flash                Gemini 3 Flash Preview
              │                               │
              ▼                               ▼
      Waste classification      Multilingual sustainability guidance
```

The `analyze-waste` function validates the uploaded image, calls the AI gateway, parses the structured JSON response, and returns the classification. fileciteturn8file0L2-L2

The `chat-waste` function sends conversation history together with language, location, and tone context and streams the AI response back to the client. fileciteturn9file0L2-L2

## 🌟 Why EcoVoice?

EcoVoice makes environmental guidance **simple, accessible, and actionable**. Users can identify waste, understand how to dispose of it, conserve water, and receive personalized sustainability advice through one AI-powered experience.

## 🔮 Future Improvements

- Expand regional-language support
- Improve city-level recycling recommendations
- Add personalized sustainability goals and achievements
- Add richer waste and water analytics
- Introduce reminders and habit tracking
- Improve offline and low-connectivity support

## 👨‍💻 Author

**Reddipalli Phani Koushik**

GitHub: https://github.com/REDDIPALLIPHANIKOUSHIK

## 📄 License

This repository currently does not specify an open-source license.
