/**
 * Utility Functions for AlphaTanks
 * Common mathematical and statistical operations used across the system
 */

class MathUtils {
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
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
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
        const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // 0² + 1² + 2² + ... + (n-1)²
        
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
}

class DOMUtils {
    /**
     * Safely get element by ID with error handling
     */
    static getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`🔍 Element with ID '${id}' not found`);
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
     * Remove element safely
     */
    static removeElement(selector) {
        const element = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * Inject CSS styles into document head
     */
    static injectCSS(cssText, id = null) {
        // Remove existing style if id provided
        if (id) {
            const existing = document.getElementById(id);
            if (existing) {
                existing.remove();
            }
        }

        const style = document.createElement('style');
        if (id) {
            style.id = id;
        }
        style.textContent = cssText;
        document.head.appendChild(style);
        return style;
    }
}

class GenomeUtils {
    /**
     * Generate random genome with proper trait values
     */
    static generateRandom(length = 9) {
        return Array(length).fill().map(() => Math.random());
    }

    /**
     * Generate team-specific genome with biases
     */
    static generateTeamSpecific(team, length = 9) {
        const genome = this.generateRandom(length);
        
        // Apply team-specific biases
        if (team === 'red') {
            genome[0] *= 1.2; // Higher aggression
            genome[2] *= 1.1; // Better accuracy
        } else if (team === 'blue') {
            genome[3] *= 1.2; // Higher defense
            genome[4] *= 1.1; // Better cooperation
        }
        
        return genome.map(val => MathUtils.clamp(val));
    }

    /**
     * Crossover two parent genomes
     */
    static crossover(parent1, parent2) {
        const child = new Array(parent1.length);
        
        for (let i = 0; i < parent1.length; i++) {
            child[i] = Math.random() < 0.5 ? parent1[i] : parent2[i];
            child[i] += (Math.random() - 0.5) * 0.1; // Small variation
            child[i] = MathUtils.clamp(child[i]);
        }
        
        return child;
    }

    /**
     * Mutate genome with given rate
     */
    static mutate(genome, mutationRate = 0.1) {
        const mutated = [...genome];
        const mutatedIndices = [];
        
        for (let i = 0; i < mutated.length; i++) {
            if (Math.random() < mutationRate) {
                const mutation = MathUtils.gaussianRandom(0, 0.2);
                mutated[i] += mutation;
                mutated[i] = MathUtils.clamp(mutated[i]);
                mutatedIndices.push(i);
            }
        }
        
        return { genome: mutated, mutatedIndices };
    }

    /**
     * Analyze genome traits with named properties
     */
    static analyzeTraits(genome) {
        const traitNames = window.TRAIT_NAMES || [
            'aggression', 'speed', 'accuracy', 'defense', 'cooperation',
            'formation', 'flanking', 'ambush', 'riskTaking'
        ];
        
        const traits = {};
        genome.forEach((value, index) => {
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
}

class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Add event listener
     */
    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
    }

    /**
     * Remove event listener
     */
    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            const callbacks = this.listeners.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to all listeners
     */
    emit(eventType, data = {}) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Clear all listeners for event type
     */
    clear(eventType) {
        if (eventType) {
            this.listeners.delete(eventType);
        } else {
            this.listeners.clear();
        }
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

// Export utilities to global scope
if (typeof window !== 'undefined') {
    window.MathUtils = MathUtils;
    window.DOMUtils = DOMUtils;
    window.GenomeUtils = GenomeUtils;
    window.EventManager = EventManager;
    window.ChartManager = ChartManager;
}

// Export for Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MathUtils,
        DOMUtils,
        GenomeUtils,
        EventManager,
        ChartManager
    };
}
