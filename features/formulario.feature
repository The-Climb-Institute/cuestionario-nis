# language: es
Característica: Envío del formulario NIS
  Como usuario quiero enviar el cuestionario NIS y ver la confirmación correcta
  según la respuesta del servidor. En producción, OpenFormStack suele impedir leer el
  cuerpo de la respuesta por CORS; el escenario principal de éxito alinea con esa realidad.

  Escenario: Envío exitoso cuando no se puede leer la respuesta (flujo canónico CORS)
    Dado que la aplicación está abierta
    Y el backend está configurado para simular fallo de red
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal "Enviado" con enlace de confirmación

  Escenario: Envío exitoso cuando el backend devuelve JSON legible (secundario)
    Dado que la aplicación está abierta
    Y el backend está configurado para aceptar el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso
    Y el modal muestra un ID de envío

  Escenario: Se muestra error cuando el backend responde con fallo
    Dado que la aplicación está abierta
    Y el backend está configurado para responder con error de servidor
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario hace clic en Enviar
    Entonces se muestra un modal de error
