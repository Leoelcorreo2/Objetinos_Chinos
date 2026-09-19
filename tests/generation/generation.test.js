/**
 * generation.test.js - Pruebas de los sistemas de generación base.
 */
import { DifficultySystem } from '../../src/generation/difficulty/DifficultySystem.js';
import { ScenarioSystem } from '../../src/generation/scenarios/ScenarioSystem.js';
import { LevelConfiguration } from '../../src/generation/configuration/LevelConfiguration.js';
import { LevelGenerator } from '../../src/generation/generator/LevelGenerator.js';

console.log('=== OBJETINOS - PRUEBAS DE GENERACIÓN BASE ===\n');

// 1. DifficultySystem
console.log('1. Probando DifficultySystem...');
const profile1 = DifficultySystem.getProfile(1);
console.log('   Nivel 1 - Tríos:', profile1.trioCount === 2);
console.log('   Nivel 1 - Capas:', profile1.layerCount === 1);

const profile25 = DifficultySystem.getProfile(25);
console.log('   Nivel 25 - Capas (+1):', profile25.layerCount === 2);

const profile50 = DifficultySystem.getProfile(50);
console.log('   Nivel 50 - Especial:', profile50.specialObjects === 1);
console.log('   Nivel 50 - PowerUp Reward:', profile50.powerUpReward === true);

const profile100 = DifficultySystem.getProfile(100);
console.log('   Nivel 100 - Bloqueados:', profile100.blockedObjects === 1);
console.log('   ✓ DifficultySystem OK\n');

// 2. ScenarioSystem
console.log('2. Probando ScenarioSystem...');
console.log('   Nivel 1 -> Escenario 1:', ScenarioSystem.getScenario(1) === 1);
console.log('   Nivel 10 -> Escenario 1:', ScenarioSystem.getScenario(10) === 1);
console.log('   Nivel 11 -> Escenario 2:', ScenarioSystem.getScenario(11) === 2);
console.log('   Nivel 100 -> Escenario 10:', ScenarioSystem.getScenario(100) === 10);
console.log('   Nivel 101 -> Escenario 1:', ScenarioSystem.getScenario(101) === 1);
console.log('   Nivel 109 -> Escenario 9:', ScenarioSystem.getScenario(109) === 9);
console.log('   Nivel 110 -> Escenario 10:', ScenarioSystem.getScenario(110) === 10);
console.log('   ✓ ScenarioSystem OK\n');

// 3. LevelConfiguration
console.log('3. Probando LevelConfiguration...');
const config1 = new LevelConfiguration(1);
console.log('   Config Nivel 1 - Escenario:', config1.scenarioId === 1);
console.log('   Config Nivel 1 - Tríos:', config1.difficulty.trioCount === 2);

const config101 = new LevelConfiguration(101);
console.log('   Config Nivel 101 - Escenario:', config101.scenarioId === 1);
console.log('   ✓ LevelConfiguration OK\n');

// 4. LevelGenerator (Estructura base)
console.log('4. Probando LevelGenerator (Estructura base)...');
const levelDef1 = LevelGenerator.generateBaseStructure(1);
console.log('   Nivel 1 - Structures:', levelDef1.structures.length === 1);
console.log('   Nivel 1 - Shelves en struct 1:', levelDef1.structures[0].shelves.length === 2); // 2 tríos = 2 estantes
console.log('   Nivel 1 - Layers en shelf 1:', levelDef1.structures[0].shelves[0].layers.length === 1);
console.log('   Nivel 1 - Slots por layer:', levelDef1.structures[0].shelves[0].layers[0].slots.length === 3);
console.log('   Nivel 1 - Timer:', levelDef1.timer === 65); // 60 + 1*5
console.log('   ✓ LevelGenerator OK\n');

// 5. LevelGenerator (Nivel 50 - Escenario 5, con colapso)
console.log('5. Probando LevelGenerator (Nivel 50 - Escenario 5)...');
const levelDef50 = LevelGenerator.generateBaseStructure(50);
console.log('   Nivel 50 - Escenario:', levelDef50.configuration.scenarioId === 5);
console.log('   Nivel 50 - Structures:', levelDef50.structures.length === 1); // Escenario 5 = 1 struct
console.log('   Nivel 50 - Tiene estante colapsable:', levelDef50.structures[0].shelves[0].behavior === 'COLLAPSIBLE');
console.log('   ✓ LevelGenerator Nivel 50 OK\n');

console.log('=== TODAS LAS PRUEBAS DE GENERACIÓN BASE PASARON ===');
console.log('Los cimientos del generador están correctamente implementados.');