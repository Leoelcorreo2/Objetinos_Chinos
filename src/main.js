/**
 * main.js - Punto de entrada definitivo a prueba de fallos
 */
console.log('🚀 [main.js] INICIANDO CARGA DEL MÓDULO...');

import { LayerState } from './core/model/Layer.js';
import { GamePhase } from './core/state/GamePhase.js';
import { EventType, EventBus } from './core/events/Events.js';
import { PowerUpType } from './core/model/PowerUp.js';

import { LevelGenerator } from './generation/generator/LevelGenerator.js';
import { themeRegistry } from './core/themes/ThemeRegistry.js';
import { assetManager } from './presentation/renderer/AssetManager.js';

import { GameState } from './application/GameState.js';
import { GameController } from './application/GameController.js';
import { BoardRenderer } from './presentation/renderer/BoardRenderer.js';
import { InputSystem } from './presentation/input/InputSystem.js';

console.log('✅ [main.js] Todos los imports cargados correctamente.');

async function startGame() {
  try {
    console.log('1. Creando instancias base...');
    const eventBus = new EventBus();
    window.debugEventBus = eventBus;
    const gameState = new GameState();
    const controller = new GameController(gameState, null, eventBus);
    
    console.log('2. Configurando tema...');
    themeRegistry.setCurrent('peluches_02');
    
    window.debugController = controller;
    window.debugGameState = gameState;

    console.log('3. Buscando elementos del DOM...');
    const boardElement = document.getElementById('board');
    const ghostElement = document.getElementById('ghost');
    if (!boardElement) throw new Error('Falta <div id="board"> en el HTML');
    if (!ghostElement) throw new Error('Falta <div id="ghost"> en el HTML');
    
    console.log('4. Creando Renderer...');
    const renderer = new BoardRenderer(boardElement, ghostElement);

    console.log('5. Precargando assets...');
    const currentTheme = themeRegistry.getCurrent();
    if (currentTheme) {
      await assetManager.preloadTheme(currentTheme);
      console.log('   ✅ Assets precargados:', assetManager.getStats());
    }

    console.log('6. Cargando nivel...');
    if (controller.hasAutoSave()) {
      console.log('   📂 Cargando autosave...');
      controller.loadAutoSave();
    } else {
      console.log('   🎮 Nuevo juego. Generando nivel 1...');
      const levelDefinition = LevelGenerator.generateCompleteLevel(1);
      controller.loadLevelFromDefinition(levelDefinition);
    }

    if (!controller.levelState) {
      throw new Error('controller.levelState es null después de cargar el nivel');
    }
    console.log('   ✅ Nivel cargado. Estructuras:', controller.levelState.board.structures.length);

    console.log('7. Creando InputSystem...');
    window.inputSystem = new InputSystem(boardElement, controller, renderer, controller.levelState, gameState);
    console.log('   ✅ InputSystem creado.');

    console.log('8. Estableciendo fase READY...');
    gameState.setPhase(GamePhase.READY);

    // ==========================================
    // FUNCIONES DE UI
    // ==========================================
    function formatTime(seconds) {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    window.refreshView = function() {
      console.log('💥 [main.js] refreshView EJECUTADO');
      if (!controller.levelState) {
        console.warn('⚠️ refreshView: levelState no disponible');
        return;
      }
      
      renderer.render(controller.levelState);
      
      const livesEl = document.getElementById('lives-display');
      const levelEl = document.getElementById('level-display');
      const timerEl = document.getElementById('timer-display');
      
      if (livesEl) livesEl.textContent = '♥'.repeat(Math.max(0, gameState.lives));
      if (levelEl) levelEl.textContent = `Nivel ${gameState.activeLevel}`;
      if (timerEl && controller.levelState) timerEl.textContent = formatTime(controller.levelState.timer);
      
      const powerUpButtons = document.querySelectorAll('.powerup-btn');
      powerUpButtons.forEach(btn => {
        const type = btn.dataset.powerUpType;
        const count = gameState.getPowerUpCount(type);
        const countEl = btn.querySelector('.powerup-count');
        if (countEl) countEl.textContent = count;
        
        if (count <= 0) btn.classList.add('disabled');
        else btn.classList.remove('disabled');
        
        if (window.inputSystem && window.inputSystem.selectedPowerUp === type) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });
      console.log('✅ [main.js] refreshView TERMINADO EXITOSAMENTE');
    };

    function showNotification(message) {
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
        }, 2000);
      }
    }

    function showOverlay(title, msg, primaryText, secondaryText) {
      const overlay = document.getElementById('overlay');
      const overlayTitle = document.getElementById('overlay-title');
      const overlayMsg = document.getElementById('overlay-msg');
      const btnPrimary = document.getElementById('btn-primary');
      const btnSecondary = document.getElementById('btn-secondary');
      
      if (!overlay || !overlayTitle || !overlayMsg || !btnPrimary || !btnSecondary) {
        console.error('❌ Elementos del overlay no encontrados en el DOM');
        return;
      }
      
      overlayTitle.textContent = title;
      overlayMsg.textContent = msg;
      btnPrimary.textContent = primaryText;
      btnSecondary.textContent = secondaryText;
      overlay.classList.remove('hidden');
    }

    // ==========================================
    // EVENTOS DEL MOTOR
    // ==========================================
    console.log('9. REGISTRANDO EVENTOS DEL MOTOR...');
    
    eventBus.on(EventType.OBJECT_MOVED, (e) => {
      console.log('📥 [main.js] EVENTO OBJECT_MOVED CAPTADO -> LLAMANDO A refreshView()');
      window.refreshView();
    });

    eventBus.on(EventType.TRIO_COMPLETED, () => {
      console.log('📥 [main.js] EVENTO TRIO_COMPLETED CAPTADO -> LLAMANDO A refreshView()');
      window.refreshView();
    });

    eventBus.on(EventType.LAYER_ADVANCED, () => {
      console.log('📥 [main.js] EVENTO LAYER_ADVANCED CAPTADO -> LLAMANDO A refreshView()');
      window.refreshView();
    });

    eventBus.on(EventType.SHELF_COLLAPSED, () => {
      console.log('📥 [main.js] EVENTO SHELF_COLLAPSED CAPTADO -> LLAMANDO A refreshView()');
      window.refreshView();
    });

    eventBus.on(EventType.LEVEL_COMPLETED, () => {
      console.log('📥 [main.js] EVENTO LEVEL_COMPLETED CAPTADO -> Mostrando overlay de victoria');
      showOverlay('¡Nivel Completado!', 'Pulsa continuar para el siguiente nivel.', 'Continuar', 'Salir');
    });

    eventBus.on(EventType.BLOCK_DETECTED, () => {
      console.log('📥 [main.js] EVENTO BLOCK_DETECTED CAPTADO -> Mostrando overlay de bloqueo');
      showOverlay('Sin movimientos', 'No quedan movimientos válidos.', 'Reintentar', 'Salir');
    });

    eventBus.on(EventType.TIME_EXPIRED, () => {
      console.log('📥 [main.js] EVENTO TIME_EXPIRED CAPTADO');
      if (gameState.lives > 0) {
        showOverlay('Tiempo Agotado', `Vidas restantes: ${'♥'.repeat(gameState.lives)}`, 'Reintentar', 'Salir');
      } else {
        showOverlay('Game Over', 'Te has quedado sin vidas.', 'Salir', 'Salir');
      }
    });

    eventBus.on(EventType.TIMER_TICK, (e) => {
      const timerEl = document.getElementById('timer-display');
      if (timerEl) timerEl.textContent = formatTime(e.data.time);
    });

    // ==========================================
    // GESTIÓN DE POWER-UPS (UI)
    // ==========================================
    function setupPowerUpButtons() {
      const powerUpButtons = document.querySelectorAll('.powerup-btn');
      powerUpButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const type = btn.dataset.powerUpType;
          const count = gameState.getPowerUpCount(type);
          
          if (count <= 0) {
            showNotification('❌ No hay power-ups disponibles');
            return;
          }
          
          if (type === PowerUpType.ICE || type === PowerUpType.TIME_BOOST) {
            window.inputSystem.activateDirectPowerUp(type);
            return;
          }
          
          if (type === PowerUpType.HAMMER) {
            const selected = window.inputSystem.selectPowerUp(type);
            window.refreshView();
            if (selected) {
              showNotification('🔨 Selecciona un objeto para eliminar su trío');
            } else {
              showNotification('❌ Martillo deseleccionado');
            }
            return;
          }
        });
      });
    }
    setupPowerUpButtons();

    // ==========================================
    // GESTIÓN DE OVERLAYS (Botones)
    // ==========================================
    const btnPrimary = document.getElementById('btn-primary');
    const btnSecondary = document.getElementById('btn-secondary');

    if (btnPrimary) {
      btnPrimary.addEventListener('click', () => {
        const overlay = document.getElementById('overlay');
        if (overlay) overlay.classList.add('hidden');
        
        if (gameState.gamePhase === GamePhase.VICTORY) {
          gameState.currentLevel++;
          gameState.activeLevel = gameState.currentLevel;
          const newDefinition = LevelGenerator.generateCompleteLevel(gameState.activeLevel);
          controller.loadLevelFromDefinition(newDefinition);
          window.inputSystem.updateLevelState(controller.levelState);
          window.refreshView();
        } else if (gameState.gamePhase === GamePhase.BLOCKED || gameState.gamePhase === GamePhase.TIME_OUT) {
          controller.retryLevel();
          window.inputSystem.updateLevelState(controller.levelState);
          window.refreshView();
        } else if (gameState.gamePhase === GamePhase.GAME_OVER) {
          location.reload();
        }
      });
    }

    if (btnSecondary) {
      btnSecondary.addEventListener('click', () => {
        const overlay = document.getElementById('overlay');
        if (overlay) overlay.classList.add('hidden');
        location.reload();
      });
    }

    // Renderizado inicial
    console.log('10. Renderizado inicial...');
    window.refreshView();
    
    console.log('🎉 [main.js] ¡JUEGO INICIADO CORRECTAMENTE! 🎉');

  } catch (error) {
    console.error('💥 ERROR CRÍTICO en startGame:', error);
    console.error('Pila de errores:', error.stack);
    alert('ERROR CRÍTICO:\n\n' + error.message + '\n\nRevisa la consola (F12).');
  }
}

// Ejecutar la inicialización
startGame();