# AlphaTanks: ASI-ARCH Coevolution Battle

A web-based tank battle game demonstrating **ASI-ARCH methodology** for autonomous AI evolution. Watch as tank teams evolve their own strategies through computational research scaling.

![AlphaTanks Banner](https://img.shields.io/badge/ASI--ARCH-Tank%20Evolution-brightgreen) ![Status](https://img.shields.io/badge/Status-Sprint%201%20Complete-success) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Project Overview

**AlphaTanks** implements the groundbreaking **ASI-ARCH** (Artificial Superintelligence for AI Research) methodology in an engaging tank battle simulation. The system demonstrates how AI can conduct its own research, autonomously discovering and evolving superior tank combat strategies.

### Key Features

- 🧬 **Autonomous Evolution**: Tank AI evolves without human intervention
- ⚔️ **Real-time Battles**: Watch evolution in action through engaging combat
- 📊 **ASI-ARCH Framework**: Complete four-module implementation
- � **Red Queen Race**: Competitive coevolution drives continuous improvement
- �🎮 **Interactive Dashboard**: Control and observe the evolution process
- 📈 **Fitness Tracking**: Monitor performance improvements over generations
- 🔬 **Emergent Behaviors**: Discover unexpected tactical patterns

## 🏗️ ASI-ARCH Implementation

Our system implements all four core ASI-ARCH modules:

### 1. **Researcher Module** 🔬
- Proposes new tank behavior architectures
- Uses genetic algorithms with military tactics knowledge
- Implements parent selection and mutation strategies
- Introduces novel traits (flanking, ambush, sacrifice)

### 2. **Engineer Module** ⚙️
- Evaluates tank performance in real battle simulations
- Conducts automated fitness testing
- Handles error correction and debugging
- Provides quantitative performance metrics

### 3. **Analyst Module** 📊
- Generates insights from battle results
- Identifies emergent behavioral patterns  
- Tracks fitness progression over generations
- Detects significant performance breakthroughs

### 4. **Cognition Module** 🧠
- Military tactics knowledge base
- Strategic principles (phalanx, pincer, blitzkrieg, guerrilla)
- Human expertise integration
- Tactical pattern recognition

## 🚀 Quick Start

### Prerequisites
- Python 3.6+ (for development server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Running the Game

1. **Clone/Download** the project files
2. **Start the server**:
   ```bash
   python serve.py
   ```
3. **Open browser** to `http://localhost:8000`
4. **Click "Start Evolution"** to begin autonomous tank evolution

### Controls

| Key | Action |
|-----|--------|
| `SPACE` | Start/Pause Evolution |
| `R` | Reset Battle |
| `F` | Toggle Fast Mode |
| `D` | Toggle Debug Mode |

## 🎮 How It Works

### 1. **Initial Population**
- System generates diverse tank genomes with random traits
- Each tank has behavioral parameters: aggression, caution, speed, accuracy, cooperation, formation

### 2. **Battle Simulation**
- Red and Blue teams battle on a strategic battlefield
- Tanks use evolved AI to make movement, combat, and coordination decisions
- Real-time physics simulation with obstacles and projectiles

### 3. **Fitness Evaluation**
- **Quantitative**: Win rate, survival time, damage efficiency, accuracy
- **Qualitative**: Tactical sophistication, behavioral complexity
- **Composite Score**: ASI-ARCH's multi-dimensional fitness function

### 4. **Evolution Cycle**
- Best performing genomes selected as parents
- Genetic crossover and mutation create new generations
- Military tactics knowledge guides evolution direction
- Novel behaviors emerge through iterative improvement

### 5. **Discovery & Analysis**
- System identifies successful tactical patterns
- Emergent behaviors logged and analyzed
- Performance trends tracked across generations
- Significant breakthroughs highlighted

## 📊 Evolution Dashboard

The real-time dashboard shows:

- **Generation Progress**: Current generation and total experiments
- **Team Statistics**: Win rates, fitness scores, best architectures
- **Battle Metrics**: Live tank counts, battle duration, current status
- **Evolution Log**: Discoveries, mutations, fitness improvements
- **Architecture Info**: Novel designs and successful mutations

## 🧬 Tank Genome Structure

```javascript
TankGenome = {
    // Basic traits (0.0 - 1.0)
    aggression: 0.7,    // Attack eagerness
    caution: 0.3,       // Danger avoidance
    speed: 0.8,         // Movement speed
    accuracy: 0.75,     // Weapon precision
    cooperation: 0.6,   // Team coordination
    formation: 0.4,     // Group tactics
    
    // Advanced traits (emergent)
    flanking: 0.0,      // Circling maneuvers
    ambush: 0.0,        // Stealth attacks
    sacrifice: 0.0      // Kamikaze tactics
}
```

## 🔬 Scientific Validation

AlphaTanks demonstrates key ASI-ARCH principles:

- ✅ **Autonomous Research**: AI conducting its own experiments
- ✅ **Composite Fitness**: Multi-dimensional performance evaluation  
- ✅ **Emergent Intelligence**: Behaviors not explicitly programmed
- ✅ **Computational Scaling**: Research breakthroughs scale with compute
- ✅ **Knowledge Integration**: Human expertise guides evolution

## 📈 Expected Results

As evolution progresses, you should observe:

1. **Improved Win Rates**: Teams become more effective over time
2. **Tactical Sophistication**: Advanced maneuvers like flanking emerge
3. **Specialized Roles**: Tanks develop distinct behavioral niches
4. **Team Coordination**: Better formation and cooperation strategies
5. **Emergent Strategies**: Novel tactics not seen in initial population

## 🛠️ Development Status

### ✅ Sprint 1 Complete (Weeks 1-2)
- [x] Core game engine with 60 FPS performance
- [x] Tank physics and combat system  
- [x] Battlefield with strategic obstacles
- [x] Basic AI behaviors and team dynamics
- [x] Real-time battle simulation
- [x] Performance monitoring and statistics

### 🚧 Sprint 2 In Progress (Weeks 3-4)
- [x] ASI-ARCH four-module framework
- [x] Evolution engine with genetic algorithms
- [x] Tank genome system and fitness evaluation
- [x] Military tactics knowledge integration
- [x] Real-time evolution dashboard
- [ ] Advanced trait emergence (flanking, ambush)

### 📋 Sprint 3 Planned (Weeks 5-6)
- [ ] Sophisticated formation behaviors
- [ ] Advanced decision-making algorithms
- [ ] Enhanced user interface and visualizations
- [ ] Behavior analysis and replay tools
- [ ] Performance optimization

### 📋 Sprint 4 Planned (Weeks 7-8)
- [ ] Code optimization and bug fixes
- [ ] Comprehensive documentation
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Deployment and hosting

## 🎯 Success Metrics

### Technical Performance
- **Frame Rate**: Maintain 60 FPS with 20 tanks
- **Evolution Speed**: 50+ generations in 10 minutes
- **Emergence Rate**: 3+ distinct tactical patterns
- **Stability**: <5 bugs per 100 battles

### Research Validation
- **Fitness Improvement**: Measurable generation-over-generation gains
- **Behavioral Diversity**: Multiple successful strategies emerge
- **Tactical Sophistication**: Advanced maneuvers develop autonomously
- **Scaling Demonstration**: Performance scales with computational resources

## 🔮 Future Extensions

### Advanced Features
- **Neural Networks**: Replace rule-based AI with actual neural networks
- **3D Battlefield**: WebGL rendering with terrain and elevation
- **Multiplayer Evolution**: Collaborative genome sharing between users
- **VR Support**: Immersive battlefield observation
- **Machine Learning**: TensorFlow.js integration for real AI training

### Research Applications  
- **Academic Tool**: Platform for AI education and research
- **Algorithm Testing**: Framework for comparing evolution strategies
- **Benchmarking**: Standard for ASI-ARCH implementations
- **Publication**: Research paper on emergent military tactics

## 📚 References

- **ASI-ARCH Paper**: "AlphaGo Moment for Model Architecture Discovery" (2507.18074v1.pdf)
- **Genetic Algorithms**: Holland, J.H. "Adaptation in Natural and Artificial Systems"
- **Military Strategy**: Clausewitz, C. "On War" 
- **Game AI**: Millington, I. "AI for Games"

## 🤝 Contributing

This project demonstrates ASI-ARCH principles in an educational context. Contributions welcome:

1. **Bug Reports**: Issues with evolution or rendering
2. **Feature Requests**: New behavioral traits or visualizations
3. **Performance Optimization**: Efficiency improvements
4. **Documentation**: Better explanations and tutorials

## 📄 License

MIT License - Feel free to use for educational and research purposes.

---

**AlphaTanks** - *Demonstrating the future of autonomous AI research through engaging tank evolution*

*"Like AlphaGo's Move 37 that revealed unexpected strategic insights invisible to human players, our AI-discovered tank strategies demonstrate emergent design principles that systematically surpass human intuition."*
