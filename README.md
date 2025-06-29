# Memory Game

A React-based memory game where players test their memory by clicking on squares that briefly flash white. The game features progressive difficulty, a lives system, and a beautiful modern dark gray responsive design with fast, snappy animations.

## Features

- **Progressive Difficulty**: Each level increases the number of squares to memorize
- **Dynamic Square Sizing**: Squares start large and get smaller as grid expands, maintaining visual balance
- **Lives System**: Start with 3 lives, lose one for every 3 mistakes on a level
- **Fast Responsive Animations**: Quick 0.6-second flashes and smooth 0.15-second transitions
- **Clean Modern UI**: Dark gray theme with game elements directly on the background
- **Fully Responsive**: Adapts beautifully to mobile, tablet, and desktop devices

## Game Rules

1. Watch carefully as squares flash white for 0.6 seconds
2. Click on all the squares that flashed white
3. Make 3 mistakes on a level and lose a life
4. Lose all 3 lives and the game ends
5. Complete levels to advance - the grid size increases every 3 levels!

## Visual Design

- **Dark Gray Theme**: Modern dark background with high contrast elements
- **Dynamic Sizing**: 
  - 4x4 grid: Large squares (32x32 on desktop)
  - 5x5 grid: Medium squares (26x26 on desktop) 
  - 6x6 grid: Smaller squares (22x22 on desktop)
- **Clean Layout**: Game sits directly on background without cards or boxes
- **Fast Animations**: All interactions feel snappy and responsive

## Technology Stack

- **React 18** - Modern functional components with hooks
- **Tailwind CSS** - Utility-first styling for responsive design
- **Custom CSS Animations** - Smooth flashing and transition effects

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MemoryGame
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the game in your browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Game Mechanics

### Difficulty Progression
- **Level 1**: 4x4 grid, 3 squares to memorize
- **Level 2**: 4x4 grid, 4 squares to memorize
- **Level 3**: 4x4 grid, 5 squares to memorize
- **Level 4**: 5x5 grid, 6 squares to memorize
- And so on...

### Lives System
- Start with 3 lives (represented by heart icons)
- Make 3 mistakes on any level = lose 1 life
- Lose all lives = game over
- Lives persist across levels

## Project Structure

```
src/
├── App.js          # Main game component with all logic
├── index.js        # React DOM rendering
├── index.css       # Global styles and animations
└── ...

public/
├── index.html      # HTML template
└── ...

tailwind.config.js  # Tailwind CSS configuration
postcss.config.js   # PostCSS configuration
package.json        # Dependencies and scripts
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).
