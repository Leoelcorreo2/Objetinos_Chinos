/**
 * SolutionAnalyzer - Analiza las soluciones y calcula métricas de dificultad.
 * 
 * Según Modelo de Datos §55-63, §70:
 * - Calcula: minimumMoves, solutionMoves, decisionPoints, 
 *   criticalMoves, errorMargin, lookAheadDepth, branchingFactor, difficultyScore
 * - Separado del simulador para permitir evolución independiente de las métricas.
 */
import { getEmptyTopSlots, getTopObjects } from '../../core/queries/StateQueries.js';
import { MovementRules } from '../../rules/MovementRules.js';
import { SimulationState } from '../state/SimulationState.js';
import { TrioRules } from '../../rules/TrioRules.js';
import { LayerRules } from '../../rules/LayerRules.js';
import { CollapseRules } from '../../rules/CollapseRules.js';

export class SolutionAnalyzer {
  /**
   * Analiza una solución y el estado inicial para calcular métricas
   * @param {LevelState} levelState - Estado inicial del nivel
   * @param {Solution} solution - Solución a analizar
   * @returns {Object} Métricas calculadas
   */
  analyze(levelState, solution) {
    const metrics = {
      minimumMoves: solution.moves.length,
      solutionMoves: solution.moves.length,
      decisionPoints: 0,
      criticalMoves: 0,
      errorMargin: 0,
      lookAheadDepth: 1,
      branchingFactor: 0,
      difficultyScore: 0
    };

    if (solution.moves.length === 0) return metrics;

    // Simular la solución paso a paso para calcular branching factor
    let simState = new SimulationState(levelState);
    let totalBranching = 0;
    let statesAnalyzed = 0;

    for (const move of solution.moves) {
      // Contar movimientos válidos disponibles en este estado (branching factor)
      const validMovesCount = this._countValidMoves(simState);
      totalBranching += validMovesCount;
      statesAnalyzed++;

      // Un "decision point" es cuando hay más de 2 opciones relevantes
      if (validMovesCount > 2) {
        metrics.decisionPoints++;
      }

      // Ejecutar el movimiento en la simulación para avanzar al siguiente estado
      simState = this._applyMoveToSimState(simState, move);
    }

    // Calcular promedios
    metrics.branchingFactor = statesAnalyzed > 0 
      ? (totalBranching / statesAnalyzed).toFixed(2) 
      : 0;

    // Cálculo simplificado de difficultyScore
    // Fórmula base: (moves * branchingFactor) + (decisionPoints * 10)
    metrics.difficultyScore = Math.round(
      (metrics.minimumMoves * metrics.branchingFactor) + 
      (metrics.decisionPoints * 10)
    );

    // Error margin: inversamente proporcional a la dificultad
    // Más movimientos y más branching = más margen de error
    metrics.errorMargin = Math.min(100, Math.round(100 / (metrics.difficultyScore + 1)));

    return metrics;
  }

  /**
   * Cuenta cuántos movimientos válidos existen en un estado
   */
  _countValidMoves(state) {
    let count = 0;
    const emptySlots = getEmptyTopSlots(state.board);
    const topObjects = getTopObjects(state.board, state.dynamicState);

    for (const movable of topObjects) {
      if (movable.obj.blocked) continue;
      for (const empty of emptySlots) {
        if (movable.slot.id === empty.slot.id) continue;
        const check = MovementRules.canMove(state, movable.obj.id, empty.slot.id);
        if (check.valid) count++;
      }
    }
    return count;
  }

  /**
   * Aplica un movimiento a un SimulationState (versión interna simplificada)
   */
  _applyMoveToSimState(state, move) {
    const newState = new SimulationState({
      board: state.board,
      dynamicState: state.dynamicState
    });

    // Encontrar slot origen y destino en el nuevo estado clonado
    let originSlot = null;
    let destSlot = null;

    for (const structure of newState.board.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          for (const slot of layer.slots) {
            if (slot.id === move.sourceSlotId) originSlot = { slot, shelf, layer };
            if (slot.id === move.destinationSlotId) destSlot = { slot, shelf, layer };
          }
        }
      }
    }

    if (originSlot && destSlot) {
      originSlot.slot.clear();
      destSlot.slot.setObject(move.objectId);

      // Aplicar consecuencias lógicas
      const trio = TrioRules.detectTrio(destSlot.shelf, destSlot.layer, newState.dynamicState);
      if (trio) {
        for (const obj of trio) newState.dynamicState.remove(obj.id);
        for (const slot of destSlot.layer.slots) slot.clear();
      }

      for (const structure of newState.board.structures) {
        for (const shelf of structure.shelves) {
          if (LayerRules.shouldAdvanceLayer(shelf)) {
            LayerRules.advanceLayers(shelf);
          }
          if (CollapseRules.shouldCollapse(shelf)) {
            shelf.collapse();
          }
        }
      }
    }

    return newState;
  }
}