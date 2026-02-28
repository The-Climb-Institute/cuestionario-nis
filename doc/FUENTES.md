# Fuentes del cuestionario

El texto de las preguntas y las instrucciones del formulario provienen del **Cuestionario Maestro** oficial:

- **Archivo:** `input-assets/251217_CLIMB_cuestionario_2.0.docx`
- **Ubicación:** La carpeta `input-assets` en la raíz de este proyecto es un enlace simbólico a `../../input-assets` (workspace The Climb Institute). El DOCX está en esa carpeta.
- **Versión referida en el DOCX:** 18 de diciembre 2025

Secciones mapeadas:

- **E1.1** (Sección Ambiental): indicadores ambientales (emisiones GEI, energía, agua, residuos, ozono, alcance 3, estrés hídrico, biodiversidad).
- **E1.3** (Sección social): capacitación, evaluación de desempeño, tasa de accidentes.
- **E1.4**: políticas de igualdad y no discriminación.
- **E1.5** (Gobernanza): sistema de riesgos, órgano de vigilancia, estrategia de sostenibilidad, código de ética, políticas de datos, canal de denuncias.
- **E1.6–E1.8**: consejo de administración y composición.
- **E1.9**: incidentes cibernéticos.

Las **preguntas de aplicabilidad** (¿La empresa reporta emisiones…?, ¿utiliza agua…?, etc.) no vienen del DOCX: el documento usa “No Aplica = 999”. En el formulario en línea se añadieron esas preguntas Sí/No para ocultar bloques que no aplican y mejorar la experiencia de respuesta.

---

## Alineación con el formulario original (data-analysis)

El proyecto **data-analysis** usa datos del mismo cuestionario exportados a XLSX (`data/input/surveys/`, `data/output/pipeline/climb_institute_derived.csv`). Las columnas de ese Excel son las preguntas del **formulario original** (hermano del DOCX: mismo contenido pero implementado en otra herramienta).

- **Preguntas NIS (E1.1–E1.9):** En data-analysis las columnas tienen la misma raíz (p. ej. “Contesta los siguientes indicadores ambientales… >> ¿Cuántas toneladas… >> 2024/2025”). El formulario NIS en línea usa los mismos textos del DOCX; los IDs de campo (`gei_alcance1`, `energia_kwh`, etc.) permiten mapear a esas columnas si se unifican datos (p. ej. un valor por año).
- **Incidentes de riesgo:** No forma parte del bloque NIS en el DOCX. En el DOCX aparece como **C1.1** (Risk Management): “En los últimos **dos años**, ¿cuántos incidentes de riesgo **materializados**…?” con respuesta categórica (Ninguno, 1–5, 6–10, Más de 10). En cambio, el **formulario original que alimenta data-analysis** ya trae la pregunta con “En los últimos **12 meses**…” y la definición larga de “incidente de riesgo”, en formato **numérico** y por año (columnas >> 2024 y >> 2025). La pregunta del formulario NIS se alineó con ese formulario original (12 meses, misma definición en help), para que el dato sea comparable cuando se integre con data-analysis. Si en el futuro el pipeline espera 2024/2025 por separado, habría que enviar o derivar dos valores (p. ej. año actual y anterior).
