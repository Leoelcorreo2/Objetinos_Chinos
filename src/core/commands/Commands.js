/**
 * Commands - Tipos de comandos que representan acciones solicitadas.
 * 
 * Según Plan de Implementación §5.4:
 * - Un comando expresa una intención
 * - No ejecuta por sí mismo la acción
 */
export const CommandType = {
  MOVE_OBJECT: 'MOVE_OBJECT',
  USE_POWERUP: 'USE_POWERUP',
  PAUSE_GAME: 'PAUSE_GAME',
  CONTINUE_LEVEL: 'CONTINUE_LEVEL',
  EXIT_TO_MENU: 'EXIT_TO_MENU',
  RETRY_LEVEL: 'RETRY_LEVEL'
};

/**
 * Crea un comando de movimiento de objeto
 */
export function createMoveObjectCommand(objectId, destinationSlotId) {
  return {
    type: CommandType.MOVE_OBJECT,
    payload: {
      objectId,
      destinationSlotId
    }
  };
}

/**
 * Crea un comando de uso de power-up
 */
export function createUsePowerUpCommand(powerUpType, targetId) {
  return {
    type: CommandType.USE_POWERUP,
    payload: {
      powerUpType,
      targetId
    }
  };
}

/**
 * Crea un comando de pausa
 */
export function createPauseCommand() {
  return {
    type: CommandType.PAUSE_GAME,
    payload: {}
  };
}

/**
 * Crea un comando de continuar nivel
 */
export function createContinueLevelCommand() {
  return {
    type: CommandType.CONTINUE_LEVEL,
    payload: {}
  };
}

/**
 * Crea un comando de salir al menú
 */
export function createExitToMenuCommand() {
  return {
    type: CommandType.EXIT_TO_MENU,
    payload: {}
  };
}

/**
 * Crea un comando de reintentar nivel
 */
export function createRetryLevelCommand() {
  return {
    type: CommandType.RETRY_LEVEL,
    payload: {}
  };
}