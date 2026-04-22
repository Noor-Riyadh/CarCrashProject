# 🚗 Car Crash Traffic Racer 2D

A fast-paced 2D top-down web-based traffic racing game built with HTML5 Canvas and JavaScript.

## 🎮 Play Now

👉 **[Play the Game](https://willowy-beignet-8c8b76.netlify.app)**

## 📖 About

Car Crash Traffic Racer 2D is a browser-based endless runner game where the player controls a red car navigating a 3-lane highway filled with oncoming traffic. Survive as long as possible and beat your high score!

## ✨ Features

- Smooth top-down 2D gameplay
- Infinite scrolling road with 3 lanes
- AABB collision detection
- Progressive difficulty — game speeds up every 200 points
- Best score saved locally (localStorage)
- Pause functionality
- Mobile touch controls
- Real-time multiplayer via WebSocket
- Custom 2D car sprites

## 🕹️ Controls

| Platform | Move Left     | Move Right     | Pause            |
| -------- | ------------- | -------------- | ---------------- |
| Desktop  | ← Arrow or A  | → Arrow or D   | Pause button     |
| Mobile   | Tap left side | Tap right side | Tap pause button |

## 🚀 How to Run Locally

1. Clone the repository:
   git clone https://github.com/Noor-Riyadh/CarCrashProject.git
2. Open in VS Code
3. Right-click `client/index.html`
4. Select **Open with Live Server**
5. Game opens in browser ✅

## 🌐 Multiplayer Setup

1. Navigate to server folder: `cd server`
2. Install dependencies: `npm install`
3. Start server: `node server.js`
4. Open game in two different browsers
5. Click **MULTIPLAYER** in both → play together!

## 🏗️ Project Structure

```
CarCrashProject/
├── client/
│   ├── assets/          # Car sprites (PNG)
│   ├── game.js          # Main game engine
│   ├── road.js          # Road scrolling & traffic
│   ├── collision.js     # Collision detection & score
│   ├── index.html       # Entry point
│   └── style.css        # Styling & mobile scaling
├── server/
│   └── server.js        # WebSocket multiplayer server
└── README.md
```

## 🛠️ Technology Stack

| Technology       | Purpose                      |
| ---------------- | ---------------------------- |
| HTML5 Canvas API | Game rendering (60fps)       |
| JavaScript ES6+  | Game logic                   |
| CSS3             | Responsive layout            |
| Node.js + ws     | WebSocket multiplayer server |
| localStorage     | Best score persistence       |
| Railway.app      | Server deployment            |
| Netlify          | Game deployment              |
| Git + GitHub     | Version control              |

## 🎁 Bonus Features Implemented

- Custom 2D sprite art 
- Custom 3D models 
- Multi-platform support (Windows + Android + iOS)
- Same-platform multiplayer (two devices)
- Cross-platform multiplayer (Android vs Windows)

## 👥 Team

| Member       | Role                | Contribution                                          |
| ------------ | ------------------- | ----------------------------------------------------- |
| Noor Riyadh  | 2D Artist           | Game engine, player movement, multiplayer, deployment |
| Rawan Ayman  | Logic & Environment | Road scrolling, traffic spawning system               |
| Manar Azzam  | UI & Physics        | Collision detection, score system, UI screens         |
| Hala Mohamed | 3D Artist           | 3D car models in Blender                              |

## 📚 Course

Computer Graphics — Spring 2026
Faculty of Computer Science

## 📄 License

This project was created for educational purposes as part of a university course project.
