# Spec: Arcade Snake Neon

## Objetivo

Transformar la página actual en una experiencia de una sola pantalla con estética de arcade retro, iluminación neon y un juego Snake jugable al presionar `Start Game`.

## Resultado esperado

- Una pantalla principal con apariencia de máquina arcade.
- Un título visible que diga exactamente `Insert coint`.
- Un botón principal `Start Game`.
- Al presionar `Start Game`, se inicia una partida de Snake.
- La experiencia visual debe sentirse retro, intensa y neon, no minimalista.

## Alcance funcional

### Pantalla inicial

- Fondo con look arcade: oscuro, con gradientes, glow y elementos decorativos neon.
- Título grande, centrado y protagonista.
- Botón `Start Game` con estilo arcade.
- Estado inicial sin partida activa.

### Juego Snake

- El juego se inicia solo cuando el usuario presiona `Start Game`.
- El tablero debe ser claramente visible y legible.
- El juego debe responder a teclado o controles equivalentes.
- La serpiente se mueve en una grilla.
- Al comer comida, crece y aumenta el puntaje.
- Si choca contra pared o contra sí misma, termina la partida.

### Estados del juego

- `Idle`: pantalla inicial antes de jugar.
- `Playing`: partida en curso.
- `Game Over`: fin de partida con opción de reiniciar.

## Direccion visual

- Estética arcade ochentera.
- Paleta sugerida: negro, magenta, cian, violeta eléctrico, verde fosforescente.
- Uso fuerte de glow, bordes brillantes y contraste alto.
- Tipografía con presencia de arcade o sci-fi retro.
- Elementos decorativos posibles:
  - scanlines
  - rejillas
  - estrellas o partículas
  - marcos tipo cabinet arcade
  - reflejos neon

## Reglas del juego

- La serpiente comienza con tamaño pequeño.
- La velocidad puede aumentar progresivamente o mantenerse fija, pero debe definirse explícitamente en implementación.
- Debe existir una comida visible y diferenciada del fondo.
- El puntaje debe mostrarse durante la partida.
- El reinicio debe ser simple y rápido.

## Interacciones

- `Start Game` inicia una nueva partida desde cero.
- Teclas de dirección controlan el movimiento.
- Si existe pausa, debe ser opcional y claramente indicada.
- En `Game Over`, el usuario debe poder volver a jugar sin recargar la página.

## Requisitos de accesibilidad y usabilidad

- Contraste suficiente para leer el estado del juego.
- El botón principal debe ser navegable con teclado.
- La partida no debe depender solo de efectos visuales para comunicar estados.
- Debe haber un mensaje claro cuando la partida termina.

## Criterios de aceptación

- El título visible en la interfaz dice `Insert coint`.
- La página tiene un look retro arcade con neon evidente.
- Existe un botón `Start Game`.
- Al presionarlo, el juego Snake se inicia.
- La serpiente se mueve y puede comer comida.
- El puntaje cambia al comer.
- El juego termina al colisionar y permite reiniciar.

## Suposiciones

- El juego será implementado como una página única, sin navegación adicional.
- La primera versión será local y autocontenida.
- La fuente de datos externa no es necesaria.
- El texto `Insert coint` se conserva tal como fue pedido, aunque parece una variación intencional o un typo.

## Pendientes para implementación

- Definir si el movimiento será con teclado, swipe o ambos.
- Definir velocidad inicial y progresión.
- Definir si habrá sonido arcade.
- Definir si el juego será canvas, DOM o una mezcla.
- Definir dimensiones exactas del tablero para desktop y mobile.
