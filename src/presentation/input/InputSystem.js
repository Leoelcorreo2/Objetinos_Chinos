/**
 * InputSystem - Captura eventos de ratón/táctil y los traduce a Comandos.
 * 
 * Soporte completo para:
 * - Ratón (desktop)
 * - Pantalla táctil (móvil/tablet)
 */
import { createMoveObjectCommand } from '../../core/commands/Commands.js';
import { GamePhase } from '../../core/state/GamePhase.js';
import { MovementRules } from '../../rules/movement/MovementRules.js';
import { PowerUpType } from '../../core/model/PowerUp.js';

export class InputSystem {
  constructor(boardElement, controller, renderer, levelState, gameState) {
    this.boardElement = boardElement;
    this.controller = controller;
    this.renderer = renderer;
    this.levelState = levelState;
    this.gameState = gameState;
    
    this.dragState = null;
    this.selectedPowerUp = null;
    this.MAGNET_THRESHOLD = 100;
    
    console.log(' InputSystem: Inicializando...');
    
    this._bindEvents();
    console.log('✅ InputSystem: Event listeners configurados');
  }

  updateLevelState(levelState) {
    this.levelState = levelState;
  }

  selectPowerUp(powerUpType) {
    const count = this.gameState.getPowerUpCount(powerUpType);
    if (count <= 0) return false;

    if (this.selectedPowerUp === powerUpType) {
      this.selectedPowerUp = null;
      return false;
    }

    this.selectedPowerUp = powerUpType;
    return true;
  }

  deselectPowerUp() {
    this.selectedPowerUp = null;
  }

  activateDirectPowerUp(powerUpType) {
    const command = {
      type: 'USE_POWERUP',
      payload: {
        powerUpType: powerUpType,
        targetObjectId: null
      }
    };
    
    const result = this.controller.handleCommand(command);
    this.selectedPowerUp = null;
    return result;
  }

  _bindEvents() {
    // ==========================================
    // RATÓN (Desktop)
    // ==========================================
    this.boardElement.addEventListener('mousedown', (e) => {
      this._handleStart(e);
    });
    
    document.addEventListener('mousemove', (e) => {
      this._handleMove(e);
    });
    
    document.addEventListener('mouseup', (e) => {
      this._handleEnd(e);
    });
    
    // ==========================================
    // TÁCTIL (Móvil/Tablet)
    // ==========================================
    this.boardElement.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        this._handleStart(touch);
      }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        this._handleMove(touch);
      }
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        this._handleEnd(touch);
      }
    });
    
    document.addEventListener('touchcancel', (e) => {
      if (this.dragState) {
        this.renderer.hideGhost();
        this.renderer.highlightSlot(null);
        this.dragState = null;
      }
    });
  }

  _handleStart(e) {
    if (this.gameState.gamePhase !== GamePhase.READY) {
      return;
    }

    if (this.selectedPowerUp === PowerUpType.HAMMER) {
      this._handleHammerTarget(e);
      return;
    }

    // Buscar el objeto interactivo más cercano
    const target = e.target.closest('.object[data-interactive="true"]');
    
    if (!target) {
      return;
    }

    if (e.preventDefault) {
      e.preventDefault();
    }

    const objectId = target.dataset.objectId;
    const obj = this.levelState.dynamicState.get(objectId);
    if (!obj) {
      return;
    }

    this.dragState = {
      objectId: objectId,
      startX: e.clientX,
      startY: e.clientY
    };

    // CORRECCIÓN: Pasar el elemento target completo al renderer para clonar la imagen
    this.renderer.showGhostFromElement(target, e.clientX, e.clientY);
  }

  _handleHammerTarget(e) {
    const target = e.target.closest('.object[data-interactive="true"]');
    
    if (!target) {
      this.deselectPowerUp();
      return;
    }

    if (e.preventDefault) {
      e.preventDefault();
    }
    
    const objectId = target.dataset.objectId;

    const command = {
      type: 'USE_POWERUP',
      payload: {
        powerUpType: PowerUpType.HAMMER,
        targetObjectId: objectId
      }
    };

    this.controller.handleCommand(command);
    this.deselectPowerUp();
  }

  _handleMove(e) {
    if (!this.dragState) return;

    this.renderer.moveGhost(e.clientX, e.clientY);
    
    const nearestSlot = this._findNearestValidSlot(e.clientX, e.clientY);
    this.renderer.highlightSlot(nearestSlot ? nearestSlot.dataset.slotId : null);
  }

  _handleEnd(e) {
    if (!this.dragState) return;
    
    this.renderer.hideGhost();
    this.renderer.highlightSlot(null);

    const nearestSlot = this._findNearestValidSlot(e.clientX, e.clientY);

    if (nearestSlot) {
      const command = createMoveObjectCommand(this.dragState.objectId, nearestSlot.dataset.slotId);
      this.controller.handleCommand(command);
    }

    this.dragState = null;
  }

  _findNearestValidSlot(x, y) {
    const slots = document.querySelectorAll('.slot');
    let bestSlot = null;
    let bestDist = this.MAGNET_THRESHOLD;

    slots.forEach(slot => {
      const rect = slot.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(x - cx, y - cy);

      if (dist < bestDist) {
        const slotId = slot.dataset.slotId;
        const check = MovementRules.canMove(this.levelState, this.dragState.objectId, slotId);
        if (check.valid) {
          bestDist = dist;
          bestSlot = slot;
        }
      }
    });

    return bestSlot;
  }
}