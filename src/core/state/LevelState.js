/**
 * LevelState - Estado vivo del nivel actualmente jugado.
 * 
 * Según Modelo de Datos Definitivo §45-46:
 * - Separado de GameState (vidas, monedas, etc.)
 * - Contiene tablero, objetos, tiempo
 * - Se reconstruye desde LevelDefinition al reiniciar
 */
export class LevelState {
  /**
   * @param {number} levelNumber - Número de nivel
   * @param {Board} board - Tablero del nivel
   * @param {DynamicState} dynamicState - Objetos dinámicos
   */
  constructor(levelNumber, board, dynamicState) {
    this.levelNumber = levelNumber;
    this.board = board;
    this.dynamicState = dynamicState;
    this.timer = 0;
    this.configuration = null;
  }

  /**
   * Obtiene el número de objetos restantes
   */
  getRemainingObjects() {
    return this.dynamicState.count();
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      levelNumber: this.levelNumber,
      timer: this.timer,
      configuration: this.configuration,
      board: this.board.toJSON(),
      dynamicState: this.dynamicState.toJSON()
    };
  }

  /**
   * Reconstrucción
   */
  static fromJSON(data) {
    const board = Board.fromJSON(data.board);
    const dynamicState = DynamicState.fromJSON(data.dynamicState);
    const level = new LevelState(data.levelNumber, board, dynamicState);
    level.timer = data.timer;
    level.configuration = data.configuration;
    return level;
  }
}