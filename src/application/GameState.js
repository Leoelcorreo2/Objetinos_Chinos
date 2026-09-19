/**
 * GameState - Estado persistente de la partida.
 * Según Modelo de Datos Definitivo §40-43
 */
import { GamePhase } from '../core/state/GamePhase.js';
import { PowerUpType } from '../core/model/PowerUp.js';

export class GameState {
  constructor() {
    this.currentLevel = 1;
    this.activeLevel = 1;
    this.lives = 5;
    this.coins = 0;
    this.powerUps = {
      [PowerUpType.HAMMER]: 2,
      [PowerUpType.ICE]: 1,
      [PowerUpType.TIME_BOOST]: 1,
      [PowerUpType.MAGIC_WAND]: 0,
      [PowerUpType.SHUFFLER]: 0
    };
    this.gamePhase = GamePhase.BOOT;
  }

  setPhase(newPhase) {
    this.gamePhase = newPhase;
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
  }

  restoreLives(maxLives = 5) {
    this.lives = maxLives;
  }

  getPowerUpCount(powerUpType) {
    return this.powerUps[powerUpType] || 0;
  }

  hasAnyPowerUp() {
    return Object.values(this.powerUps).some(count => count > 0);
  }

  toJSON() {
    return {
      currentLevel: this.currentLevel,
      activeLevel: this.activeLevel,
      lives: this.lives,
      coins: this.coins,
      powerUps: this.powerUps,
      gamePhase: this.gamePhase
    };
  }

  /**
   * Reconstrucción desde JSON con merge de power-ups
   * Si el autosave no tiene power-ups o está incompleto, se usan los valores por defecto
   */
  static fromJSON(data) {
    const state = new GameState();
    state.currentLevel = data.currentLevel || 1;
    state.activeLevel = data.activeLevel || 1;
    state.lives = data.lives ?? 5;
    state.coins = data.coins || 0;
    state.gamePhase = data.gamePhase || GamePhase.READY;
    
    // Merge de power-ups: usa los del autosave si existen, sino los por defecto
    if (data.powerUps && typeof data.powerUps === 'object') {
      state.powerUps = {
        ...state.powerUps, // Valores por defecto
        ...data.powerUps   // Sobrescribe con los del autosave
      };
    }
    
    return state;
  }
}