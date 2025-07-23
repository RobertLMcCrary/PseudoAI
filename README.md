# PseudoAI - AI-Powered Technical Interview Platform

## Project Overview
PseudoAI is a modern technical interview preparation platform that combines AI assistance with interactive coding challenges and community features.

## Core Features
### AI Assistant
- Location: `src/app/api/chat/route.js`
- Uses Hugging Face's Qwen model for intelligent guidance
- Provides hints and explanations without direct solutions
- Supports markdown formatting for code examples

### Code Execution
- Location: `src/app/api/code/route.js`
- Supports JavaScript and Python execution
- Real-time test case validation
- Progress tracking integration

### Progress Tracking
- Location: `src/app/stats/page.js`
- Tracks solved problems by difficulty
- Maintains user statistics
- Features competitive leaderboard
- MongoDB integration for data persistence

### User Authentication
- Uses Clerk for authentication
- Webhook integration: `src/app/api/webhooks/clerk/route.js`
- User model: `lib/models/User.js`

## Project Structure


### Frontend Pages
- `/` - Dashboard with progress overview
- `/problems` - Problem listing
- `/problems/[id]` - Interactive coding environment
- `/stats` - Progress tracking and leaderboard
- `/community` - Blog and community updates

### API Routes
- `/api/chat` - AI assistant endpoint
- `/api/code` - Code execution endpoint
- `/api/problems` - Problem management
- `/api/users` - User statistics

### Key Components
- `CodeMirror` integration for code editing
- `PanelGroup` for resizable layouts
- Markdown support for problem descriptions
- Pyodide for Python execution

# Getting Started
### Environment Setup
- install dependencies
```bash
npm install
```
### Running the localhost
- make sure you sign up on the website before running the localhost
- [PseudoAI](https://pseudoai.dev)
```bash
npm run dev
```
