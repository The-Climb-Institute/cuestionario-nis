# language: es
Característica: Selector de Año de Reporte (Task 12)
  Como usuario quiero que el selector de año funcione correctamente con bloqueo automático,
  estado post-envío de solo lectura, y comportamiento responsive consistente.

  Escenario: Año anterior seleccionado por defecto
    Dado que la aplicación está abierta
    Entonces el selector de año muestra el año anterior como seleccionado por defecto
    Y la etiqueta de año seleccionada muestra el año anterior
    Y la etiqueta no seleccionada muestra el año actual con opacidad menor a 1

  Escenario: Usuario no puede cambiar año tras completar un campo no-empresa
    Dado que la aplicación está abierta
    Y el año anterior está seleccionado
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario rellena un valor en "¿La empresa reporta emisiones de GEI" (primer campo no-empresa)
    Entonces el selector de año está deshabilitado y no permite cambios
    Y el riel de año muestra estado visual bloqueado
    Y intentar cambiar el año no tiene efecto

  Escenario: Usuario puede cambiar año mientras solo rellena campos de empresa
    Dado que la aplicación está abierta
    Y el año anterior está seleccionado
    Cuando el usuario rellena solo campos de empresa (nombre, país, región, sector, empleados, ingresos)
    Entonces el selector de año sigue habilitado y permite cambios
    Y el usuario puede cambiar entre año actual y año anterior sin restricción
    Y el bloque anual visible se actualiza al año seleccionado

  Escenario: Envío exitoso mantiene selector visible y usable
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario rellena valores numéricos en al menos un campo no-empresa
    Y el usuario hace clic en Enviar
    Y se muestra el modal de envío exitoso
    Entonces el selector de año sigue visible
    Y las etiquetas de año están visibles

  Escenario: Scroll reduce opacidad del año no seleccionado
    Dado que la aplicación está abierta
    Cuando el usuario desplaza la página hacia abajo
    Entonces el año no seleccionado se desvanece (opacity fade) conforme se desplaza

  Escenario: Etiquetas de año responden a cambios desde el selector
    Dado que la aplicación está abierta
    Y el año anterior está seleccionado
    Cuando el usuario cambia el año al año actual
    Entonces la etiqueta seleccionada muestra el año actual
    Y el bloque anual visible se actualiza al año seleccionado

  Escenario: Diseño responsivo - riel en escritorio
    Dado que la aplicación está abierta en una pantalla de escritorio (≥768px)
    Entonces el riel de año usa posición sticky
    Y las etiquetas de año están visibles

  Escenario: Diseño responsivo - riel en móvil
    Dado que la aplicación está abierta en una pantalla móvil (<768px)
    Entonces el riel de año no usa posición sticky
    Y las etiquetas de año están visibles
