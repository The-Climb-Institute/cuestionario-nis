# language: es
Característica: Selector de Año de Reporte (Task 12)
  Como usuario quiero que el selector de año funcione correctamente con bloqueo automático,
  estado post-envío de solo lectura, y efectos visuales del cilindro 3D.

  Escenario: Año anterior seleccionado por defecto
    Dado que la aplicación está abierta
    Entonces el selector de año muestra el año anterior como seleccionado por defecto
    Y el cilindro del año muestra el año anterior en la cara frontal (visible)
    Y el año actual está envuelto alrededor del borde superior del cilindro (visualmente subordinado)

  Escenario: Usuario no puede cambiar año después de completar primer campo no-empresa
    Dado que la aplicación está abierta
    Y el año anterior está seleccionado
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario rellena un valor en "¿La empresa reporta emisiones de GEI" (primer campo no-empresa)
    Entonces el selector de año está deshabilitado y no permite cambios
    Y intentar cambiar el año no tiene efecto

  Escenario: Usuario puede cambiar año mientras solo rellena campos de empresa
    Dado que la aplicación está abierta
    Y el año anterior está seleccionado
    Cuando el usuario rellena solo campos de empresa (nombre, país, región, sector, empleados, ingresos)
    Entonces el selector de año sigue habilitado y permite cambios
    Y el usuario puede cambiar entre año actual y año anterior sin restricción

  Escenario: Botón Limpiar desbloquea el año y resetea todos los datos
    Dado que la aplicación está abierta
    Y el usuario ha completado un campo no-empresa (año bloqueado)
    Cuando el usuario hace clic en el botón "Limpiar"
    Entonces el formulario se borra completamente
    Y el selector de año se desbloquea y permite cambios nuevamente
    Y el año anterior vuelve a estar seleccionado por defecto

  Escenario: Formulario en modo solo-lectura después de envío exitoso
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario rellena valores numéricos en al menos un campo no-empresa
    Y el usuario hace clic en Enviar
    Y se muestra el modal de envío exitoso
    Entonces todos los campos del formulario están deshabilitados (modo solo-lectura)
    Y el selector de año está deshabilitado
    Y el botón Limpiar está deshabilitado
    Y el botón Enviar está deshabilitado
    Y el formulario muestra estilo atenuado (grey/disabled appearance)

  Escenario: Cilindro muestra efecto scroll-linking durante desplazamiento
    Dado que la aplicación está abierta
    Cuando el usuario desplaza la página hacia abajo
    Entonces el cilindro del año rota gradualmente (efecto de tambor rotatorio)
    Y el año no seleccionado se desvanece (opacity fade) conforme se desplaza
    Y el efecto es continuo y suave (sin saltos)

  Escenario: Cilindro responde a cambios de año
    Dado que la aplicación está abierta
    Y el año anterior está seleccionado
    Cuando el usuario cambia el año al año actual
    Entonces el cilindro actualiza inmediatamente para mostrar el año actual en la cara frontal
    Y el año anterior se envuelve alrededor del borde superior
    Y la transición es visualmente clara

  Escenario: Diseño responsivo - Cilindro en escritorio
    Dado que la aplicación está abierta en una pantalla de escritorio (≥768px)
    Entonces el cilindro del año es vertical y está fijo en el lado izquierdo (60px de ancho)
    Y el cilindro tiene perspectiva 3D (280px) con altura 120px y ancho 44px
    Y el formulario está centrado con padding-left: 60px para evitar solapamiento
    Y el año se lee de abajo a arriba (rotación 90 grados)

  Escenario: Diseño responsivo - Cilindro en móvil
    Dado que la aplicación está abierta en una pantalla móvil (<768px)
    Entonces el cilindro del año es horizontal y está centrado sobre el formulario
    Y el cilindro tiene perspectiva 3D (200px) con ancho 160px y altura 52px
    Y el año seleccionado se muestra en la cara derecha (22px, color dorado)
    Y el año no seleccionado se muestra en la cara izquierda (14px, color gris, rotateY: 60deg)
    Y el selector nativo (<select>) está minimizado (9-10px font, sin borde, fondo transparente)
