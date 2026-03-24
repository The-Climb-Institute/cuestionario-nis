# language: es
Característica: Comportamiento del formulario NIS en escenarios límite
  Como evaluador quiero que el formulario no falle ante respuestas atípicas o caminos
  que un usuario real podría seguir (vacíos, "No sé", condicionales cambiantes, etc.).

  # --- Formulario vacío y datos mínimos ---
  Escenario: Enviar sin consentimiento muestra aviso de privacidad antes de validación
    Dado que la aplicación está abierta
    Cuando el usuario hace clic en Enviar sin rellenar ningún campo
    Entonces se muestra el modal de aviso de privacidad
    Y el formulario sigue visible y usable

  Escenario: Solo datos de empresa con todas las condicionales en No
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario deja todas las preguntas de aplicabilidad en "No" en Ambiental, Social y Gobernanza
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso
    Y la aplicación no ha crasheado

  # --- Condicionales: cambiar Sí a No ---
  Escenario: Usuario marca Sí en aplicabilidad y luego cambia a No antes de enviar
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario selecciona "Sí" en "¿La empresa reporta emisiones de GEI"
    Y el usuario rellena un valor numérico en emisiones alcance 1
    Y el usuario cambia a "No" en "¿La empresa reporta emisiones de GEI"
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso
    Y la aplicación no ha crasheado

  # --- "No sé" y valores numéricos ---
  Escenario: Campos numéricos con "No sé" marcado sin valor
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario marca "No sé" en "Número de empleados" sin escribir número
    Y el usuario marca "No sé" en "Ingresos anuales" sin escribir número
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso
    Y la aplicación no ha crasheado

  Escenario: Valor numérico cero en campo con "No sé"
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario escribe "0" en "Número de empleados"
    Y el usuario escribe "0" en "Ingresos anuales"
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  # --- Camino máximo: todas las condicionales Sí ---
  Escenario: Usuario responde Sí a todas las aplicabilidades y rellena campos visibles
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario selecciona "Sí" en todas las preguntas de aplicabilidad de Ambiental
    Y el usuario rellena valores numéricos válidos en los campos visibles de Ambiental del año actual
    Y el usuario selecciona "Sí" en las preguntas de aplicabilidad de Social
    Y el usuario rellena valores numéricos válidos en los campos visibles de Social del año actual
    Y el usuario selecciona "Sí" en las preguntas de aplicabilidad de Gobernanza
    Y el usuario rellena valores válidos en los campos visibles de Gobernanza del año actual
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  # --- Energía bimestral ---
  Escenario: Consumo de energía en modo bimestral con un solo periodo
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario selecciona "Sí" en "¿La empresa reporta emisiones de GEI"
    Y el usuario selecciona "Por recibo bimestral" en consumo de energía
    Y el usuario añade un periodo bimestral con kWh mayor que cero
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  # --- Matriz (composición liderazgo) ---
  Escenario: Matriz de liderazgo parcialmente rellenada
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario selecciona "Sí" en políticas de igualdad o preguntas que muestran la matriz
    Y el usuario rellena solo algunas celdas de "Composición de puestos de liderazgo"
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  # --- Año anterior (multi-año) ---
  Escenario: Usuario añade año anterior y rellena solo el año actual
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario añade un bloque de año anterior si existe el control
    Y el usuario deja todas las preguntas de aplicabilidad en "No" en Ambiental, Social y Gobernanza
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  # --- Caracteres especiales y texto ---
  Escenario: Nombre de empresa con caracteres especiales
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario escribe en "Nombre legal" el valor "Empresa S.A. de C.V. (México) — 2024"
    Y el usuario rellena el resto de datos mínimos de empresa excepto nombre
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  # --- País y región ---
  Escenario: Usuario selecciona país y región antes de enviar
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario selecciona un país que tiene regiones si está disponible
    Y el usuario selecciona una región si el campo está visible
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  # --- Porcentajes en rango ---
  Escenario: Porcentaje 0 y 100 en campos con min/max
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario selecciona "Sí" en "¿La empresa reporta emisiones de GEI"
    Y el usuario rellena "0" en "¿Qué porcentaje de la energía usada es renovable?"
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  Escenario: Porcentaje 100 en campo de energía renovable
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario selecciona "Sí" en "¿La empresa reporta emisiones de GEI"
    Y el usuario rellena "100" en "¿Qué porcentaje de la energía usada es renovable?"
    Y el usuario rellena el resto de campos numéricos de emisiones y energía
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso o el modal de validación
    Y la aplicación no ha crasheado

  # --- Doble clic en Enviar ---
  Escenario: Usuario hace doble clic rápido en Enviar
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario hace doble clic en el botón Enviar
    Entonces la aplicación no crashea
    Y se muestra un único modal de envío o de validación

