# Plan: calculadora web personal

## Estado del repositorio

- Solo existe `README.md`, con una descripción del repositorio. No hay aplicación, configuración de build, dependencias ni tests existentes.
- Herramientas locales comprobadas: Node.js v22.23.3, npm 10.9.9 y Python 3.12.0.
- Este documento es la única entrega de esta fase. No se implementa todavía la aplicación.
- Todo el trabajo se limitará al repositorio, sin red, servicios externos, plugins, subagentes, credenciales ni instalaciones globales.

## Alcance y criterios de aceptación

Crear una calculadora web gratuita para uso personal diario, adaptable a móvil y escritorio y utilizable sin conexión una vez servidos sus archivos locales.

«Cualquier operación» se concreta en expresiones numéricas reales formadas por las operaciones soportadas: suma, resta, multiplicación, división, potencias, raíces cuadradas, porcentajes, paréntesis, signos positivos y negativos, valor absoluto, logaritmos y trigonometría básica. No implica resolver cualquier problema matemático, ecuaciones simbólicas, números complejos o cálculos de precisión arbitraria.

- Admitir números enteros y decimales, con punto o coma decimal; normalizar la coma a punto. No admitir separadores de miles ni funciones con múltiples argumentos, para evitar ambigüedad con la coma.
- Respetar precedencia y asociatividad: `2+3*4 = 14`, `(2+3)*4 = 20`, `2^3^2 = 512`, `-2^2 = -4` y `2^-2 = 0,25`.
- Soportar `sqrt`, `abs`, `ln`, `log` (base 10), `sin`, `cos`, `tan` y constantes π y e. Las funciones requieren paréntesis. Incluir selector visible DEG/RAD, inicialmente DEG.
- Definir `%` como operador posfijo que divide entre 100: `50% = 0,5` y `200*10% = 20`; `200+10% = 200,1`. Mostrar esta semántica en la ayuda breve.
- Exigir multiplicación explícita en expresiones escritas; rechazar `2(3)` con un mensaje útil.
- Mostrar resultados con un máximo de tres decimales, redondeados y sin ceros finales innecesarios. Normalizar el cero negativo. Ejemplos: `1/3 → 0,333`, `2/3 → 0,667`, `1,5+2,25 → 3,75`.
- Conservar la precisión interna de JavaScript al reutilizar un resultado mediante `Ans`; redondear únicamente su presentación. Usar notación científica para magnitudes extremas, con un máximo de tres decimales en la mantisa, indicando cuándo un valor mostrado es aproximado.
- Mostrar errores comprensibles para entradas incompletas, símbolos desconocidos, división entre cero, dominios inválidos, singularidades trigonométricas y resultados no finitos. No mostrar `NaN` ni `Infinity` como resultados válidos.
- Permitir editar la expresión, borrar un carácter, limpiar, calcular y reutilizar el último resultado. Mantener un historial breve durante la sesión, con opción de limpiar y recuperar expresiones.
- Asegurar interacción por teclado y botones, foco visible, etiquetas accesibles, anuncios de resultado y contraste suficiente. No depender solo del color para comunicar estados.

### Límites numéricos

Se utilizará `Number` de JavaScript (IEEE 754). La corrección se verificará dentro de su precisión representable; no se prometerá exactitud decimal arbitraria. Se documentará esta limitación, se advertirá sobre resultados enteros fuera del rango seguro y se probarán redondeo, errores y magnitudes extremas. Los valores finitos muy pequeños se mostrarán en notación científica para no confundirlos con cero.

## Arquitectura propuesta

Aplicación estática en HTML, CSS y JavaScript nativo, sin frameworks, fuentes remotas ni dependencias de terceros.

```text
index.html              Estructura semántica y controles
src/styles.css          Diseño adaptable, estados y accesibilidad
src/calculator.js       Tokenizador, parser y evaluación matemática
src/format.js           Formato de resultados y aproximaciones
src/app.js              Estado de interfaz, eventos e historial
tests/calculator.test.js Pruebas del motor con node:test
tests/format.test.js     Pruebas de presentación con node:test
scripts/build.mjs       Copia de archivos explícitos a dist y validación
package.json            Módulos ES y scripts locales sin dependencias
.gitignore              Exclusión de dist y artefactos locales
README.md               Uso, operaciones, límites y comandos
```

- Motor puro separado del DOM para poder probarlo directamente. Tokenizador con lista permitida de símbolos y parser por precedencia; prohibido utilizar `eval` o `Function`.
- Manejar explícitamente signos unarios, potencia asociativa a la derecha y porcentaje posfijo. Limitar longitud de entrada y profundidad de anidamiento para evitar bloquear la interfaz.
- Estado local: expresión editable, último resultado con precisión interna, modo angular, historial y error actual. Sin backend, cuentas, analítica ni persistencia obligatoria.
- Renderizar las entradas del usuario como texto, nunca como HTML.
- Build mediante APIs nativas de Node: copiar solo los archivos de la aplicación a `dist`, sin descargas ni compiladores externos. Cualquier limpieza se limitará al `dist` verificado dentro del repositorio.

## Diseño de interfaz

Panel central con fondo degradado, superficies contrastadas y un color de acento para acciones principales. Pantalla amplia con expresión editable y resultado de mayor tamaño. Teclado aritmético como vista principal, operaciones científicas en un panel desplegable e historial secundario.

En móvil, controles táctiles de al menos 44 px y disposición sin desbordamientos a 320 px. En escritorio, historial junto al panel cuando haya espacio. Fuente del sistema y cifras tabulares; transiciones breves respetando `prefers-reduced-motion`.

## Tareas de implementación, en orden

1. Crear estructura estática, configuración ES modules y scripts `test` y `build`, sin dependencias.
2. Implementar tokenización, parser y evaluación con errores tipados, límites de entrada y semántica documentada.
3. Implementar formato a tres decimales, notación científica, indicadores de aproximación y manejo del cero negativo.
4. Añadir pruebas relevantes del motor y del formato antes de conectar la interfaz.
5. Construir el diseño adaptable y accesible; conectar edición, teclado, botones, funciones científicas y DEG/RAD.
6. Añadir `Ans` e historial de sesión, asegurando que se conserva el valor interno al encadenar operaciones.
7. Ejecutar pruebas y build; comprobar manualmente interacción, accesibilidad y presentación desde un servidor local.
8. Documentar ejecución, operaciones soportadas, porcentaje, precisión y limitaciones en `README.md`.

## Validación y comandos concretos

Los siguientes comandos se ejecutarán desde la raíz **después de implementar** los archivos anteriores. Actualmente no existe ninguna suite ni build que ejecutar. No requieren `npm install`.

```powershell
# Suite automatizada: script test = node --test
npm test

# Ejecución directa de los tests previstos
node --test tests/calculator.test.js tests/format.test.js

# Build local: script build = node scripts/build.mjs
npm run build

# Servir únicamente en loopback para revisión manual; detener con Ctrl+C
python -m http.server 8000 --bind 127.0.0.1 --directory dist

# Revisar el parche y cambios accidentales
git diff --check
git status --short
```

El servidor usa exclusivamente loopback, sin acceso a servicios externos. Si la restricción de red incluye también loopback, omitir la revisión servida y dejar registrada esa validación pendiente; no descargar herramientas alternativas.

### Casos automatizados

- Aritmética con enteros, negativos y decimales; `0.1+0.2` se presenta como `0,3`.
- Precedencia, paréntesis anidados, potencias encadenadas y exponentes negativos.
- Coma decimal, espacios, porcentajes y funciones con constantes.
- `sqrt(9)=3`, `abs(-2)=2`, `ln(e)≈1`, `log(100)=2`, `sin(30)=0,5` en DEG y `sin(pi/2)≈1` en RAD.
- División por cero, `sqrt(-1)`, `ln(0)`, `tan(90)` en DEG, desbordamiento, paréntesis incompletos y tokens no permitidos.
- Redondeo positivo y negativo, ausencia de ceros sobrantes, cero negativo y notación científica. Comparar resultados internos aproximados con tolerancia numérica adecuada.
- Reutilización del resultado interno, límites de longitud y profundidad, y rechazo de texto que intente ejecutar código.

### Revisión manual

- Introducir y corregir expresiones mediante teclado, ratón y controles táctiles; Enter calcula y Escape limpia sin interferir con la edición habitual.
- Probar modo científico, selector angular, historial, recuperación de expresiones y `Ans`.
- Revisar anchos de 320 px, tableta y escritorio, zoom al 200 %, foco, orden de tabulación y anuncios accesibles.
- Comprobar que errores permiten corregir y recalcular, que resultados largos no rompen el diseño y que no se solicitan recursos externos.

## Condición de finalización

Se considerará terminada la implementación cuando los casos automatizados pasen, el build produzca los archivos estáticos, los criterios de aceptación estén cubiertos y se documenten los resultados de las verificaciones manuales y cualquier limitación pendiente. No se publicará ni desplegará la aplicación.
