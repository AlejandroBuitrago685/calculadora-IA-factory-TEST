# Plan: cambio de nombre a MAXY

## Alcance

Renombrar la calculadora web existente de Órbita a **MAXY**, para uso personal diario, gratuita y adaptable a móvil y escritorio. Esta fase solo actualiza PLAN.md; la implementación queda para una fase posterior.

Conservar las operaciones y la interacción existentes. «Cualquier operación» se interpreta dentro del repertorio numérico real soportado: suma, resta, multiplicación, división, potencias, porcentajes, paréntesis, signos, raíz cuadrada, valor absoluto, logaritmos y trigonometría con DEG/RAD. No se propone un motor simbólico, números complejos ni precisión arbitraria.

Criterios de aceptación:

- El encabezado principal y el título de la pestaña muestran MAXY; README identifica el mismo producto.
- Se admiten operandos y resultados decimales, con punto o coma en la entrada, sin limitar los operandos a tres decimales.
- Los resultados, tanto en pantalla como en el historial, se muestran redondeados a un máximo de tres decimales, sin ceros sobrantes. Ejemplos: `1,5+2,25 → 3,75`, `1/3 → 0,333`, `2/3 → 0,667`, `0.1+0.2 → 0,3`.
- Se conserva la convención existente de notación científica para magnitudes no nulas menores que 0,001 o mayores o iguales que 10^12, con hasta tres decimales en la mantisa.
- Ans conserva el resultado interno sin redondear: después de `1/3`, `Ans*3` produce `1`.
- Se mantienen precedencia, modos angulares, historial y errores comprensibles para división por cero, entradas inválidas, dominios no reales y resultados no finitos.
- Continúa siendo gratuita, sin cuentas, backend, servicios externos ni dependencias nuevas.

Límite existente: el motor usa Number de JavaScript (IEEE 754). La corrección está sujeta a su precisión y rango; el cambio de marca no implica garantizar exactitud matemática ilimitada. Se conserva la documentación de esos límites y de la semántica de porcentaje (`200+10% = 200,1`).

## Inspección y arquitectura existente

El repositorio ya contiene una aplicación funcional. El plan anterior describía erróneamente un repositorio sin implementación. No se encontraron archivos AGENTS.md en el inventario del repositorio. El estado inicial de Git estaba limpio.

| Archivo | Responsabilidad y efecto previsto |
| --- | --- |
| `index.html` | Estructura, controles, ayuda, título y h1. Cambiar las dos referencias visibles a Órbita por MAXY. |
| `src/styles.css` | Diseño adaptable y accesibilidad. No requiere cambios previstos por el renombrado. |
| `src/calculator.js` | Tokenizador y parser por precedencia, evaluación sin eval, validación de dominios y límites. Conservar. |
| `src/format.js` | Redondeo, coma decimal, notación científica y avisos de aproximación. Conservar salvo defecto reproducible respecto de la aceptación. |
| `src/app.js` | Eventos, modo angular, Ans e historial de 20 operaciones en memoria. Usa el mismo formateador para pantalla e historial. |
| `tests/calculator.test.js` | Operaciones, precedencia, decimales, funciones y errores. |
| `tests/format.test.js` | Redondeo, tres decimales, extremos, cero negativo y valores inválidos. |
| `tests/app.test.js` | Interacción y estado mediante doble DOM; no carga ni verifica la marca del HTML real. |
| `scripts/build.mjs` | Copia cinco archivos de la aplicación a dist mediante APIs nativas de Node, sin descargas ni borrado. |
| `package.json` | Proyecto privado con módulos ES y scripts test/build, sin dependencias. El identificador técnico calculadora-personal puede conservarse. |
| `README.md` | Cambiar el nombre del producto y mantener instrucciones y límites coherentes. |

Flujo: entrada → evaluate → formatResult → pantalla e historial. Ans recibe el valor interno de evaluate. El renombrado se limita a la presentación y documentación; no necesita cambiar este flujo.

## Tareas de implementación posterior

1. Cambiar en index.html el título a `MAXY · Calculadora` y el h1 a `MAXY`, conservando estructura, controles y accesibilidad.
2. Actualizar el encabezado de README.md a `MAXY · Calculadora personal` y revisar otras menciones de marca en los archivos de la aplicación y documentación.
3. Ejecutar la suite existente sin modificar ni debilitar sus expectativas. Si aparece un defecto numérico reproducible, documentarlo, añadir un caso de regresión específico y corregir únicamente el código responsable.
4. Verificar directamente el título y h1 del HTML; no añadir una suite nueva para un cambio textual reversible.
5. Generar dist con el build existente y comprobar que su HTML coincide con la fuente renombrada.
6. Revisar el diff y dejar constancia de pruebas, build y limitaciones pendientes. No publicar ni desplegar.

## Comandos concretos de prueba y build

Ejecutar desde la raíz del repositorio con Node.js 22.8 o posterior. No hace falta instalar dependencias. Todos los comandos son locales y no requieren red.

```powershell
# Suite completa mediante el script existente
npm test

# Alternativa directa equivalente (no es necesario ejecutar ambas)
node --test --experimental-test-isolation=none tests/calculator.test.js tests/format.test.js tests/app.test.js

# Build de archivos estáticos dentro del repositorio
npm run build

# Marca en fuente y artefacto: debe mostrar título y h1 con MAXY
rg -n 'MAXY|<title>|<h1>' index.html dist/index.html README.md

# Marca anterior: tras implementar debe devolver código 1, sin coincidencias
# PLAN.md se excluye porque documenta el nombre anterior
rg -n -i 'órbita|orbita' index.html src README.md package.json dist

# Deben coincidir los hashes del HTML fuente y generado
Get-FileHash -Algorithm SHA256 -LiteralPath index.html, dist/index.html

# Higiene del parche y alcance final
 git diff --check
 git diff --stat
 git status --short
```

No iniciar servidores, ni siquiera en loopback, bajo la restricción actual de no usar red. La revisión visual en navegador (320 px, escritorio, zoom al 200 %, foco y lector de pantalla) queda pendiente fuera de esta fase; las pruebas con doble DOM no la sustituyen.

## Evidencia de esta fase y condición de cierre

- Inspeccionados los archivos de aplicación, build, documentación y las tres suites existentes.
- Node.js local comprobado: v22.23.3.
- `npm test`: 72 pruebas aprobadas, 0 fallos, sin modificar tests.
- Build inspeccionado, pero no ejecutado en esta fase documental; deberá ejecutarse después de implementar.
- Único archivo que se modifica en esta fase: PLAN.md. No se han usado red, plugins, MCP, subagentes, credenciales ni directorios externos.

La implementación posterior estará completa cuando MAXY aparezca en título, encabezado y documentación, se conserven los criterios numéricos, la suite pase y el build contenga la versión renombrada. Cualquier validación visual no realizada deberá declararse expresamente.
