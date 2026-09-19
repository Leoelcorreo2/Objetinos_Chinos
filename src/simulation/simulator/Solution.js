/**
 * Solution - Representa una secuencia de movimientos válida.
 * 
 * Según Modelo de Datos §64:
 * - SolutionGenerator genera soluciones válidas
 * - Las soluciones utilizan referencias lógicas (no coordenadas)
 * 
 * Según Plan de Implementación §13.4:
 * - objectId, sourceSlot, destinationSlot
 */
export class Solution {
  constructor() {
    this.moves = [];
    this.metrics = {
      totalMoves: 0,
      triosCompleted: 0,
      layersAdvanced: 0,
      shelvesCollapsed: 0
    };
  }

  /**
   * Añade un movimiento a la solución
   */
  addMove(objectId, sourceSlotId, destinationSlotId) {
    this.moves.push({
      objectId,
      sourceSlotId,
      destinationSlotId
    });
    this.metrics.totalMoves++;
  }

  /**
   * Registra un trío completado
   */
  recordTrio() {
    this.metrics.triosCompleted++;
  }

  /**
   * Registra un avance de capa
   */
  recordLayerAdvance() {
    this.metrics.layersAdvanced++;
  }

  /**
   * Registra un colapso de estante
   */
  recordShelfCollapse() {
    this.metrics.shelvesCollapsed++;
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      moves: this.moves,
      metrics: this.metrics
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    const solution = new Solution();
    solution.moves = data.moves;
    solution.metrics = data.metrics;
    return solution;
  }
}