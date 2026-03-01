# language: es
Característica: Envío del formulario NIS
  Como usuario quiero enviar el cuestionario NIS y ver la confirmación correcta
  según la respuesta del servidor (éxito, error o CORS).

  Escenario: Envío exitoso cuando el backend acepta el envío
    Dado que la aplicación está abierta
    Y que el backend acepta el envío
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal de envío exitoso
    Y el modal muestra un ID de envío

  Escenario: Se muestra error cuando el backend falla
    Dado que la aplicación está abierta
    Y que el backend devuelve error de servidor
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario hace clic en Enviar
    Entonces se muestra un modal de error

  Escenario: Se muestra confirmación CORS cuando la red falla
    Dado que la aplicación está abierta
    Y que el backend simula fallo de red
    Cuando el usuario rellena los datos mínimos de empresa
    Y el usuario hace clic en Enviar
    Entonces se muestra el modal "Enviado" con enlace de confirmación
