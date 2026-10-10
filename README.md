# Celestial Monarch 3D - Browser Game

## Overview

A fantasy 3D browser-based combat game built with **Three.js**. Play as a cursed warrior with 4 fighting modes, battle enemies across chapters, and experience dynamic combat.

## Features

✨ **4 Fighting Modes:**
- 🗡️ **Sword** - Close range slashes
- ⚡ **Rumble** - Lightning attacks  
- 🩸 **Sanguine** - Blood magic with lifesteal
- 👼 **V4 Transform** - Ultimate power burst

🎮 **Gameplay:**
- Real-time 3D combat
- Resource management (Fruit, V4, Ultimate gauges)
- Multiple waves of enemies
- Progressive difficulty
- Smooth camera follow

📊 **UI:**
- Live health/resource bars
- Mode indicator
- Chapter counter
- Dialogue messages

## How to Play

### Setup

```bash
# Clone the repo
git clone https://github.com/celestialgamingbloxfruit/celestial-monarch-game.git
cd celestial-monarch-game

# Start a local server (Python 3)
python -m http.server 8000

# Or Node.js
npx http-server
```

Open in browser: `http://localhost:8000`

### Controls

| Input | Action |
|-------|--------|
| **WASD** / Arrow Keys | Move |
| **Mouse** | Aim |
| **Left Click** / **Space** | Attack |
| **1** | Sanguine Mode |
| **2** | Rumble Mode |
| **3** | Sword Mode |
| **4** | V4 Transform |

## Technical Stack

- **Three.js** - 3D rendering
- **WebGL** - GPU acceleration
- **ES6 Modules** - Modern JavaScript
- **Vanilla CSS** - UI styling

## File Structure

```
├── index.html      # Main HTML file
├── style.css       # UI styles
├── main.js         # Game engine & logic
└── README.md       # This file
```

## Game Systems

### Combat
- Each mode has unique damage & range
- Resource consumption varies by attack
- Gauge building triggers V4 ultimate

### Progression
- 3 waves per chapter (scalable)
- Enemy difficulty increases each wave
- Victory screen on completion

### Visuals
- PBR materials with metalness/roughness
- Emissive glows for magic effects
- Dynamic lighting & shadows
- Fog for depth perception

## Future Expansion

Potential additions:
- Story cutscenes & dialogue trees
- Boss encounters
- Character progression/upgrades
- Multiplayer support
- Mobile optimization
- Custom character skins

## License

Open source. Feel free to modify and share.

---

**Made with ❤️ using Three.js**
