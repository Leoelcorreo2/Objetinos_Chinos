/**
 * SolutionSimulator - Ejecuta movimientos sobre un estado aislado.
 * 
 * Según Plan de Implementación §14.1:
 * - NUNCA modifica el nivel real del jugador
 * - Debe reproducir las mismas reglas del juego
 * - Utiliza las reglas fundamentales ya implementadas
 * 
 * Según Modelo de Datos §66-67:
 * - Considera: objetos movibles, huecos TOP válidos, restricciones,
 *   formación de tríos, avance de capas, colapsos, victoria, bloqueo
 * 
 * Según Plan §2.6:
 * - Una única lógica para juego y simulación
 * - No se crea una versión simplificada de las reglas
 * 
 * IMPLEMENTACIÓN: Búsqueda en anchura (BFS) para encontrar la solución óptima
 */
import { SimulationState } from '../state/SimulationState.js';
import { LogicalStateHash } from '../hash/LogicalStateHash.js';
import { Solution } from './Solution.js';
import { MovementRules } from '../../rules/MovementRules.js';
import { TrioRules } from '../../rules/TrioRules.js';
import { LayerRules } from '../../rules/LayerRules.js';
import { CollapseRules } from '../../rules/CollapseRules.js';
import { VictoryRules } from '../../rules/VictoryRules.js';
import { BlockDetectionRules } from '../../rules/BlockDetectionRules.js';
import { getEmptyTopSlots, getTopObjects } from '../../core/queries/StateQueries.js';

export class SolutionSimulator {
  /**
   * @param {Object} options
   * @param {number} options.maxMoves - Límite de movimientos por solución
   * @param {number} options.maxStates - Límite de estados explorados
   */
  constructor(options = {}) {
    this.maxMoves = options.maxMoves || 100;
    this.maxStates = options.maxStates || 10000;
  }

  /**
   * Intenta resolver el nivel desde el estado inicial usando BFS
   * @param {LevelState} levelState - Estado inicial del nivel
   * @returns {Solution|null} Solución encontrada o null si no es resoluble
   */
  solve(levelState) {
    const initialState = new SimulationState(levelState);
    const initialHash = LogicalStateHash.compute(initialState);
    
    const visited = new Set();
    visited.add(initialHash);
    
    // Cola BFS: cada elemento es { state, solution }
    const queue = [{ state: initialState, solution: new Solution() }];
    let statesExplored = 0;
    
    while (queue.length > 0) {
      if (statesExplored >= this.maxStates) {
        console.warn('SolutionSimulator: límite de estados alcanzado');
        return null;
      }
      
      const { state, solution } = queue.shift();
      statesExplored++;
      
      // Verificar victoria
      if (VictoryRules.isVictory(state)) {
        return solution;
      }
      
      // Verificar bloqueo
      if (BlockDetectionRules.isBlocked(state)) {
        continue; // Este camino está bloqueado, probar otros
      }
      
      // Verificar límite de movimientos
      if (solution.moves.length >= this.maxMoves) {
        continue;
      }
      
      // Generar todos los movimientos posibles desde este estado
      const moves = this._getAllValidMoves(state);
      
      for (const move of moves) {
        // Ejecutar el movimiento en un nuevo estado clonado
        const result = this._executeMove(state, move);
        if (!result.success) continue;
        
        // Calcular hash del nuevo estado
        const newHash = LogicalStateHash.compute(result.newState);
        
        // Si ya visitamos este estado, saltar
        if (visited.has(newHash)) continue;
        visited.add(newHash);
        
        // Crear nueva solución con este movimiento añadido
        const newSolution = new Solution();
        newSolution.moves = [...solution.moves];
        newSolution.metrics = { ...solution.metrics };
        newSolution.addMove(move.objectId, move.sourceSlotId, move.destinationSlotId);
        if (result.trioFormed) newSolution.recordTrio();
        if (result.layersAdvanced > 0) newSolution.recordLayerAdvance();
        if (result.shelvesCollapsed > 0) newSolution.recordShelfCollapse();
        
        // Verificar victoria inmediata
        if (VictoryRules.isVictory(result.newState)) {
          return newSolution;
        }
        
        // Añadir a la cola para explorar
        queue.push({ state: result.newState, solution: newSolution });
      }
    }
    
    console.warn('SolutionSimulator: no se encontró solución');
    return null;
  }

  /**
   * Obtiene todos los movimientos válidos desde un estado
   */
  _getAllValidMoves(state) {
    const moves = [];
    const emptySlots = getEmptyTopSlots(state.board);
    const topObjects = getTopObjects(state.board, state.dynamicState);
    
    for (const movable of topObjects) {
      if (movable.obj.blocked) continue;
      
      for (const empty of emptySlots) {
        if (movable.slot.id === empty.slot.id) continue;
        
        const check = MovementRules.canMove(state, movable.obj.id, empty.slot.id);
        if (check.valid) {
          moves.push({
            objectId: movable.obj.id,
            sourceSlotId: movable.slot.id,
            destinationSlotId: empty.slot.id
          });
        }
      }
    }
    
    return moves;
  }

  /**
   * Ejecuta un movimiento y devuelve el nuevo estado
   */
  _executeMove(state, move) {
    // Clonar estado para no modificar el original
    const newState = new SimulationState({
      board: state.board,
      dynamicState: state.dynamicState
    });
    
    // 1. Ejecutar movimiento
    const check = MovementRules.canMove(state, move.objectId, move.destinationSlotId);
    if (!check.valid) {
      return { success: false, reason: check.reason };
    }
    
    check.origin.slot.clear();
    check.destination.slot.setObject(move.objectId);
    
    let trioFormed = false;
    let layersAdvanced = 0;
    let shelvesCollapsed = 0;
    
    // 2. Comprobar trío en destino
    const trio = TrioRules.detectTrio(check.destination.shelf, check.destination.layer, newState.dynamicState);
    if (trio) {
      for (const obj of trio) {
        newState.dynamicState.remove(obj.id);
      }
      for (const slot of check.destination.layer.slots) {
        slot.clear();
      }
      trioFormed = true;
    }
    
    // 3. Avance de capas
    for (const structure of newState.board.structures) {
      for (const shelf of structure.shelves) {
        if (LayerRules.shouldAdvanceLayer(shelf)) {
          LayerRules.advanceLayers(shelf);
          layersAdvanced++;
        }
      }
    }
    
    // 4. Colapsos
    for (const structure of newState.board.structures) {
      for (const shelf of structure.shelves) {
        if (CollapseRules.shouldCollapse(shelf)) {
          shelf.collapse();
          shelvesCollapsed++;
        }
      }
    }
    
    return {
      success: true,
      newState,
      trioFormed,
      layersAdvanced,
      shelvesCollapsed
    };
  }

  /**
   * Verifica si un nivel es resoluble (sin devolver la solución completa)
   */
  isSolvable(levelState) {
    const solution = this.solve(levelState);
    return solution !== null;
  }
}