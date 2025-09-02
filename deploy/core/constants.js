/**
 * AlphaTanks - Core Constants and Configuration
 * Centralized configuration management for the entire system
 */

const GAME_CONFIG = {
    BATTLEFIELD: {
        WIDTH: 800,
        HEIGHT: 600,
        GRID_SIZE: 20
    },
    
    TANK: {
        SIZE: 15,
        MAX_SPEED: 2,
        MAX_HEALTH: 100,
        PROJECTILE_SPEED: 4,
        FIRE_COOLDOWN: 500,
        SEARCH_RADIUS: 200
    },
    
    EVOLUTION: {
        POPULATION_SIZE: 20,
        CANDIDATE_POOL_SIZE: 20,
        MUTATION_RATE: 0.1,
        CROSSOVER_RATE: 0.7,
        TOURNAMENT_SIZE: 3,
        GENERATION_INTERVAL: 5,
        GENOME_LENGTH: 9
    },
    
    UI: {
        UPDATE_INTERVAL: 100,
        CHART_MAX_POINTS: 10,
        LOG_MAX_ENTRIES: 100,
        ANIMATION_DURATION: 300
    },
    
    PERFORMANCE: {
        MAX_FPS: 60,
        DELTA_TIME_CAP: 0.05,
        BATTLE_TIME_LIMIT: 60000
    }
};

const TRAIT_NAMES = [
    'aggression', 'speed', 'accuracy', 'defense', 'cooperation',
    'formation', 'flanking', 'ambush', 'riskTaking'
];

const TEAM_COLORS = {
    red: {
        primary: '#ff4444',
        secondary: '#cc3333',
        background: 'rgba(255, 68, 68, 0.2)'
    },
    blue: {
        primary: '#4444ff',
        secondary: '#3333cc',
        background: 'rgba(68, 68, 255, 0.2)'
    }
};

const EVENT_TYPES = {
    BATTLE_START: 'battleStart',
    BATTLE_END: 'battleEnd',
    GENERATION_COMPLETE: 'generationComplete',
    MUTATION: 'mutation',
    CROSSOVER: 'crossover',
    TOURNAMENT: 'tournament'
};

const CSS_CLASSES = {
    DASHBOARD: 'asi-arch-dashboard',
    CHART: 'chart-container',
    METRIC: 'metric-item',
    LOG_ENTRY: 'log-entry',
    BUTTON: 'control-button'
};

// Export for browser global scope
if (typeof window !== 'undefined') {
    window.GAME_CONFIG = GAME_CONFIG;
    window.TRAIT_NAMES = TRAIT_NAMES;
    window.TEAM_COLORS = TEAM_COLORS;
    window.EVENT_TYPES = EVENT_TYPES;
    window.CSS_CLASSES = CSS_CLASSES;
}

// Export for Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONFIG,
        TRAIT_NAMES,
        TEAM_COLORS,
        EVENT_TYPES,
        CSS_CLASSES
    };
}
