# King of the Hill Mode 🏰

A new exciting game mode for AlphaTanks that adds strategic depth and asymmetric gameplay!

## 🎯 Objective

Teams compete to control a central hill. The first team to reach **500 points** wins!

## 🏔️ How It Works

### Hill Control
- **Central Hill**: Located in the center of the battlefield
- **Contest Radius**: Larger area around the hill for contesting
- **Capture Time**: 3 seconds to fully capture the hill
- **Scoring**: 10 points per second while controlling the hill

### Gameplay Mechanics
- **Neutral Start**: Hill begins uncontrolled
- **Contested Control**: Multiple teams on hill = no progress
- **Progressive Capture**: Control builds up over time
- **Defensive Advantage**: Easier to maintain than capture

## 🧠 AI Evolution

The King of the Hill mode showcases advanced AI behaviors:

### New AI States
- **`contest_hill`**: Move to and contest the hill
- **Hill Assessment**: AI evaluates threat and opportunity
- **Tactical Positioning**: Smart positioning on and around the hill

### Genome Influences
- **Aggression**: Affects hill priority and willingness to contest
- **Teamwork**: Influences objective focus and coordination
- **Risk-Taking**: Determines contest willingness when outnumbered
- **Adaptability**: Used for formation behavior around objectives

### Strategic Behaviors
- **Aggressive Capturers**: Rush the hill early and often
- **Defensive Holders**: Focus on maintaining control once achieved
- **Support Players**: Provide covering fire for hill contesters
- **Flankers**: Attack enemies approaching the hill

## 🎮 Demo Features

### Visual Elements
- **Hill Visualization**: Clear visual representation with team colors
- **Control Progress**: Ring showing capture/contest progress
- **Score Display**: Real-time team scores
- **Capture Effects**: Particle effects during capture

### UI Components
- **Hill Status Panel**: Shows control percentage and team
- **Score Tracking**: Live updates of team scores
- **Battle Statistics**: Tank counts and battle time
- **Mode Switching**: Toggle between Classic and King of Hill

## 🚀 Getting Started

1. **Open Demo**: Launch `king-of-hill-demo.html`
2. **Select Mode**: Choose "King of Hill" mode
3. **Start Battle**: Click "Start Battle" 
4. **Watch Evolution**: Observe AI strategies develop

## 🏆 Winning Strategies

### For AI Evolution
- **Balanced Teams**: Mix of aggressive and defensive personalities
- **Objective Focus**: High teamwork genome values
- **Risk Management**: Varied risk-taking for different situations

### Observed Behaviors
- **Rush Tactics**: Immediate hill control attempts
- **Siege Warfare**: Surrounding and bombarding the hill
- **Hit-and-Run**: Quick captures when enemies are distracted
- **Formation Fighting**: Coordinated team assaults

## 🔧 Technical Implementation

### Core Classes
- **`Hill`**: Main control point logic and rendering
- **Enhanced Tank AI**: Hill-aware decision making
- **Game Engine**: Mode switching and win condition handling

### Key Features
- **Strategic AI**: Hill threat/opportunity assessment
- **Visual Feedback**: Progressive capture indicators
- **Performance Optimized**: Efficient hill area calculations
- **Extensible Design**: Easy to add new objective-based modes

## 🎯 Future Enhancements

- **Multiple Hills**: Several control points
- **Dynamic Objectives**: Moving or changing hills
- **Power-ups**: Special abilities near the hill
- **Terrain Effects**: Height advantages and cover

---

**Enjoy the strategic depth of King of the Hill mode!** 🎮

Watch as your tank AI evolves from simple fighters into tactical commanders who understand the value of objectives over kills!
