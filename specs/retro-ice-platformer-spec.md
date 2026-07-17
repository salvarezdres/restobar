# Spec: Retro Ice Cube Platformer

## Objetivo

Reemplazar el Snake por un juego plataformero retro en una sola pantalla o niveles cortos, donde el jugador controla un cubo de hielo con fisicas resbaladizas, mucho impulso y escenarios con multiples pendientes.

## Resultado esperado

- Una experiencia de juego retro, arcadey y visualmente clara.
- El personaje principal es un cubo de hielo.
- El movimiento debe sentirse diferente a un platformer generico: inercia marcada, poco agarre y deslize sobre superficies inclinadas.
- Los niveles deben incluir pendientes, rampas, desniveles y plataformas conectadas por geometria inclinada.
- El juego debe ser rejugable rapido, con reinicio inmediato.

## Premisa

El jugador controla un cubo de hielo que intenta avanzar por un entorno frio, neon y arcade.
La fantasia principal no es "saltar mucho", sino "dominar el deslizamiento".
Las pendientes son parte central del diseno, no un decorado.

## Direccion de juego

El juego sera un platformer lateral 2D con lectura retro.
Se prioriza:

- control preciso pero con inercia
- fisicas simples y entendibles
- niveles compactos
- reto por manejo de momentum y pendientes

## Mecanicas principales

### Movimiento

- El cubo puede moverse a la izquierda y derecha.
- El movimiento tiene aceleracion, velocidad maxima y friccion reducida.
- En suelo plano el personaje sigue resbalando un poco al soltar el input.
- En pendientes hacia abajo gana velocidad.
- En pendientes hacia arriba pierde velocidad mas rapido.

### Salto

- El cubo puede saltar.
- El salto debe ser corto y legible, no exageradamente flotante.
- Debe existir coyote time o buffer de salto si se busca que el control se sienta justo.
- El salto desde una pendiente debe responder de forma consistente.

### Interaccion con pendientes

- Las pendientes son el centro del nivel.
- Las colisiones con pendientes deben permitir transicion suave, no escalones artificiales.
- Si el cubo entra en una pendiente con velocidad, debe conservar parte del impulso.
- Caer desde una pendiente larga puede disparar un deslizamiento rapido.

### Riesgo y fallo

- Caer fuera del mapa o al vacio termina la partida o reinicia el tramo.
- Obstaculos peligrosos pueden incluir picos, bloques calientes o zonas que derriten el hielo.
- El contacto con peligros debe ser claro visualmente.

## Mecanicas secundarias propuestas

Estas se consideran la base recomendada para la primera version:

- **Melt meter**: un medidor de "derretimiento" o resistencia al calor que aumenta al tocar zonas calientes.
- **Cracks feedback**: el cubo muestra grietas visuales cuando pierde estado.
- **Slide boost**: deslizarse cuesta abajo puede dar un impulso breve si el jugador encadena bien la pendiente.
- **Freeze pads**: superficies que recuperan estado o frenan el derretimiento.
- **Checkpoint corto**: en niveles mas largos, puntos de control simples.

## Estructura de niveles

### Formato base

- Niveles cortos o una pantalla grande con secciones.
- Cada seccion debe introducir una variacion de pendiente o ritmo.
- El layout debe favorecer leer el terreno de un vistazo.

### Tipos de terreno

- piso plano
- rampas suaves
- rampas pronunciadas
- plataformas elevadas
- caidas largas
- huecos entre plataformas

### Curva de dificultad

- Primer tramo: pendientes suaves y saltos basicos.
- Tramo medio: combinacion de impulso, caidas y timing.
- Tramo final: pendientes mas agresivas, hazard y precision.

## Direccion visual

- Estetica retro arcade.
- Paleta base: hielo azul, cian neon, blanco, violeta oscuro y negro profundo.
- El cubo debe leerse como hielo: translucido, brillante, frio.
- Las pendientes deben verse naturales pero estilizadas, con bordes luminosos.
- El fondo debe tener energia arcade, pero sin robar legibilidad al terreno.
- Recursos visuales posibles:
  - scanlines
  - glow cian
  - particulas de cristal
  - destellos al aterrizar
  - reflejos en el suelo
  - hielo agrietado al recibir dano

## UI y HUD

- Titulo principal con presencia arcade.
- Boton `Start Game`.
- HUD minimo y claro.
- Indicadores sugeridos:
  - vida o estado del cubo
  - progreso del nivel
  - cantidad de derretimiento o resistencia
  - contador de intentos o tiempo

## Estados del juego

- `Idle`: pantalla inicial con el cubo y el llamado a comenzar.
- `Playing`: el jugador controla el cubo.
- `Paused`: opcional, si se decide incluirlo.
- `Game Over`: el cubo se rompe, se derrite o cae.
- `Level Complete`: fin del tramo o del nivel.

## Controles

- Izquierda y derecha para moverse.
- Salto con una sola tecla o boton.
- Reinicio rapido desde teclado o boton.
- Si se agrega mobile, debe haber controles tactiles simples y grandes.

## Reglas de fisica

- La gravedad debe sentirse arcade, no simulacion realista pesada.
- La friccion debe ser baja para reforzar la fantasia del hielo.
- Las pendientes deben afectar la velocidad de forma visible.
- La inercia debe importar mas que en un platformer clasico.
- El jugador debe poder predecir el movimiento despues de pocas pruebas.

## Accesibilidad y legibilidad

-6  El terreno activo debe distinguirse claramente del fondo.
- El personaje debe leerse incluso en escenas con mucho brillo.
- Los peligros deben tener contraste alto.
- Las pantallas de estado deben explicar de forma breve que paso y como reiniciar.

## Criterios de aceptacion

- El juego deja de ser Snake y pasa a ser un platformer retro.
- El personaje principal es un cubo de hielo.
- Hay pendientes multiples y la fisica de deslizamiento importa de verdad.
- Existe un flujo claro de `Start Game`, partida, derrota o fin de nivel.
- El juego se puede reiniciar sin recargar la pagina.
- La estetica retro arcade sigue presente, pero adaptada al nuevo genero.

## Suposiciones

- La primera version sera local y autocontenida.
- El juego se implementara en una sola pagina.
- No se necesita backend.
- Se prioriza la sensacion de movimiento sobre la complejidad de sistemas.
- El cubo de hielo es el protagonista mecanico y visual.

## Pendientes para implementacion

- Definir si el movimiento sera por tiles, fisica continua o un hibrido.
- Definir si el juego sera single-screen o con scroll lateral.
- Definir si el cubo puede hacer dash o solo salto basico.
- Definir si el derretimiento sera un timer, barra de vida o ambos.
- Definir si los niveles seran generados a mano o por plantilla.
