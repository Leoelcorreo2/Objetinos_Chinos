/**
 * main.js - Punto de entrada a prueba de fallos con diagnóstico global
 */
console.log('🚀 [main.js] Iniciando carga del módulo...');

import { LayerState } from './core/model/Layer.js';
import { GamePhase } from './core/state/GamePhase.js';
import { EventType, EventBus } from './core/events/Events.js';
import { PowerUpType } from './core/model/PowerUp.js';

import { LevelGenerator } from './generation/generator/LevelGenerator.js';
import { LevelConfiguration } from './generation/configuration/LevelConfiguration.js';
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
    const gameState = new GameState();
    const controller = new GameController(gameState, null, eventBus);
    
    console.log('2. Configurando tema...');
    console.log('   Temas disponibles:', themeRegistry.listThemes());
    const themeSet = themeRegistry.setCurrent('peluches_02');
    if (!themeSet) {
      console.warn('   ⚠️ No se pudo establecer peluches_02. Usando el primero.');
      const first = themeRegistry.listThemes()[0];
      if (first) themeRegistry.setCurrent(first.id);
    }
    
    console.log('3. Exponiendo variables al objeto window para diagnóstico...');
    window.debugController = controller;
    window.debugGameState = gameState;
    window.themeRegistry = themeRegistry;
    window.assetManager = assetManager;
    console.log('   ✅ Variables expuestas.');

    console.log('4. Buscando elementos del DOM...');
    const boardElement = document.getElementById('board');
    const ghostElement = document.getElementById('ghost');
    if (!boardElement) throw new Error('No se encontró <div id="board"> en el HTML');
    if (!ghostElement) throw new Error('No se encontró <div id="ghost"> en el HTML');
    console.log('   ✅ Elementos DOM encontrados.');
    
    console.log('5. Creando Renderer...');
    const renderer = new BoardRenderer(boardElement, ghostElement);

    console.log('6. Precargando assets del tema...');
    const currentTheme = themeRegistry.getCurrent();
    if (currentTheme) {
      await assetManager.preloadTheme(currentTheme);
      console.log('   ✅ Assets precargados:', assetManager.getStats());
    } else {
      throw new Error('No hay tema activo para precargar');
    }

    console.log('7. Generando o cargando nivel...');
    if (controller.hasAutoSave()) {
      console.log('   📂 Cargando autosave...');
      controller.loadAutoSave();
    } else {
      console.log('   🎮 Nuevo juego. Generando nivel 1...');
      const levelDefinition = LevelGenerator.generateCompleteLevel(1);
      controller.loadLevelFromDefinition(levelDefinition);
    }

    if (!controller.levelState) {
      throw new Error('controller.levelState es null. Revisa LevelGenerator y GameController.');
    }
    console.log('   ✅ Nivel cargado. Estructuras:', controller.levelState.board.structures.length);

    console.log('8. Creando InputSystem...');
    window.inputSystem = new InputSystem(boardElement, controller, renderer, controller.levelState, gameState);
    console.log('   ✅ InputSystem creado.');

    console.log('9. Estableciendo fase del juego a READY...');
    gameState.setPhase(GamePhase.READY);

    console.log('10. Renderizando el tablero...');
    renderer.render(controller.levelState);
    console.log('   ✅ Renderizado completado. Elementos en #board:', boardElement.children.length);

    console.log('🎉 [main.js] ¡JUEGO INICIADO CORRECTAMENTE! 🎉');

  } catch (error) {
    console.error('💥 ERROR CRÍTICO en startGame:', error);
    console.error('Pila de errores:', error.stack);
    alert('ERROR CRÍTICO:\n\n' + error.message + '\n\nRevisa la consola (F12) para ver la pila de errores.');
  }
}

// Ejecutar la inicialización
startGame();