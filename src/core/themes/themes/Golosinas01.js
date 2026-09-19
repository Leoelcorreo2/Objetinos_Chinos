/**
 * Tema: Golosinas 01
 * Objetos: Dulces, caramelos, chocolates
 * Colores consistentes: PINK, BROWN, YELLOW
 */
import { ObjectTheme } from '../ObjectTheme.js';

export const Golosinas01 = new ObjectTheme(
  'golosinas_01',
  'Golosinas 01',
  [
    // Caramelo
    { type: 'CANDY', color: 'PINK', glyph: '🍬' },
    { type: 'CANDY', color: 'BROWN', glyph: '🍫' },
    { type: 'CANDY', color: 'YELLOW', glyph: '🍋' },
    
    // Donut
    { type: 'DONUT', color: 'PINK', glyph: '🍩' },
    { type: 'DONUT', color: 'BROWN', glyph: '🍪' },
    { type: 'DONUT', color: 'YELLOW', glyph: '🧀' },
    
    // Galleta
    { type: 'COOKIE', color: 'PINK', glyph: '🍡' },
    { type: 'COOKIE', color: 'BROWN', glyph: '🥨' },
    { type: 'COOKIE', color: 'YELLOW', glyph: '🥐' },
    
    // Helado
    { type: 'ICECREAM', color: 'PINK', glyph: '🍦' },
    { type: 'ICECREAM', color: 'BROWN', glyph: '🍨' },
    { type: 'ICECREAM', color: 'YELLOW', glyph: '🍯' },
    
    // Pastel
    { type: 'CAKE', color: 'PINK', glyph: '🎂' },
    { type: 'CAKE', color: 'BROWN', glyph: '🧁' },
    { type: 'CAKE', color: 'YELLOW', glyph: '🥞' }
  ],
  {
    category: 'golosinas',
    difficulty: 1,
    description: 'Deliciosas golosinas y dulces'
  }
);