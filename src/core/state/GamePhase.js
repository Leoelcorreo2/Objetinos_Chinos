/**
 * GamePhase - Estados formales del juego.
 * 
 * Según Modelo de Datos Definitivo §88:
 * - Máquina de estados explícita
 * - No usar booleanos independientes
 */
export const GamePhase = {
  BOOT: 'BOOT',
  MENU: 'MENU',
  LOADING_LEVEL: 'LOADING_LEVEL',
  READY: 'READY',
  DRAGGING: 'DRAGGING',
  RESOLVING: 'RESOLVING',
  BLOCKED: 'BLOCKED',
  PAUSED: 'PAUSED',
  VICTORY: 'VICTORY',
  TIME_OUT: 'TIME_OUT',
  LIFE_LOST: 'LIFE_LOST',
  GAME_OVER: 'GAME_OVER'
};

/**
 * Verifica si el input está bloqueado en una fase dada
 */
export function isInputLocked(phase) {
  return phase === GamePhase.RESOLVING 
    || phase === GamePhase.DRAGGING
    || phase === GamePhase.VICTORY
    || phase === GamePhase.BLOCKED
    || phase === GamePhase.GAME_OVER;
}