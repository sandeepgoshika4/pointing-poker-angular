# Point Poker - Real-time Planning Poker Application

## Overview

Point Poker is a real-time collaborative estimation tool built with Angular and WebSocket technology. It allows teams to conduct planning poker sessions remotely, where multiple participants can vote on story points using a customizable deck of values.

## Features

- **Real-time Voting**: Instant vote updates via WebSocket connections
- **Room Management**: Create rooms and share links with team members
- **Story Tracking**: Add story titles and Jira ticket keys
- **Vote Reveal**: Control when votes are revealed to the team
- **Player Management**: Track player names and their votes
- **Share Functionality**: Copy room links to clipboard for easy sharing
- **Room Owner Controls**: Only room owners can reveal, hide, and reset votes

## Project Structure
```pointing-poker/
├── src/
│ ├── app/
│ │ ├── room/
│ │ │ ├── room.component.ts
│ │ │ ├── room.component.html
│ │ │ └── room.component.css
│ │ ├── lobby/
│ │ │ ├── lobby.component.ts
│ │ │ └── lobby.component.html
│ │ ├── models/
│ │ │ └── room.ts
│ │ └── services/
│ │ ├── poker-websocket.service.ts
│ │ └── room-api.service.ts
│ └── main.ts
└── package.json
```

## Components

### LobbyComponent
- Entry point for the application
- Create new rooms
- Join existing rooms via room code
- Auto-populate room code from shared links
- Player name input with localStorage persistence

### RoomComponent
- Main voting interface
- Display players and their votes
- Vote selection with visual feedback
- Story title and Jira key management (room owner only)
- Reveal/Hide/Reset controls (room owner only)
- Share URL copying functionality
- Real-time updates via WebSocket

## Services

### PokerWebsocketService
Manages WebSocket connections for real-time communication:
- `connect(roomCode)` - Establish WebSocket connection
- `join(roomCode, playerId, playerName)` - Join a room
- `leave(roomCode, playerId, playerName)` - Leave a room
- `vote(roomCode, playerId, card)` - Cast a vote
- `reveal(roomCode, playerId)` - Reveal all votes
- `hide(roomCode)` - Hide votes
- `reset(roomCode)` - Reset the round
- `updateStory(roomCode, title, jiraKey, playerId)` - Update story details
- `disconnect()` - Close WebSocket connection

### RoomApiService
Handles REST API calls:
- `getRoom(roomCode)` - Fetch initial room state

## Installation

```bash
cd pointing-poker
npm install
```

## Running the Application
Development server:
```bash
ng serve
```
Navigate to `http://localhost:4200/` in your browser.

## Building for Production
```bash
ng build --configuration production
```

## Technologies Used
- Angular 17+: Frontend framework
- RxJS: Reactive programming library
- WebSocket: Real-time bidirectional communication
- TypeScript: Programming language
- Angular Forms: Form handling with two-way binding

## Default Deck Values
The default poker card values are:

`0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕`

- Numbers represent story point estimates
- ? represents uncertainty
- ☕ represents a coffee break
## Local Storage Keys
- `pp_player_id` - Unique player identifier
- `pp_player_name` - Player's display name
## URL Parameters
Lobby
- ?roomCode=ABC123 - Auto-populate room code to join
Room
- `/room/:code` - Access a specific room
- `?playerId=xyz` - Optional player ID parameter
Usage Flow
- Lobby: Enter your name
- Create or Join: Create a new room or join with a room code
- Setup: Room owner adds story title and Jira key
- Vote: All participants select cards from the deck
- Reveal: Room owner reveals votes when ready
- Reset: Start a new round
## Performance Optimizations
- Uses `ChangeDetectionStrategy.OnPush` for efficient change detection
- Implements `OnDestroy` to clean up subscriptions and WebSocket connections
- localStorage for session persistence
## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
