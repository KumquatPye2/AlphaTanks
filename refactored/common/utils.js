/**
 * Enhanced Utility Functions for AlphaTanks
 * Consolidates common operations found throughout the codebase
 * Eliminates code duplication and provides consistent interfaces
 */

class RefactoredMathUtils {
    /**
     * Generate Gaussian random number using Box-Muller transform
     */
    static gaussianRandom(mean = 0, stdDev = 1) {
        const u = Math.random();
        const v = Math.random();
        const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        return z * stdDev + mean;
    }

    /**
     * Clamp value between min and max
     */
    static clamp(value, min = 0, max = 1) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Calculate Euclidean distance between two points
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate distance between two objects with x,y properties
     */
    static distanceBetween(obj1, obj2) {
        return this.distance(obj1.x, obj1.y, obj2.x, obj2.y);
    }

    /**
     * Calculate angle between two points
     */
    static angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Normalize angle to [-PI, PI] range
     */
    static normalizeAngle(angle) {
        while (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }
        while (angle < -Math.PI) {
            angle += 2 * Math.PI;
        }
        return angle;
    }

    /**
     * Linear interpolation
     */
    static lerp(a, b, t) {
        return a + (b - a) * this.clamp(t, 0, 1);
    }

    /**
     * Check if two line segments intersect
     * Returns true if line (x1,y1)-(x2,y2) intersects line (x3,y3)-(x4,y4)
     */
    static lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denominator) < 1e-10) {
            return false; // Lines are parallel
        }
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    /**
     * Check if point is inside rectangle
     */
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    /**
     * Check if two rectangles overlap
     */
    static rectOverlap(r1, r2) {
        return !(r1.x + r1.width < r2.x || 
                r2.x + r2.width < r1.x || 
                r1.y + r1.height < r2.y || 
                r2.y + r2.height < r1.y);
    }

    /**
     * Calculate similarity between two arrays
     */
    static arraySimilarity(arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) {
            return 0;
        }
        let similarity = 0;
        for (let i = 0; i < arr1.length; i++) {
            similarity += 1 - Math.abs(arr1[i] - arr2[i]);
        }
        return similarity / arr1.length;
    }

    /**
     * Calculate variance of an array
     */
    static variance(values) {
        if (values.length <= 1) {
            return 0;
        }
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    /**
     * Calculate standard deviation
     */
    static standardDeviation(values) {
        return Math.sqrt(this.variance(values));
    }

    /**
     * Calculate trend (simple linear regression slope)
     */
    static calculateTrend(values) {
        if (values.length < 2) {
            return 0;
        }
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    /**
     * Tournament selection from array of candidates
     */
    static tournamentSelect(candidates, tournamentSize = 3) {
        if (candidates.length === 0) {
            return null;
        }
        if (candidates.length <= tournamentSize) {
            return candidates.reduce((best, current) => 
                current.fitness > best.fitness ? current : best
            );
        }
        const tournament = [];
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            tournament.push(candidates[randomIndex]);
        }
        return tournament.reduce((best, current) => 
            current.fitness > best.fitness ? current : best
        );
    }

    /**
     * Sigmoid function
     */
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * Random integer between min and max (inclusive)
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Random float between min and max
     */
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Random element from array
     */
    static randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

class GenomeUtils {
    /**
     * Generate random genome with specified length
     */
    static generateRandom(length = 9) {
        return Array(length).fill(0).map(() => Math.random());
    }

    /**
     * Normalize genome to ensure valid format
     * Handles both array and object formats found in codebase
     */
    static normalize(genome) {
        if (Array.isArray(genome)) {
            // Ensure correct length and clamp values
            const normalized = new Array(9);
            for (let i = 0; i < 9; i++) {
                normalized[i] = MathUtils.clamp(genome[i] || 0.5, 0, 1);
            }
            return normalized;
        } else if (genome && typeof genome === 'object') {
            // Convert object format to array format
            return [
                MathUtils.clamp(genome.aggression || 0.5, 0, 1),
                MathUtils.clamp(genome.speed || 0.5, 0, 1),
                MathUtils.clamp(genome.accuracy || 0.5, 0, 1),
                MathUtils.clamp(genome.defense || genome.caution || 0.5, 0, 1),
                MathUtils.clamp(genome.teamwork || genome.cooperation || 0.5, 0, 1),
                MathUtils.clamp(genome.adaptability || 0.5, 0, 1),
                MathUtils.clamp(genome.learning || 0.5, 0, 1),
                MathUtils.clamp(genome.riskTaking || 0.5, 0, 1),
                MathUtils.clamp(genome.evasion || 0.5, 0, 1)
            ];
        } else {
            // Default genome
            return new Array(9).fill(0.5);
        }
    }

    /**
     * Crossover two parent genomes
     */
    static crossover(parent1, parent2, crossoverRate = 0.7) {
        if (Math.random() > crossoverRate) {
            return Math.random() < 0.5 ? [...parent1] : [...parent2];
        }

        const crossoverPoint = Math.floor(Math.random() * parent1.length);
        const child = [];
        
        for (let i = 0; i < parent1.length; i++) {
            child[i] = i < crossoverPoint ? parent1[i] : parent2[i];
        }
        
        return child;
    }

    /**
     * Mutate genome with given mutation rate
     */
    static mutate(genome, mutationRate = 0.1) {
        const mutated = [...genome];
        for (let i = 0; i < mutated.length; i++) {
            if (Math.random() < mutationRate) {
                // Add gaussian noise for more natural mutations
                mutated[i] = MathUtils.clamp(
                    mutated[i] + MathUtils.gaussianRandom(0, 0.1), 
                    0, 1
                );
            }
        }
        return mutated;
    }

    /**
     * Calculate similarity between two genomes (handles different formats)
     */
    static similarity(genome1, genome2) {
        const norm1 = this.normalize(genome1);
        const norm2 = this.normalize(genome2);
        return MathUtils.arraySimilarity(norm1, norm2);
    }

    /**
     * Classify strategy based on genome traits
     */
    static classifyStrategy(genome) {
        const normalized = this.normalize(genome);
        const [aggression, speed, accuracy, defense, teamwork, _adaptability, _learning, riskTaking, evasion] = normalized;

        if (aggression > 0.7) {
            return 'Aggressive';
        }
        if (defense > 0.7) {
            return 'Defensive';
        }
        if (evasion > 0.7) {
            return 'Evasive';
        }
        if (teamwork > 0.7) {
            return 'Supportive';
        }
        if (riskTaking > 0.7) {
            return 'Risky';
        }
        if (accuracy > 0.7 && speed < 0.3) {
            return 'Sniper';
        }
        if (speed > 0.7) {
            return 'Mobile';
        }
        return 'Balanced';
    }

    /**
     * Analyze genome traits with named properties
     */
    static analyzeTraits(genome) {
        const traitNames = window.TRAIT_NAMES || [
            'aggression', 'speed', 'accuracy', 'defense', 'cooperation',
            'formation', 'flanking', 'ambush', 'riskTaking'
        ];
        
        const normalized = this.normalize(genome);
        const traits = {};
        
        normalized.forEach((value, index) => {
            if (traitNames[index]) {
                traits[traitNames[index]] = parseFloat(value.toFixed(3));
            }
        });
        
        // Calculate derived characteristics
        traits.combatEffectiveness = (traits.aggression + traits.accuracy) / 2;
        traits.tacticalSophistication = (traits.cooperation + traits.formation + traits.flanking) / 3;
        traits.survivalInstinct = (traits.defense + (1 - traits.riskTaking)) / 2;
        
        return traits;
    }

    /**
     * Generate team-specific genome with bias
     */
    static generateTeamSpecific(team, baseGenome = null) {
        const genome = baseGenome ? [...baseGenome] : this.generateRandom();
        
        if (team === 'red') {
            // Red team: more aggressive and risk-taking
            genome[0] = Math.min(1, genome[0] + 0.2); // More aggression
            genome[1] = Math.min(1, genome[1] + 0.1); // More speed
            genome[7] = Math.min(1, genome[7] + 0.2); // More risk-taking
            genome[3] = Math.max(0, genome[3] - 0.1); // Less defensive
        } else if (team === 'blue') {
            // Blue team: more defensive and cooperative
            genome[2] = Math.min(1, genome[2] + 0.2); // More accuracy
            genome[3] = Math.min(1, genome[3] + 0.1); // More defense
            genome[4] = Math.min(1, genome[4] + 0.1); // More teamwork
            genome[0] = Math.max(0, genome[0] - 0.1); // Less aggression
        }
        
        return genome;
    }
}

class CollisionUtils {
    /**
     * Check collision between two objects with x, y, width, height
     */
    static isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    /**
     * Check if line of sight exists between two objects
     */
    static hasLineOfSight(obj1, obj2, obstacles) {
        if (!obstacles || obstacles.length === 0) {
            return true;
        }
        
        for (const obstacle of obstacles) {
            if (this.lineIntersectsRect(obj1.x, obj1.y, obj2.x, obj2.y, obstacle)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if line intersects with rectangle
     */
    static lineIntersectsRect(x1, y1, x2, y2, rect) {
        // Check if line intersects any of the rectangle's four sides
        return MathUtils.lineIntersectsLine(x1, y1, x2, y2, rect.x, rect.y, rect.x + rect.width, rect.y) ||
               MathUtils.lineIntersectsLine(x1, y1, x2, y2, rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height) ||
               MathUtils.lineIntersectsLine(x1, y1, x2, y2, rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height) ||
               MathUtils.lineIntersectsLine(x1, y1, x2, y2, rect.x, rect.y + rect.height, rect.x, rect.y);
    }
}

class DOMUtils {
    /**
     * Safely get element by ID with error handling
     */
    static getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found`);
        }
        return element;
    }

    /**
     * Create element with attributes and styles
     */
    static createElement(tag, attributes = {}, styles = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        Object.entries(styles).forEach(([key, value]) => {
            element.style[key] = value;
        });
        
        return element;
    }

    /**
     * Inject CSS into document head
     */
    static injectCSS(cssText, id = null) {
        if (id && document.getElementById(id)) {
            return; // Already injected
        }
        
        const style = document.createElement('style');
        if (id) {
            style.id = id;
        }
        style.textContent = cssText;
        document.head.appendChild(style);
    }

    /**
     * Remove element by ID
     */
    static removeElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    /**
     * Add event listener with cleanup tracking
     */
    static addEventListener(element, event, callback, options = {}) {
        element.addEventListener(event, callback, options);
        return () => element.removeEventListener(event, callback, options);
    }
}

class PerformanceUtils {
    /**
     * Throttle function execution
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Debounce function execution
     */
    static debounce(func, delay) {
        let timeoutId;
        return function() {
            const args = arguments;
            const context = this;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * Measure execution time
     */
    static measureTime(func, name = 'operation') {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Create performance monitor
     */
    static createPerformanceMonitor() {
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 0;

        return {
            update() {
                frameCount++;
                const currentTime = performance.now();
                if (currentTime - lastTime >= 1000) {
                    fps = frameCount;
                    frameCount = 0;
                    lastTime = currentTime;
                }
            },
            getFPS() {
                return fps;
            }
        };
    }
}

// Event manager for loose coupling
class EventManager {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for '${event}':`, error);
                }
            });
        }
    }

    clear() {
        this.events = {};
    }
}

class ChartManager {
    constructor() {
        this.charts = new Map();
    }

    /**
     * Create or update chart
     */
    createChart(canvasId, config) {
        // Destroy existing chart if it exists
        this.destroyChart(canvasId);
        const canvas = DOMUtils.getElementById(canvasId);
        if (!canvas) {
            return null;
        }
        const chart = new Chart(canvas.getContext('2d'), config);
        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * Destroy specific chart
     */
    destroyChart(canvasId) {
        if (this.charts.has(canvasId)) {
            const chart = this.charts.get(canvasId);
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * Get chart by canvas ID
     */
    getChart(canvasId) {
        return this.charts.get(canvasId);
    }
}

// Export all utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MathUtils: RefactoredMathUtils,
        GenomeUtils,
        CollisionUtils,
        DOMUtils,
        PerformanceUtils,
        EventManager,
        ChartManager
    };
} else {
    // Browser environment - Export with expected names to avoid conflicts
    window.MathUtils = RefactoredMathUtils;
    window.GenomeUtils = GenomeUtils;
    window.CollisionUtils = CollisionUtils;
    window.DOMUtils = DOMUtils;
    window.PerformanceUtils = PerformanceUtils;
    window.EventManager = EventManager;
    window.ChartManager = ChartManager;
}
