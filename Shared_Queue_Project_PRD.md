
# Product Requirements Document (PRD) for Shared Queue Project

## Project Title:  
**Shared Queue with AI-Driven Song Recommendations & Crowd Energy Feedback**

## Project Overview:  
The Shared Queue project is a web application that enables users to join a shared music queue through a **QR code**, request songs, and vote on whether to add those songs to the queue. The system will generate **dynamic song recommendations** based on the current queue, user preferences, and **crowd energy levels**. The crowd’s enthusiasm is measured through **volume input** (cheering, screaming) captured via **microphone input**, which directly influences song suggestions via **AI models**. This system will be used in environments like clubs, parties, or events where music is shared democratically among participants.

## Features:

### 1. User Authentication & Session Management
- **Authentication**: Users authenticate via Spotify using **OAuth 2.0** and the **PKCE flow** for secure login.
- **Session Management**: Unique session IDs are generated via QR codes to enable users to join a specific shared queue.  
  - QR Code generation for each session.
  - Track user activity, preferences, and votes for each session.

### 2. Queue System
- **Initial Queue Generation**: At the start of a session, a **quick poll** is conducted among participants to suggest the initial set of songs.
- **Song Request & Voting**: Users can:
  - Request a song to be added to the queue.
  - **Vote** on whether the requested song should be added.
  - **Democratic Voting**: A song is added only if it gets a majority vote.

### 3. Crowd Energy-Based Feedback
- **Volume Input**: The system captures **real-time volume data** using the **Web Audio API**.
  - Measures **ambient noise** (cheering/screaming).
  - **Crowd Energy Score** is derived from the intensity and duration of the sound.
- **Dynamic Recommendations**:
  - High energy (e.g., loud cheering): AI suggests more **high-energy songs**.
  - Medium energy: AI suggests songs with a **gradual mood transition**.
  - Low energy: AI suggests **engaging or more upbeat** tracks.
  
### 4. AI-Driven Song Recommendations
- **Generative AI**: Uses **GPT-4** or a similar AI to suggest songs based on:
  - The current queue.
  - Real-time crowd feedback.
  - **Spotify recommendations API** to match genres, tempo, and user preferences.
- **Learning from Feedback**: AI models learn and improve over time based on the success of previous song recommendations and crowd reactions.

### 5. Real-Time Updates
- **WebSockets**: Real-time updates for:
  - **Crowd energy**: Display an **energy meter** that updates live.
  - **Queue management**: Show the status of the queue and votes as they happen.
- **Live UI**: Show live **playlist changes**, **song voting results**, and **crowd energy** on the UI.

### 6. Frontend (UI/UX)
- **Streamlit** for quick prototyping and an interactive user interface.
- **UI Elements**:
  - **Song Queue**: List of songs currently in the queue.
  - **Voting Buttons**: Options to request a song and vote for it.
  - **Energy Meter**: A dynamic bar showing the real-time crowd energy level.
  - **Crowd Interaction**: Display reactions from participants (e.g., cheers, booing).
  
### 7. Database & Backend
- **MongoDB Atlas**: Store session data, user preferences, votes, crowd energy scores, and song recommendations.
- **Backend**: Built using **FastAPI** or **Express.js** to:
  - Manage **authentication** and **session handling**.
  - Handle the **queueing system**, song voting, and API integration with Spotify.

### 8. Spotify Integration
- **Spotify Web API**:
  - Fetch **song metadata**, playlists, and track recommendations.
  - Control **music playback** on participants’ devices.
  - Integrate **Spotify playlists** into the queue and enable dynamic song additions based on AI suggestions.

## Tech Stack:

### Frontend  
- **Streamlit** for UI.  
- **JavaScript** (Web Audio API) for real-time volume tracking and dynamic updates.  
- **Tailwind CSS** for styling.  
- **QR Code Generator** for session joining.

### Backend  
- **FastAPI** or **Express.js** for API management.  
- **WebSockets (Socket.io or FastAPI WebSockets)** for real-time updates.  
- **Spotify Web API** for music data and playback control.  
- **MongoDB Atlas** for session and vote management.

### AI  
- **GPT-4 (OpenAI API)** or **Hugging Face** models for song recommendations based on crowd energy.  
- **Collaborative Filtering** for personalized suggestions over time.

