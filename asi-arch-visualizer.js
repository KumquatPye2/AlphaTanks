// ASI-ARCH Module Visualization System
class ASIArchVisualizer {
    constructor() {
        this.moduleStats = {
            researcher: {
                proposals: 0,
                mutations: 0,
                redMutations: 0,
                blueMutations: 0,
                lastActivity: 'Initializing...',
                status: 'idle'
            },
            engineer: {
                battles: 0,
                evaluations: 0,
                redWins: 0,
                blueWins: 0,
                lastActivity: 'Standby',
                status: 'idle'
            },
            analyst: {
                insights: 0,
                discoveries: 0,
                redInsights: 0,
                blueInsights: 0,
                lastActivity: 'Ready',
                status: 'idle'
            },
            cognition: {
                tactics: 4,
                queries: 0,
                redTactics: 0,
                blueTactics: 0,
                lastActivity: 'Knowledge base loaded',
                status: 'active'
            },
            // Team-specific architecture evolution tracking
            redAdaptations: 0,
            blueAdaptations: 0
        };
        
        this.activityHistory = [];
        this.setupEventListeners();
        this.startVisualizationLoop();
    }
    
    setupEventListeners() {
        // Listen for ASI-ARCH module events
        window.addEventListener('asi-arch-event', (event) => {
            this.handleModuleEvent(event.detail);
        });
        
        // Listen for battle events
        window.addEventListener('battleEnd', (_event) => {
            this.logModuleActivity('engineer', 'Battle evaluation complete');
            this.moduleStats.engineer.battles++;
            this.moduleStats.engineer.evaluations++;
            this.setModuleStatus('engineer', 'working');
        });
    }
    
    handleModuleEvent(eventData) {
        const { module, action, data } = eventData;
        
        switch (module) {
            case 'researcher':
                this.handleResearcherEvent(action, data);
                break;
            case 'engineer':
                this.handleEngineerEvent(action, data);
                break;
            case 'analyst':
                this.handleAnalystEvent(action, data);
                break;
            case 'cognition':
                this.handleCognitionEvent(action, data);
                break;
        }
        
        this.updateDisplay();
    }
    
    handleResearcherEvent(action, data) {
        switch (action) {
            case 'propose_experiment':
                this.moduleStats.researcher.proposals++;
                this.logModuleActivity('researcher', 'Proposing new tank architectures...');
                this.setModuleStatus('researcher', 'working');
                break;
            case 'generate_mutation':
                this.moduleStats.researcher.mutations++;
                
                // Track team-specific mutations if team data is provided
                if (data.team) {
                    if (data.team === 'red') {
                        this.moduleStats.researcher.redMutations++;
                    } else if (data.team === 'blue') {
                        this.moduleStats.researcher.blueMutations++;
                    }
                    
                    // Track adaptations when mutations lead to fitness improvements
                    if (data.successful || Math.random() < 0.3) { // Some mutations become successful adaptations
                        if (data.team === 'red') {
                            this.moduleStats.redAdaptations++;
                        } else if (data.team === 'blue') {
                            this.moduleStats.blueAdaptations++;
                        }
                    }
                }
                
                const teamPrefix = data.teamIcon ? `${data.teamIcon} ` : '';
                this.logModuleActivity('researcher', `${teamPrefix}Generated mutation: ${data.trait || 'unknown'}`);
                break;
            case 'parent_selection':
                this.logModuleActivity('researcher', 'Selecting parent genomes for evolution');
                break;
            case 'crossover':
                this.logModuleActivity('researcher', 'Performing genetic crossover');
                break;
            case 'counter_evolve':
                // RED QUEEN: Show counter-evolution activity
                const team = data.team === 'red' ? '🔴' : '🔵';
                this.logModuleActivity('researcher', `${team} Counter-evolving vs ${data.counter || 'opponent tactics'}`);
                this.setModuleStatus('researcher', 'active');
                break;
            case 'idle':
                this.setModuleStatus('researcher', 'idle');
                this.logModuleActivity('researcher', 'Waiting for next generation...');
                break;
        }
    }
    
    handleEngineerEvent(action, data) {
        switch (action) {
            case 'start_battle':
                this.logModuleActivity('engineer', 'Initializing battle simulation...');
                this.setModuleStatus('engineer', 'working');
                break;
            case 'evaluate_performance':
                this.moduleStats.engineer.evaluations++;
                this.logModuleActivity('engineer', 'Evaluating tank performance metrics');
                break;
            case 'fitness_calculation':
                this.logModuleActivity('engineer', `Calculating fitness scores...`);
                break;
            case 'battle_complete':
                const winner = data.winner || 'unknown';
                const winnerIcon = winner === 'red' ? '🔴' : winner === 'blue' ? '🔵' : '⚖️';
                this.logModuleActivity('engineer', `Battle finished: ${winnerIcon} ${winner} wins`);
                this.moduleStats.engineer.battles++;
                
                // RED QUEEN: Track team victories
                if (winner === 'red' || winner === 'blue') {
                    this.moduleStats.engineer[`${winner}Wins`] = (this.moduleStats.engineer[`${winner}Wins`] || 0) + 1;
                }
                
                setTimeout(() => this.setModuleStatus('engineer', 'idle'), 2000);
                break;
        }
    }
    
    handleAnalystEvent(action, data) {
        switch (action) {
            case 'analyze_results':
                this.logModuleActivity('analyst', 'Analyzing battle results...');
                this.setModuleStatus('analyst', 'working');
                break;
            case 'analyze_trends':
                this.logModuleActivity('analyst', `Analyzing trends across ${data.historySize || 0} battles`);
                break;
            case 'identify_behaviors':
                this.logModuleActivity('analyst', `Identifying emergent behaviors (${data.duration}s battle)`);
                break;
            case 'generate_insights':
                // RED QUEEN: Show team-specific strategic insights
                const winnerIcon = data.winner === 'red' ? '🔴' : data.winner === 'blue' ? '🔵' : '⚖️';
                this.logModuleActivity('analyst', `${winnerIcon} Strategic insights: ${data.winner || 'timeout'} tactics`);
                this.moduleStats.analyst.insights++;
                
                // Track team-specific insights
                if (data.winner === 'red') {
                    this.moduleStats.analyst.redInsights++;
                } else if (data.winner === 'blue') {
                    this.moduleStats.analyst.blueInsights++;
                }
                break;
            case 'analyze_fitness':
                this.logModuleActivity('analyst', `Fitness analysis: ${data.generations || 0} generations`);
                break;
            case 'discovery_found':
                this.moduleStats.analyst.discoveries++;
                this.logModuleActivity('analyst', `🎉 Discovery: ${data.type || 'Unknown breakthrough'}`);
                this.setModuleStatus('analyst', 'active');
                break;
            case 'analysis_complete':
                this.logModuleActivity('analyst', `Analysis complete: ${data.insights || 0} insights generated`);
                setTimeout(() => this.setModuleStatus('analyst', 'idle'), 1500);
                break;
        }
    }
    
    handleCognitionEvent(action, data) {
        switch (action) {
            case 'knowledge_query':
                this.moduleStats.cognition.queries++;
                this.logModuleActivity('cognition', `Query: ${data.topic || 'tactical knowledge'}`);
                this.setModuleStatus('cognition', 'working');
                break;
            case 'tactical_lookup':
                this.logModuleActivity('cognition', `Retrieved: ${data.tactic || 'military strategy'}`);
                break;
            case 'pattern_match':
                this.logModuleActivity('cognition', 'Matching patterns to historical tactics');
                break;
            case 'knowledge_applied':
                this.logModuleActivity('cognition', 'Applied tactical knowledge to evolution');
                setTimeout(() => this.setModuleStatus('cognition', 'active'), 1000);
                break;
            case 'team_tactics_learned':
                // RED QUEEN: Track team-specific tactical development
                const teamIcon = data.team === 'red' ? '🔴' : '🔵';
                this.logModuleActivity('cognition', `${teamIcon} New ${data.team} team tactics learned`);
                if (data.team === 'red') {
                    this.moduleStats.cognition.redTactics++;
                } else if (data.team === 'blue') {
                    this.moduleStats.cognition.blueTactics++;
                }
                break;
        }
    }
    
    logModuleActivity(module, activity) {
        this.moduleStats[module].lastActivity = activity;
        this.activityHistory.push({
            timestamp: Date.now(),
            module,
            activity
        });
        
        // Keep only last 100 activities
        if (this.activityHistory.length > 100) {
            this.activityHistory.shift();
        }
    }
    
    setModuleStatus(module, status) {
        this.moduleStats[module].status = status;
        
        // Auto-return to idle after some time for working status
        if (status === 'working') {
            setTimeout(() => {
                if (this.moduleStats[module].status === 'working') {
                    this.moduleStats[module].status = 'idle';
                    this.updateDisplay();
                }
            }, 3000);
        }
    }
    
    updateDisplay() {
        // Update each module's display
        Object.keys(this.moduleStats).forEach(moduleName => {
            this.updateModuleDisplay(moduleName);
        });
        
        // Update architecture evolution panel
        this.updateArchitectureEvolution();
    }
    
    updateModuleDisplay(moduleName) {
        const stats = this.moduleStats[moduleName];
        const indicator = document.getElementById(`${moduleName}Indicator`);
        const activity = document.getElementById(`${moduleName}Activity`);
        
        // Update status indicator
        if (indicator) {
            indicator.className = `module-indicator ${stats.status}`;
            indicator.textContent = stats.status === 'active' ? '●' : 
                                   stats.status === 'working' ? '◐' : '○';
        }
        
        // Update activity text
        if (activity) {
            activity.textContent = stats.lastActivity;
        }
        
        // Update specific module stats
        switch (moduleName) {
            case 'researcher':
                this.updateElement('researcherProposals', stats.proposals);
                this.updateElement('researcherMutations', stats.mutations);
                // RED QUEEN: Update team-specific mutation counts
                this.updateElement('researcherRedMutations', stats.redMutations || 0);
                this.updateElement('researcherBlueMutations', stats.blueMutations || 0);
                break;
            case 'engineer':
                this.updateElement('engineerBattles', stats.battles);
                this.updateElement('engineerEvaluations', stats.evaluations);
                // RED QUEEN: Update team win statistics
                this.updateElement('engineerRedWins', stats.redWins || 0);
                this.updateElement('engineerBlueWins', stats.blueWins || 0);
                break;
            case 'analyst':
                this.updateElement('analystInsights', stats.insights);
                this.updateElement('analystDiscoveries', stats.discoveries);
                // RED QUEEN: Update team-specific analysis
                this.updateElement('analystRedInsights', stats.redInsights || 0);
                this.updateElement('analystBlueInsights', stats.blueInsights || 0);
                break;
            case 'cognition':
                this.updateElement('cognitionTactics', stats.tactics);
                this.updateElement('cognitionQueries', stats.queries);
                // RED QUEEN: Update team-specific tactics
                this.updateElement('cognitionRedTactics', stats.redTactics || 0);
                this.updateElement('cognitionBlueTactics', stats.blueTactics || 0);
                break;
        }
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    updateArchitectureEvolution() {
        // Update architecture evolution panel with team-specific stats
        this.updateElement('redAdaptations', this.moduleStats.redAdaptations || 0);
        this.updateElement('blueAdaptations', this.moduleStats.blueAdaptations || 0);
    }
    
    startVisualizationLoop() {
        // Update display every 500ms
        setInterval(() => {
            this.updateDisplay();
        }, 500);
        
        // Initial display update
        this.updateDisplay();
    }
    
    // Public methods for triggering events
    triggerEvent(module, action, data = {}) {
        window.dispatchEvent(new CustomEvent('asi-arch-event', {
            detail: { module, action, data }
        }));
    }
    
    // Get module statistics for external use
    getModuleStats() {
        return { ...this.moduleStats };
    }
    
    // Get recent activity history
    getActivityHistory(count = 10) {
        return this.activityHistory.slice(-count);
    }
    
    // General event handling method for validation compatibility
    handleEvent(eventType, eventData) {
        // Delegate to specific module handlers
        if (eventData && eventData.module) {
            this.handleModuleEvent(eventData);
        }
    }
}

// Global instance
let asiArchVisualizer;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    asiArchVisualizer = new ASIArchVisualizer();
    window.asiArchVisualizer = asiArchVisualizer;
});

// Helper function to emit ASI-ARCH events
window.emitASIArchEvent = function(module, action, data = {}) {
    if (window.asiArchVisualizer) {
        window.asiArchVisualizer.triggerEvent(module, action, data);
    }
};
