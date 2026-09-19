/**
 * InputSystem - Captura eventos de ratón/táctil y los traduce a Comandos.
 * 
 * Integración con Power-ups:
 * - Permite seleccionar power-ups desde el HUD
 * - Para el Martillo: requiere seleccionar un objeto después
 * - Para Hielo/Tiempo: activación directa desde el HUD
 */
import { createMoveObjectCommand } from '../../core/commands/Commands.js';
import { GamePhase } from '../../core/state/GamePhase.js';
import { MovementRules } from '../../rules/MovementRules.js';
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
    
    console.log('🎮 InputSystem: Inicializando...');
    console.log('   boardElement:', boardElement);
    console.log('   gameState:', gameState);
    console.log('   gamePhase inicial:', gameState.gamePhase);
    
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
    console.log('🔨 Power-up seleccionado:', powerUpType);
    return true;
  }

  deselectPowerUp() {
    this.selectedPowerUp = null;
  }

  activateDirectPowerUp(powerUpType) {
    console.log('⚡ InputSystem: activando power-up directo:', powerUpType);
    
    const command = {
      type: 'USE_POWERUP',
      payload: {
        powerUpType: powerUpType,
        targetObjectId: null
      }
    };
    
    const result = this.controller.handleCommand(command);
    console.log('⚡ InputSystem: resultado:', result);
    this.selectedPowerUp = null;
    return result;
  }

  _bindEvents() {
    console.log('📌 InputSystem: Configurando event listeners...');
    
    // Ratón - Tablero
    this.boardElement.addEventListener('mousedown', (e) => {
      console.log('️ mousedown en board', e.target);
      this._handleStart(e);
    });
    
    document.addEventListener('mousemove', (e) => {
      this._handleMove(e);
    });
    
    document.addEventListener('mouseup', (e) => {
      this._handleEnd(e);
    });
    
    // Táctil - Tablero
    this.boardElement.addEventListener('touchstart', (e) => {
      console.log('👆 touchstart en board');
      if (e.touches.length > 0) {
        e.preventDefault();
        this._handleStart(e.touches[0]);
      }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        this._handleMove(e.touches[0]);
      }
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        this._handleEnd(e.changedTouches[0]);
      }
    });
    
    console.log('✅ InputSystem: Todos los listeners configurados');
  }

  _handleStart(e) {
    console.log('🎯 _handleStart llamado');
    console.log('   gamePhase:', this.gameState.gamePhase);
    console.log('   target:', e.target);
    console.log('   selectedPowerUp:', this.selectedPowerUp);
    
    if (this.gameState.gamePhase !== GamePhase.READY) {
      console.log('️ Input bloqueado - fase:', this.gameState.gamePhase);
      return;
    }

    if (this.selectedPowerUp === PowerUpType.HAMMER) {
      console.log('🔨 Usando Martillo');
      this._handleHammerTarget(e);
      return;
    }

    const target = e.target.closest('.object[data-interactive="true"]');
    console.log('   object target:', target);
    
    if (!target) {
      console.log(' No es un objeto interactivo');
      return;
    }

    e.preventDefault();

    const objectId = target.dataset.objectId;
    console.log('   objectId:', objectId);
    
    const obj = this.levelState.dynamicState.get(objectId);
    if (!obj) {
      console.log('❌ Objeto no encontrado en dynamicState');
      return;
    }

    console.log('✅ Iniciando arrastre de:', objectId);

    this.dragState = {
      objectId: objectId,
      glyph: target.textContent || target.querySelector('.object-image')?.alt || 'objeto',
      startX: e.clientX,
      startY: e.clientY
    };

    this.renderer.showGhost(target.textContent || '', e.clientX, e.clientY);
  }

  _handleHammerTarget(e) {
    const target = e.target.closest('.object[data-interactive="true"]');
    
    if (!target) {
      console.log('❌ Martillo: No se seleccionó un objeto válido');
      this.deselectPowerUp();
      return;
    }

    e.preventDefault();
    const objectId = target.dataset.objectId;
    console.log(' Martillo aplicado a:', objectId);

    const command = {
      type: 'USE_POWERUP',
      payload: {
        powerUpType: PowerUpType.HAMMER,
        targetObjectId: objectId
      }
    };

    const result = this.controller.handleCommand(command);
    console.log('🔨 Resultado del Martillo:', result);
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
    
    console.log('🏁 _handleEnd llamado');
    
    this.renderer.hideGhost();
    this.renderer.highlightSlot(null);

    const nearestSlot = this._findNearestValidSlot(e.clientX, e.clientY);

    if (nearestSlot) {
      console.log('✅ Movimiento válido a:', nearestSlot.dataset.slotId);
      const command = createMoveObjectCommand(this.dragState.objectId, nearestSlot.dataset.slotId);
      console.log('   Comando:', command);
      this.controller.handleCommand(command);
    } else {
      console.log('❌ No se encontró slot válido cercano');
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