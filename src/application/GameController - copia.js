/**
 * GameController - Coordinador central del juego.
 * Integración completa con PowerUpSystem.
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
import { PowerUpType } from '../core/model/PowerUp.js';
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

    this.movementSystem = new MovementSystem(eventBus);
    this.trioSystem = new TrioSystem(eventBus);
    this.layerSystem = new LayerSystem(eventBus);
    this.collapseSystem = new CollapseSystem(eventBus);
    this.victorySystem = new VictorySystem(eventBus);
    this.blockSystem = new BlockDetectionSystem(eventBus);
    this.timerSystem = new TimerSystem(eventBus, gameState);
    this.powerUpSystem = new PowerUpSystem(eventBus);

    this._resolving = false;

    this.eventBus.on(EventType.TIME_EXPIRED, () => {
      this.handleTimeExpired();
    });
  }

  loadLevelFromDefinition(definition) {
    console.log(' loadLevelFromDefinition:', definition.levelNumber);
    this.levelDefinition = definition;
    const levelState = LevelBuilder.build(definition);
    console.log(' LevelState construido:', levelState);
    console.log('📦 Structures:', levelState.board.structures.length);
    this.loadLevel(levelState);
  }

  retryLevel() {
    if (!this.levelDefinition) {
      console.error('No hay definición de nivel almacenada para reiniciar');
      return false;
    }
    
    console.log('Reiniciando nivel desde definición:', this.levelDefinition.levelNumber);
    this.loadLevelFromDefinition(this.levelDefinition);
    return true;
  }

  handleCommand(command) {
    console.log('🎮 GameController.handleCommand:', command.type);
    
    switch (command.type) {
      case CommandType.MOVE_OBJECT:
        return this._handleMoveObject(command.payload);
      case CommandType.USE_POWERUP:
        return this._handleUsePowerUp(command.payload);
      case CommandType.PAUSE_GAME:
        return this._handlePause();
      case CommandType.CONTINUE_LEVEL:
        return this._handleContinue();
      case CommandType.EXIT_TO_MENU:
        return this._handleExitToMenu();
      case CommandType.RETRY_LEVEL:
        return this._handleRetry();
      default:
        console.warn('GameController: comando desconocido:', command.type);
        return { handled: false, reason: 'UNKNOWN_COMMAND' };
    }
  }

  _handleMoveObject({ objectId, destinationSlotId }) {
    if (this._resolving) {
      return { handled: false, reason: 'INPUT_LOCKED' };
    }
    if (this.gameState.gamePhase !== GamePhase.READY) {
      return { handled: false, reason: 'WRONG_PHASE' };
    }

    this._resolving = true;
    this.gameState.setPhase(GamePhase.RESOLVING);
    this.eventBus.emit(EventType.INPUT_LOCKED, {});

    try {
      const moveResult = this.movementSystem.execute(
        this.levelState,
        objectId,
        destinationSlotId
      );

      if (!moveResult.success) {
        this._finishResolve();
        return { handled: false, reason: moveResult.reason };
      }

      const trioResult = this.trioSystem.check(
        this.levelState,
        moveResult.destination.shelf.id,
        moveResult.destination.layer.id
      );

      this.layerSystem.checkAndAdvance(this.levelState);
      this.collapseSystem.check(this.levelState);

      this.saveSystem.autoSave(
        this.gameState,
        this.levelDefinition,
        this.levelState.timer
      );

      if (this.victorySystem.check(this.levelState)) {
        this.gameState.setPhase(GamePhase.VICTORY);
        this.timerSystem.stop();
        this._resolving = false;
        this.eventBus.emit(EventType.INPUT_UNLOCKED, {});
        return { handled: true, victory: true };
      }

      if (this.blockSystem.check(this.levelState)) {
        this.gameState.setPhase(GamePhase.BLOCKED);
        this.timerSystem.stop();
        this._resolving = false;
        this.eventBus.emit(EventType.INPUT_UNLOCKED, {});
        return { handled: true, blocked: true };
      }

      this._finishResolve();
      return { handled: true, trio: !!trioResult };

    } catch (error) {
      console.error('Error durante resolución:', error);
      this._finishResolve();
      return { handled: false, reason: 'INTERNAL_ERROR' };
    }
  }

  _handleUsePowerUp({ powerUpType, targetObjectId }) {
    console.log('⚡ _handleUsePowerUp:', powerUpType, 'target:', targetObjectId);
    console.log('⚡ Inventario actual:', this.gameState.powerUps);
    
    if (this.gameState.gamePhase !== GamePhase.READY) {
      console.log('⚡ Fase incorrecta:', this.gameState.gamePhase);
      return { handled: false, reason: 'WRONG_PHASE' };
    }

    if (!this.gameState.powerUps[powerUpType] || this.gameState.powerUps[powerUpType] <= 0) {
      console.log('⚡ Power-up no disponible:', powerUpType, 'cantidad:', this.gameState.powerUps[powerUpType]);
      return { handled: false, reason: 'POWERUP_NOT_AVAILABLE' };
    }

    const onTimePause = () => {
      console.log('⚡ Pausando tiempo');
      this.timerSystem.stop();
    };
    
    const onTimeResume = () => {
      console.log('⚡ Reanudando tiempo');
      this.timerSystem.start(this.levelState);
    };

    const result = this.powerUpSystem.usePowerUp(
      this.levelState,
      powerUpType,
      targetObjectId,
      this.gameState.powerUps,
      onTimePause,
      onTimeResume
    );

    console.log('⚡ Resultado del power-up:', result);

    if (result.success) {
      if (this.victorySystem.check(this.levelState)) {
        this.gameState.setPhase(GamePhase.VICTORY);
        this.timerSystem.stop();
        return { handled: true, victory: true };
      }

      return { handled: true, powerUpUsed: true };
    }

    return { handled: false, reason: result.reason };
  }

  _finishResolve() {
    this._resolving = false;
    this.gameState.setPhase(GamePhase.READY);
    this.eventBus.emit(EventType.INPUT_UNLOCKED, {});
  }

  _handlePause() {
    if (this.gameState.gamePhase === GamePhase.READY) {
      this.gameState.setPhase(GamePhase.PAUSED);
      return { handled: true };
    }
    return { handled: false, reason: 'CANNOT_PAUSE' };
  }

  _handleContinue() {
    if (this.gameState.gamePhase === GamePhase.VICTORY) {
      this.gameState.activeLevel = this.gameState.currentLevel;
      this.gameState.currentLevel++;
      return { handled: true, nextLevel: this.gameState.activeLevel };
    }
    return { handled: false, reason: 'NOT_IN_VICTORY' };
  }

  _handleExitToMenu() {
    this.gameState.setPhase(GamePhase.MENU);
    this.timerSystem.stop();
    return { handled: true };
  }

  _handleRetry() {
    if (this.gameState.gamePhase === GamePhase.BLOCKED ||
        this.gameState.gamePhase === GamePhase.TIME_OUT) {
      const success = this.retryLevel();
      return { handled: success, retryLevel: this.gameState.activeLevel };
    }
    return { handled: false, reason: 'CANNOT_RETRY' };
  }

  loadLevel(levelState) {
    console.log('📦 loadLevel:', levelState);
    this.levelState = levelState;
    this.gameState.setPhase(GamePhase.READY);
    this._resolving = false;
    this.timerSystem.start(levelState);
  }

  handleTimeExpired() {
    this.gameState.loseLife();
    this.timerSystem.stop();
    
    if (this.gameState.lives <= 0) {
      this.gameState.setPhase(GamePhase.GAME_OVER);
      return { handled: true, gameOver: true };
    } else {
      this.gameState.setPhase(GamePhase.TIME_OUT);
      return { handled: true, livesRemaining: this.gameState.lives };
    }
  }

  manualSave(slotIndex) {
    if (!this.levelDefinition) {
      console.error('No hay nivel cargado para guardar');
      return false;
    }
    return this.saveSystem.save(
      slotIndex,
      this.gameState,
      this.levelDefinition,
      this.levelState.timer
    );
  }

  manualLoad(slotIndex) {
    const data = this.saveSystem.load(slotIndex);
    if (!data) {
      console.error(`Slot ${slotIndex} vacío o error al cargar`);
      return false;
    }

    this.gameState = GameState.fromJSON(data.gameState);
    
    if (data.levelDefinition) {
      this.levelDefinition = LevelDefinition.fromJSON(data.levelDefinition);
      this.loadLevelFromDefinition(this.levelDefinition);
      this.levelState.timer = data.remainingTime;
    }

    console.log(`SaveSystem: carga manual desde slot ${slotIndex} exitosa`);
    return true;
  }

  listSaveSlots() {
    return this.saveSystem.listSlots();
  }

  hasAutoSave() {
    return this.saveSystem.hasSave(0);
  }

  loadAutoSave() {
    const data = this.saveSystem.loadAutoSave();
    if (!data) {
      console.log('⚠️ No hay autosave válido');
      return false;
    }

    try {
      this.gameState = GameState.fromJSON(data.gameState);
      
      if (data.levelDefinition) {
        this.levelDefinition = LevelDefinition.fromJSON(data.levelDefinition);
        this.loadLevelFromDefinition(this.levelDefinition);
        this.levelState.timer = data.remainingTime;
      }

      console.log('SaveSystem: autosave cargado');
      console.log('📦 Power-ups tras cargar:', this.gameState.powerUps);
      return true;
    } catch (error) {
      console.error('❌ Error al cargar autosave:', error);
      return false;
    }
  }
}