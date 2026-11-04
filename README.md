# MAXY · Calculadora personal

Calculadora web gratuita y adaptable a móvil y escritorio, sin cuentas, servicios externos ni dependencias. Implementa el alcance de `PLAN.md` con JavaScript nativo.

## Ejecutar y verificar

Requiere Node.js 22.8 o posterior para pruebas y build (verificado con 22.23.3). No hace falta `npm install`.

```powershell
npm test
npm run build
```

El build copia únicamente los cinco archivos de la aplicación a `dist/`, sin borrar directorios. Para abrirla en un navegador, si se permite servir en loopback y está disponible Python:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:8000` y detener con `Ctrl+C`. Los módulos ES requieren un servidor HTTP: no abrir `index.html` con `file://`. No hay recursos remotos; una página ya cargada sigue calculando sin conexión. No se incluye caché para recargar sin servidor.

## Uso

- Escribe una expresión o usa los botones. `Enter` calcula desde el campo de expresión y `Escape` limpia. AC conserva Ans y el historial; ⌫ borra la selección o el carácter anterior al cursor.
- Usa enteros, punto o coma decimal, notación científica (`1e-3`), paréntesis y signos. No uses separadores de miles. La multiplicación es explícita: `2*(3+4)`.
- Operaciones: `+`, `-`, `*`, `/`, `^` y `%`. La potencia asocia por la derecha: `2^3^2 = 512`; `-2^2 = -4`; `2^-2 = 0,25`. Se adopta `0^0 = 1`, como JavaScript.
- `%` divide el operando entre 100: `50% = 0,5`, `200*10% = 20`, `200+10% = 200,1`.
- Despliega las funciones científicas: `sqrt`, `abs`, `ln`, `log` (base 10), `sin`, `cos`, `tan`, constantes `pi`/`π` y `e`. Las funciones requieren paréntesis.
- DEG (inicial) usa grados y RAD usa radianes. Por ejemplo, `sin(30)` en DEG da `0,5`.
- `Ans` reutiliza el valor interno del último resultado válido (inicialmente 0). El historial guarda 20 operaciones durante la sesión. Recuperar una operación también restaura su modo angular y el valor de Ans utilizado, para reproducirla. Recargar la página borra el estado.

## Precisión y límites

Los resultados se muestran con hasta tres decimales, sin ceros sobrantes. `≈` indica que la presentación está redondeada; Ans mantiene la precisión interna. Valores no nulos menores de `0,001` o mayores o iguales a `10^12` usan notación científica con hasta tres decimales en la mantisa.

Se usa `Number` de JavaScript (IEEE 754), no precisión decimal arbitraria. Los enteros fuera del rango seguro muestran una advertencia. Los valores por debajo del rango representable pueden convertirse en cero; las funciones trigonométricas son aproximadas y la tangente se rechaza cuando el coseno del ángulo tiene magnitud menor de `10^-14`. Se rechazan divisiones por cero, dominios no reales y resultados no finitos. No resuelve ecuaciones simbólicas ni números complejos.

Entrada limitada a 1000 caracteres y 80 niveles recursivos. El parser usa una lista de tokens permitidos, sin `eval` ni `Function`; el DOM muestra entradas como texto.

## Validación

`npm test` ejecuta pruebas nativas de Node sobre precedencia, decimales, funciones, errores, límites, formato y eventos de interfaz mediante un doble DOM local. Estas últimas comprueban edición, teclado, Ans, recuperación de historial y modos angulares; no sustituyen una prueba de navegador.

Verificación del cambio a MAXY: 80 pruebas aprobadas, build generado correctamente y `git diff --check` sin errores. Las pruebas de aceptación adicionales combinan evaluación y formato, incluidos operandos con más de tres decimales y reutilización de Ans sin redondear. El script de pruebas usa `--experimental-test-isolation=none` para ejecutar la suite en un solo proceso.

La revisión visual manual a 320 px, tableta, escritorio y zoom al 200 %, así como la comprobación con lector de pantalla, queda pendiente: no se ha usado red, servidor local ni herramientas de navegador en esta implementación. El diseño incluye controles de al menos 44 px, foco visible, región de estado, etiquetas accesibles y respeto por movimiento reducido.
