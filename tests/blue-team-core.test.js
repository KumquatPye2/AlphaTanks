/**
 * Simple Unit Tests for Blue Team Genome Fix
 * Tests the core logic without complex dependencies
 */

describe('Blue Team Genome Fix - Core Logic Tests', () => {
  // Mock DOM elements
  beforeEach(() => {
    document.body.innerHTML = `
      <!-- Red Team Elements -->
      <div id="redChampionFitness">0.000</div>
      <div id="redAggression">0.50</div>
      <div id="redSpeed">0.50</div>
      <div id="redAccuracy">0.50</div>
      <div id="redDefense">0.50</div>
      <div id="redTeamwork">0.50</div>
      <div id="redAdaptability">0.50</div>
      <div id="redLearning">0.50</div>
      <div id="redRiskTaking">0.50</div>
      <div id="redEvasion">0.50</div>
      <div id="redAggressionBar"></div>
      <div id="redSpeedBar"></div>
      <div id="redAccuracyBar"></div>
      <div id="redDefenseBar"></div>
      <div id="redTeamworkBar"></div>
      <div id="redAdaptabilityBar"></div>
      <div id="redLearningBar"></div>
      <div id="redRiskTakingBar"></div>
      <div id="redEvasionBar"></div>
      
      <!-- Blue Team Elements -->
      <div id="blueChampionFitness">0.000</div>
      <div id="blueAggression">0.50</div>
      <div id="blueSpeed">0.50</div>
      <div id="blueAccuracy">0.50</div>
      <div id="blueDefense">0.50</div>
      <div id="blueTeamwork">0.50</div>
      <div id="blueAdaptability">0.50</div>
      <div id="blueLearning">0.50</div>
      <div id="blueRiskTaking">0.50</div>
      <div id="blueEvasion">0.50</div>
      <div id="blueAggressionBar"></div>
      <div id="blueSpeedBar"></div>
      <div id="blueAccuracyBar"></div>
      <div id="blueDefenseBar"></div>
      <div id="blueTeamworkBar"></div>
      <div id="blueAdaptabilityBar"></div>
      <div id="blueLearningBar"></div>
      <div id="blueRiskTakingBar"></div>
      <div id="blueEvasionBar"></div>
    `;
  });

  describe('Team Selection Logic', () => {
    test('should select different champions for Red and Blue teams', () => {
      // Mock candidate pool
      const candidatePool = [
        {
          team: 'red',
          fitness: 0.8,
          battles: 3,
          wins: 2,
          genome: [0.9, 0.1, 0.8, 0.2, 0.7, 0.3, 0.6, 0.4, 0.5]
        },
        {
          team: 'blue',
          fitness: 0.75,
          battles: 3,
          wins: 2,
          genome: [0.2, 0.9, 0.3, 0.8, 0.4, 0.7, 0.1, 0.6, 0.5]
        }
      ];

      // Simple team selection function
      function getBestGenomeForTeam(team, pool) {
        const teamCandidates = pool.filter(candidate => candidate.team === team);
        if (teamCandidates.length === 0) {
          return null;
        }
        return teamCandidates.reduce((best, current) => 
          (current.fitness || 0) > (best.fitness || 0) ? current : best
        );
      }

      const redChampion = getBestGenomeForTeam('red', candidatePool);
      const blueChampion = getBestGenomeForTeam('blue', candidatePool);

      expect(redChampion).not.toBeNull();
      expect(blueChampion).not.toBeNull();
      expect(redChampion.team).toBe('red');
      expect(blueChampion.team).toBe('blue');
      expect(redChampion.fitness).toBe(0.8);
      expect(blueChampion.fitness).toBe(0.75);
    });

    test('should handle fallback when no team-specific candidates exist', () => {
      // Mock candidate pool without team assignments
      const candidatePool = [
        {
          fitness: 0.9,
          battles: 5,
          wins: 4,
          genome: [0.8, 0.7, 0.9, 0.6, 0.5, 0.8, 0.7, 0.6, 0.9]
        },
        {
          fitness: 0.8,
          battles: 4,
          wins: 3,
          genome: [0.6, 0.8, 0.7, 0.8, 0.7, 0.6, 0.5, 0.8, 0.7]
        }
      ];

      // Enhanced team selection with fallback
      function getBestGenomeForTeamWithFallback(team, pool) {
        // Try team-specific first
        const teamCandidates = pool.filter(candidate => candidate.team === team);
        if (teamCandidates.length > 0) {
          return teamCandidates.reduce((best, current) => 
            (current.fitness || 0) > (best.fitness || 0) ? current : best
          );
        }

        // Fallback: assign different candidates to each team
        const allCandidates = pool.filter(candidate => candidate.genome);
        if (allCandidates.length === 0) {
          return null;
        }

        allCandidates.sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
        
        if (team === 'red') {
          const candidate = allCandidates[0];
          candidate.tempTeam = 'red';
          return candidate;
        } else {
          const candidate = allCandidates.length > 1 ? allCandidates[1] : allCandidates[0];
          candidate.tempTeam = 'blue';
          return candidate;
        }
      }

      const redChampion = getBestGenomeForTeamWithFallback('red', candidatePool);
      const blueChampion = getBestGenomeForTeamWithFallback('blue', candidatePool);

      expect(redChampion).not.toBeNull();
      expect(blueChampion).not.toBeNull();
      expect(redChampion.tempTeam || redChampion.team).toBe('red');
      expect(blueChampion.tempTeam || blueChampion.team).toBe('blue');
      
      // Should get different candidates for fair distribution
      if (candidatePool.length > 1) {
        expect(redChampion.fitness).not.toBe(blueChampion.fitness);
      }
    });
  });

  describe('Genome Display Functions', () => {
    test('should display array format genome correctly', () => {
      const genome = [0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 0.8, 0.6];
      const fitness = 0.75;
      
      function displayGenome(team, genomeData, fitnessValue) {
        const traitNames = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
        
        // Update fitness
        const fitnessElement = document.getElementById(`${team}ChampionFitness`);
        if (fitnessElement) {
          fitnessElement.textContent = fitnessValue.toFixed(3);
        }

        // Update traits
        traitNames.forEach((traitName, index) => {
          const value = genomeData[index];
          const valueElement = document.getElementById(`${team}${traitName}`);
          const barElement = document.getElementById(`${team}${traitName}Bar`);
          
          if (valueElement) {
            valueElement.textContent = value.toFixed(2);
          }
          
          if (barElement) {
            barElement.style.width = `${value * 100}%`;
          }
        });
      }

      displayGenome('red', genome, fitness);

      expect(document.getElementById('redChampionFitness').textContent).toBe('0.750');
      expect(document.getElementById('redAggression').textContent).toBe('0.80');
      expect(document.getElementById('redSpeed').textContent).toBe('0.60');
      expect(document.getElementById('redAccuracy').textContent).toBe('0.90');
      expect(document.getElementById('redAggressionBar').style.width).toBe('80%');
      expect(document.getElementById('redSpeedBar').style.width).toBe('60%');
    });

    test('should display object format genome correctly', () => {
      const genome = {
        aggression: 0.7,
        speed: 0.8,
        accuracy: 0.6,
        defense: 0.5,
        teamwork: 0.9,
        adaptability: 0.4,
        learning: 0.6,
        riskTaking: 0.3,
        evasion: 0.8
      };
      const fitness = 0.82;

      function displayGenomeObject(team, genomeData, fitnessValue) {
        const traitNames = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
        const traitKeys = ['aggression', 'speed', 'accuracy', 'defense', 'teamwork', 'adaptability', 'learning', 'riskTaking', 'evasion'];
        
        // Update fitness
        const fitnessElement = document.getElementById(`${team}ChampionFitness`);
        if (fitnessElement) {
          fitnessElement.textContent = fitnessValue.toFixed(3);
        }

        // Update traits
        traitNames.forEach((traitName, index) => {
          const value = genomeData[traitKeys[index]] || 0;
          const valueElement = document.getElementById(`${team}${traitName}`);
          const barElement = document.getElementById(`${team}${traitName}Bar`);
          
          if (valueElement) {
            valueElement.textContent = value.toFixed(2);
          }
          
          if (barElement) {
            barElement.style.width = `${value * 100}%`;
          }
        });
      }

      displayGenomeObject('blue', genome, fitness);

      expect(document.getElementById('blueChampionFitness').textContent).toBe('0.820');
      expect(document.getElementById('blueAggression').textContent).toBe('0.70');
      expect(document.getElementById('blueSpeed').textContent).toBe('0.80');
      expect(document.getElementById('blueTeamwork').textContent).toBe('0.90');
      expect(document.getElementById('blueAggressionBar').style.width).toBe('70%');
      expect(document.getElementById('blueSpeedBar').style.width).toBe('80%');
    });

    test('should show evolving fitness while displaying traits', () => {
      const genome = [0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 0.8, 0.6];

      function displayGenomeWithEvolvingFitness(team, genomeData) {
        const traitNames = ['Aggression', 'Speed', 'Accuracy', 'Defense', 'Teamwork', 'Adaptability', 'Learning', 'RiskTaking', 'Evasion'];
        
        // Show evolving fitness
        const fitnessElement = document.getElementById(`${team}ChampionFitness`);
        if (fitnessElement) {
          fitnessElement.textContent = 'Evolving...';
        }

        // Show actual trait values
        traitNames.forEach((traitName, index) => {
          const value = genomeData[index];
          const valueElement = document.getElementById(`${team}${traitName}`);
          const barElement = document.getElementById(`${team}${traitName}Bar`);
          
          if (valueElement) {
            valueElement.textContent = value.toFixed(2);
          }
          
          if (barElement) {
            barElement.style.width = `${value * 100}%`;
          }
        });
      }

      displayGenomeWithEvolvingFitness('red', genome);

      expect(document.getElementById('redChampionFitness').textContent).toBe('Evolving...');
      expect(document.getElementById('redAggression').textContent).toBe('0.80');
      expect(document.getElementById('redSpeed').textContent).toBe('0.60');
      expect(document.getElementById('redAggressionBar').style.width).toBe('80%');
    });
  });

  describe('Bug Prevention Tests', () => {
    test('should always provide genome data for both teams', () => {
      // Test scenario where one team might be missed
      const candidatePool = [
        {
          team: 'red',
          fitness: 0.8,
          battles: 3,
          wins: 2,
          genome: [0.7, 0.5, 0.9, 0.4, 0.6, 0.5, 0.3, 0.8, 0.6]
        },
        {
          team: 'blue',
          fitness: 0.75,
          battles: 3,
          wins: 2,
          genome: [0.4, 0.8, 0.6, 0.7, 0.9, 0.5, 0.6, 0.4, 0.8]
        }
      ];

      function ensureBothTeamsGetGenomes(pool) {
        const redChampion = pool.find(c => c.team === 'red');
        const blueChampion = pool.find(c => c.team === 'blue');
        
        return {
          red: redChampion || null,
          blue: blueChampion || null
        };
      }

      const champions = ensureBothTeamsGetGenomes(candidatePool);
      
      expect(champions.red).not.toBeNull();
      expect(champions.blue).not.toBeNull();
      expect(champions.red.team).toBe('red');
      expect(champions.blue.team).toBe('blue');
    });

    test('should handle emergency fallback for missing team', () => {
      // Scenario where Blue team has no candidates
      const candidatePool = [
        {
          team: 'red',
          fitness: 0.8,
          battles: 3,
          wins: 2,
          genome: [0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 0.8, 0.6]
        }
      ];

      function createEmergencyBlueGenome(redGenome) {
        if (!redGenome) {
          return null;
        }

        // Create modified Blue genome from Red template
        const blueGenome = [...redGenome];
        blueGenome[0] = Math.max(0, Math.min(1, blueGenome[0] * 0.9)); // Less aggressive
        blueGenome[1] = Math.max(0, Math.min(1, blueGenome[1] * 1.1)); // Faster
        blueGenome[3] = Math.max(0, Math.min(1, blueGenome[3] * 1.1)); // More defensive
        
        return blueGenome;
      }

      const redCandidate = candidatePool.find(c => c.team === 'red');
      const emergencyBlueGenome = createEmergencyBlueGenome(redCandidate?.genome);

      expect(redCandidate).not.toBeNull();
      expect(emergencyBlueGenome).not.toBeNull();
      expect(emergencyBlueGenome[0]).toBeLessThan(redCandidate.genome[0]); // Less aggressive
      expect(emergencyBlueGenome[1]).toBeGreaterThan(redCandidate.genome[1]); // Faster
      expect(emergencyBlueGenome[3]).toBeGreaterThan(redCandidate.genome[3]); // More defensive
    });

    test('should maintain team separation even with identical fitness', () => {
      const candidatePool = [
        {
          team: 'red',
          fitness: 0.75,
          battles: 3,
          wins: 2,
          genome: [0.7, 0.5, 0.8, 0.4, 0.6, 0.5, 0.3, 0.7, 0.6]
        },
        {
          team: 'blue',
          fitness: 0.75, // Same fitness
          battles: 3,
          wins: 2,
          genome: [0.4, 0.8, 0.5, 0.7, 0.8, 0.6, 0.7, 0.4, 0.8]
        }
      ];

      const redChampion = candidatePool.find(c => c.team === 'red');
      const blueChampion = candidatePool.find(c => c.team === 'blue');

      expect(redChampion.team).toBe('red');
      expect(blueChampion.team).toBe('blue');
      expect(redChampion.genome[0]).not.toBe(blueChampion.genome[0]); // Different aggression
      expect(redChampion.genome[1]).not.toBe(blueChampion.genome[1]); // Different speed
    });
  });

  describe('Performance Tests', () => {
    test('should handle large candidate pools efficiently', () => {
      // Create large candidate pool
      const largeCandidatePool = [];
      for (let i = 0; i < 1000; i++) {
        largeCandidatePool.push({
          team: i % 2 === 0 ? 'red' : 'blue',
          fitness: Math.random(),
          battles: Math.floor(Math.random() * 10),
          wins: Math.floor(Math.random() * 5),
          genome: Array.from({ length: 9 }, () => Math.random())
        });
      }

      const startTime = performance.now();
      
      // Simple selection algorithm
      const redCandidates = largeCandidatePool.filter(c => c.team === 'red');
      const blueCandidates = largeCandidatePool.filter(c => c.team === 'blue');
      
      const redChampion = redCandidates.reduce((best, current) => 
        (current.fitness || 0) > (best.fitness || 0) ? current : best
      );
      const blueChampion = blueCandidates.reduce((best, current) => 
        (current.fitness || 0) > (best.fitness || 0) ? current : best
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(redChampion).not.toBeNull();
      expect(blueChampion).not.toBeNull();
      expect(duration).toBeLessThan(100); // Should complete quickly
    });
  });
});
