/**
 * GameController - Coordinador central del juego.
 * Según Plan de Implementación §10, §95
 */
import { GamePhase } from '../core/state/GamePhase.js';
import { CommandType } from '../core/commands/Commands.js';
import { EventType, EventBus } from '../core/events/Events.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { TrioSystem } from '../systems/TrioSystem.js';
import { LayerSystem } from '../systems/LayerSystem.js';
import { CollapseSystem } from '../systems/CollapseSystem.js';
import { VictorySystem } from '../systems/VictorySystem.js';
import { BlockDetectionSystem } from '../systems/BlockDetectionSystem.js';
import { TimerSystem } from '../systems/TimerSystem.js';
import { PowerUpSystem } from '../systems/powerups/PowerUpSystem.js';
import { LevelBuilder } from '../core/definition/LevelBuilder.js';
import { LevelDefinition } from '../core/definition/LevelDefinition.js';
import { SaveSystem } from '../persistence/SaveSystem.js';
import { GameState } from './GameState.js';

export class GameController {
  constructor(gameState, levelState, eventBus = new EventBus()) {
    this.gameState = gameState;
    this.levelState = levelState;
    this.eventBus = eventBus;
    this.levelDefinition = null;
    this.saveSystem = new SaveSystem();
    this._resolving = false;

    // Inicialización de sistemas
    this.movementSystem = new MovementSystem(eventBus);
    this.trioSystem = new TrioSystem(eventBus);
    this.layerSystem = new LayerSystem(eventBus);
    this.collapseSystem = new CollapseSystem(eventBus);
    this.victorySystem = new VictorySystem(eventBus);
    this.blockSystem = new BlockDetectionSystem(eventBus);
    this.timerSystem = new TimerSystem(eventBus, gameState);
    this.powerUpSystem = new PowerUpSystem(eventBus);

    // Suscribirse a eventos globales
    this.eventBus.on(EventType.TIME_EXPIRED, () => this.handleTimeExpired());
  }

  loadLevelFromDefinition(definition) {
    console.log('🏗️ [GameController] loadLevelFromDefinition:', definition.levelNumber);
    console.log('   definition.timer:', definition.timer);
    
    this.levelDefinition = definition;
    this.levelState = LevelBuilder.build(definition);
    
    console.log('   levelState.timer después de build:', this.levelState.timer);
    
    this.loadLevel(this.levelState);
  }

  retryLevel() {
    if (!this.levelDefinition) {
      console.error('❌ [GameController] No hay definición de nivel para reiniciar');
      return false;
    }
    this.loadLevelFromDefinition(this.levelDefinition);
    return true;
  }

  handleCommand(command) {
    console.log('🎮 [GameController] handleCommand:', command.type);
    switch (command.type) {
      case CommandType.MOVE_OBJECT:
        return this._handleMoveObject(command.payload);
      case CommandType.USE_POWERUP:
        return this._handleUsePowerUp(command.payload);
      default:
        console.warn('⚠️ [GameController] Comando desconocido:', command.type);
        return { handled: false, reason: 'UNKNOWN_COMMAND' };
    }
  }

  _handleMoveObject({ objectId, destinationSlotId }) {
    console.log('⚙️ [GameController] _handleMoveObject iniciado:', objectId, '->', destinationSlotId);
    console.log('   _resolving:', this._resolving, '| gamePhase:', this.gameState.gamePhase);

    if (this._resolving) {
      console.log('❌ [GameController] Rechazado: INPUT_LOCKED');
      return { handled: false, reason: 'INPUT_LOCKED' };
    }
    if (this.gameState.gamePhase !== GamePhase.READY) {
      console.log('❌ [GameController] Rechazado: WRONG_PHASE', this.gameState.gamePhase);
      return { handled: false, reason: 'WRONG_PHASE' };
    }

    this._resolving = true;
    this.gameState.setPhase(GamePhase.RESOLVING);
    console.log('🔒 [GameController] Emitiendo INPUT_LOCKED');
    this.eventBus.emit(EventType.INPUT_LOCKED, {});

    try {
      console.log('🔄 [GameController] Llamando a movementSystem.execute...');
      const moveResult = this.movementSystem.execute(this.levelState, objectId, destinationSlotId);
      console.log('📝 [GameController] Resultado de movementSystem:', moveResult);

      if (!moveResult.success) {
        console.log('❌ [GameController] Movimiento fallido:', moveResult.reason);
        this._finishResolve();
        return { handled: false, reason: moveResult.reason };
      }

      // Ejecutar consecuencias del movimiento
      this.trioSystem.check(this.levelState, moveResult.destination.shelf.id, moveResult.destination.layer.id);
      this.layerSystem.checkAndAdvance(this.levelState);
      this.collapseSystem.check(this.levelState);
      
      // Guardar progreso
      this.saveSystem.autoSave(this.gameState, this.levelDefinition, this.levelState.timer);

      // Comprobar condiciones de fin
      if (this.victorySystem.check(this.levelState)) {
        this.gameState.setPhase(GamePhase.VICTORY);
        this.timerSystem.stop();
        this._finishResolve();
        return { handled: true, victory: true };
      }

      if (this.blockSystem.check(this.levelState)) {
        this.gameState.setPhase(GamePhase.BLOCKED);
        this.timerSystem.stop();
        this._finishResolve();
        return { handled: true, blocked: true };
      }

      this._finishResolve();
      return { handled: true, success: true };

    } catch (error) {
      console.error('💥 [GameController] Error durante resolución:', error);
      this._finishResolve();
      return { handled: false, reason: 'INTERNAL_ERROR' };
    }
  }

  _handleUsePowerUp({ powerUpType, targetObjectId }) {
    console.log('⚡ [GameController] _handleUsePowerUp:', powerUpType);
    if (this.gameState.gamePhase !== GamePhase.READY) {
      return { handled: false, reason: 'WRONG_PHASE' };
    }
    if (!this.gameState.powerUps[powerUpType] || this.gameState.powerUps[powerUpType] <= 0) {
      return { handled: false, reason: 'POWERUP_NOT_AVAILABLE' };
    }

    const result = this.powerUpSystem.usePowerUp(
      this.levelState, 
      powerUpType, 
      targetObjectId, 
      this.gameState.powerUps,
      () => this.timerSystem.pause(),
      () => this.timerSystem.resume()
    );

    if (result.success) {
      if (this.victorySystem.check(this.levelState)) {
        this.gameState.setPhase(GamePhase.VICTORY);
        this.timerSystem.stop();
      }
      return { handled: true, powerUpUsed: true };
    }
    return { handled: false, reason: result.reason };
  }

  _finishResolve() {
    console.log('🔓 [GameController] Finalizando resolución, emitiendo INPUT_UNLOCKED');
    this._resolving = false;
    this.gameState.setPhase(GamePhase.READY);
    this.eventBus.emit(EventType.INPUT_UNLOCKED, {});
  }

  loadLevel(levelState) {
    console.log('🔄 [GameController] loadLevel llamado');
    console.log('   levelState.timer:', levelState.timer);
    
    this.levelState = levelState;
    this.gameState.setPhase(GamePhase.READY);
    this._resolving = false;
    
    // CRÍTICO: Iniciar el timer con el tiempo correcto del nivel
    console.log('⏰ [GameController] Iniciando timer...');
    this.timerSystem.start(levelState);
    console.log('✅ [GameController] Timer iniciado, tiempo actual:', this.timerSystem.getCurrentTime());
  }

  handleTimeExpired() {
    console.log('⏰ [GameController] handleTimeExpired');
    this.gameState.loseLife();
    this.timerSystem.stop();
    if (this.gameState.lives <= 0) {
      this.gameState.setPhase(GamePhase.GAME_OVER);
    } else {
      this.gameState.setPhase(GamePhase.TIME_OUT);
    }
  }

  hasAutoSave() {
    return this.saveSystem.hasSave(0);
  }
  
  loadAutoSave() {
    const data = this.saveSystem.loadAutoSave();
    if (!data) {
      console.log('⚠️ [GameController] No hay autosave válido');
      return false;
    }
    
    this.gameState = GameState.fromJSON(data.gameState);
    if (data.levelDefinition) {
      this.levelDefinition = LevelDefinition.fromJSON(data.levelDefinition);
      this.loadLevelFromDefinition(this.levelDefinition);
      this.levelState.timer = data.remainingTime;
    }
    console.log('✅ [GameController] Autosave cargado correctamente');
    return true;
  }
}