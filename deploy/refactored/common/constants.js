/**
 * AlphaTanks - Enhanced Core Constants and Configuration
 * Centralized configuration management for the entire system
 * Extended from the original constants.js with additional values extracted from codebase
 */

const GAME_CONFIG = {
    BATTLEFIELD: {
        WIDTH: 800,
        HEIGHT: 600,
        GRID_SIZE: 50,
        MIN_SPAWN_DISTANCE: 50,
        MAX_SPAWN_DISTANCE: 150,
        SPAWN_MARGIN_RATIO: 0.2 // 20% from edges
    },
    
    TANK: {
        SIZE: 24,
        WIDTH: 24,
        HEIGHT: 16,
    MAX_SPEED: 210,
    BASE_SPEED: 80, // Halved from 160 per request
    SPEED_MULTIPLIER: 0.7,
        MAX_HEALTH: 100,
        BASE_FIRE_RATE: 1.0,
        MAX_FIRE_RATE_BONUS: 1.0,
        BASE_DAMAGE: 20,
        MAX_DAMAGE_BONUS: 10,
        BASE_RANGE: 200,
        MAX_RANGE_BONUS: 100,
        BASE_ACCURACY: 0.7,
        MAX_ACCURACY_BONUS: 0.3,
        SEARCH_RADIUS: 200,
    MOVEMENT_THRESHOLD: 3 // pixels for battle start detection
    },
    
    PROJECTILE: {
        SPEED: 300,
        LIFETIME: 2.0, // seconds
        SIZE: 4
    },
    
    EVOLUTION: {
        POPULATION_SIZE: 20,
        CANDIDATE_POOL_SIZE: 20,
        INITIAL_CANDIDATES_PER_TEAM: 10,
        MUTATION_RATE: 0.3,
        CROSSOVER_RATE: 0.7,
        TOURNAMENT_SIZE: 3,
        GENERATION_INTERVAL: 5,
        GENOME_LENGTH: 9,
        FITNESS_RANGE: {
            MIN: 0.4,
            MAX: 0.7
        },
        SIMILARITY_THRESHOLD: 0.9,
        MIN_BATTLES_FOR_STATS: 3
    },
    
    BATTLE: {
        MAX_DURATION: 120, // seconds
        MIN_DURATION_FOR_TIMEOUT: 15, // seconds
        KING_OF_HILL: {
            CONTROL_RADIUS: 60,
            WIN_TIME: 30, // seconds of control needed
            CENTER_OFFSET: 0 // from battlefield center
        }
    },
    
    GENOME: {
        TRAITS: [
            'aggression',    // 0: Combat eagerness and attack frequency
            'speed',         // 1: Movement speed and maneuverability  
            'accuracy',      // 2: Shooting precision and range
            'defense',       // 3: Defensive positioning and caution
            'teamwork',      // 4: Cooperation and coordination
            'adaptability',  // 5: Strategy switching and formation behavior
            'learning',      // 6: Experience-based improvement
            'riskTaking',    // 7: Willingness to take tactical risks
            'evasion'        // 8: Dodging and escape behavior
        ],
        TRAIT_RANGES: {
            MIN: 0.0,
            MAX: 1.0,
            DEFAULT: 0.5
        },
        // Trait-specific modifiers for clearer behavior mapping
        MODIFIERS: {
            AGGRESSION: {
                fire_rate_min: 1.0,
                fire_rate_max: 2.0,
                damage_bonus: 10,
                hill_priority_multiplier: 0.8
            },
            SPEED: {
                base_multiplier: 0.5,
                bonus_multiplier: 0.5
            },
            ACCURACY: {
                base_accuracy: 0.7,
                bonus_accuracy: 0.3,
                range_bonus: 100
            },
            DEFENSE: {
                caution_weight: 1.0,
                retreat_threshold: 0.3
            },
            TEAMWORK: {
                cooperation_weight: 1.0,
                objective_focus_min: 0.3,
                objective_focus_range: 0.4
            },
            RISK_TAKING: {
                contest_willingness: 0.9,
                engagement_modifier: 1.0
            },
            EVASION: {
                dodge_weight: 1.0,
                escape_priority: 1.0
            }
        }
    },
    
    UI: {
        UPDATE_INTERVAL: 100,
        CHART_MAX_POINTS: 10,
        LOG_MAX_ENTRIES: 100,
        ANIMATION_DURATION: 300,
        COLORS: {
            RED_TEAM: '#ff4444',
            BLUE_TEAM: '#4444ff',
            NEUTRAL: '#888888',
            BACKGROUND: '#0a0a0a',
            GRID: '#333333',
            OBSTACLE_COVER: '#444444',
            OBSTACLE_BARRIER: '#666666'
        }
    },
    
    PERFORMANCE: {
        MAX_FPS: 60,
        DELTA_TIME_CAP: 0.1,
        MIN_DELTA_TIME: 0.001,
        BATTLE_TIME_LIMIT: 120000, // milliseconds
        OPTIMIZATION: {
            BATCH_COLLISION_CHECK: true,
            CULL_DEAD_ENTITIES: true,
            EARLY_EXIT_CONDITIONS: true
        }
    },
    
    DEBUG: {
        LOGGING_ENABLED: false,
        TRACE_BATTLE_END: false,
        SHOW_PERFORMANCE_STATS: false,
        LOG_AI_DECISIONS: false
    },
    
    ASI_ARCH: {
        RED_QUEEN: {
            TEAM_SEPARATION: true,
            LINEAGE_TRACKING: true,
            COUNTER_EVOLUTION: true
        },
        TACTICAL_METRICS: {
            COORDINATION_WEIGHT: 0.3,
            ADAPTABILITY_WEIGHT: 0.25,
            SURVIVAL_WEIGHT: 0.25,
            DIVERSITY_WEIGHT: 0.2
        }
    }
};

// Trait name constants for type safety
const TRAIT_NAMES = GAME_CONFIG.GENOME.TRAITS;

// State constants
const GAME_STATES = {
    READY: 'ready',
    RUNNING: 'running', 
    PAUSED: 'paused',
    ENDED: 'ended'
};

const TANK_STATES = {
    PATROL: 'patrol',
    ATTACK: 'attack', 
    RETREAT: 'retreat',
    GROUP: 'group',
    SEEK_HILL: 'seek_hill',
    DEFEND_HILL: 'defend_hill'
};

const BATTLE_OUTCOMES = {
    RED_WINS: 'red',
    BLUE_WINS: 'blue',
    DRAW: 'draw',
    TIMEOUT: 'timeout'
};

// Export all constants
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONFIG,
        TRAIT_NAMES,
        GAME_STATES,
        TANK_STATES,
        BATTLE_OUTCOMES
    };
} else {
    // Browser environment
    window.GAME_CONFIG = GAME_CONFIG;
    window.TRAIT_NAMES = TRAIT_NAMES;
    window.GAME_STATES = GAME_STATES;
    window.TANK_STATES = TANK_STATES;
    window.BATTLE_OUTCOMES = BATTLE_OUTCOMES;
}
