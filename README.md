# Agent Frontend

Frontend application for the **Career Agent Service**, built with Next.js 15+ and TypeScript.

This application provides a chat interface for users to interact with the AI Career Agent, manage their authentication, and view real-time vacancy updates found by the agent.

## 🏗 Architecture Overview

This frontend acts as the user interface for the microservices-based system:

*   **Frontend (This Repo):** Next.js application handling UI/UX, communicating via REST and WebSocket.
*   **Backend:** Spring Boot service acting as the API Gateway, WebSocket handler, and orchestrator.
*   **Agent Service:** Python-based AI agent that processes natural language requests and performs job scraping (communicates asynchronously via RabbitMQ).

The frontend establishes two main types of connections with the Backend:
1.  **REST API:** For authentication (`/auth`), retrieving chat history (`/chats`), and messages.
2.  **WebSocket (Stomp/SockJS):** For real-time chat streaming and vacancy notifications.

## 🛠 Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **State/Data:** React Hooks (Context API for global state like ChatProvider)
*   **HTTP Client:** Axios (with interceptors for JWT token management)
*   **Real-time:** `@stomp/stompjs` & `sockjs-client` (WebSocket over STOMP)
*   **Markdown Rendering:** `react-markdown` & `remark-gfm`

## ✨ Features

*   **Authentication:** Sign In / Sign Up flows using JWT (Access/Refresh tokens).
*   **Chat Interface:**
    *   Real-time streaming of AI responses.
    *   Markdown support for rich text rendering.
    *   Chat history management.
*   **Vacancies Dashboard:**
    *   Side panel displaying scraped job listings.
    *   Real-time notifications when new vacancies are found.
*   **Responsive Design:** Mobile-friendly sidebar and layout.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v20 or higher recommended)
*   npm or yarn

### Installation

1.  Navigate to the directory:
    ```bash
    cd agent_frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the root of `agent_frontend` (if it doesn't exist) or ensure your environment provides:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080
    ```
    *(Replace `http://localhost:8080` with your actual Backend API URL)*

### Running the Application

Run the development server:

```bash
npm run dev
```

The application will start on port **4000** (configured in `package.json`): [http://localhost:4000](http://localhost:4000)

## 📂 Project Structure

```
agent_frontend/
├── src/
│   ├── app/                # Next.js App Router pages & layouts
│   │   ├── auth/           # Login/Register pages
│   │   ├── chat/           # Main chat interface
│   │   └── globals.css     # Global styles (Tailwind)
│   ├── components/         # Reusable React components
│   │   ├── Chat*.tsx       # Chat-specific components
│   │   └── Sidebar.tsx     # Navigation sidebar
│   ├── lib/
│   │   └── socket.ts       # WebSocket connection logic (Stomp/SockJS)
│   ├── services/           # API service modules (Axios calls)
│   │   ├── api.ts          # Axios instance & interceptors
│   │   ├── authService.ts
│   │   └── ...
│   └── types/              # TypeScript interfaces/DTOs
├── public/                 # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── package.json
```

## 🐋 Docker

A `Dockerfile` is included for containerization.

```bash
# Build
docker build -t agent-frontend .

# Run
docker run -p 4000:4000 agent-frontend
```

*Note: In the full `docker-compose` setup, this service usually interacts with `backend` on the internal network.*
