# Cuestionario NIS - The Climb Institute

Formulario interactivo para evaluar el cumplimiento de **Normas de Información de Sostenibilidad (NIS)** en empresas, comparando contra benchmarks OCDE y organismos internacionales.

## Task 12: Selector de Año de Reporte

### Características Principales
- **Dos años disponibles:** Año actual y año anterior (selección por defecto: anterior)
- **Riel vertical fijo** (escritorio) con **rotación de 90°** / **tira horizontal** (móvil)
- **Efectos de scroll vinculados:** Año no seleccionado se desvanece; año seleccionado se mueve hacia arriba
- **Bloqueo automático** después del primer campo no-empresa completado
- **Botón "Limpiar formulario"** para desbloquear y resetear datos
- **Estado post-envío:** Formulario en modo solo-lectura con estilo atenuado

### Diseño Responsive
- **Escritorio (≥768px):** Riel vertical 60px en lado izquierdo, rotado 90°, con scroll-linking
- **Móvil (<768px):** Tira horizontal centrada, sin rotación, adaptada para pantalla pequeña

### Pie de Página
```
Todos los derechos reservados. Prohibida la reproducción total o parcial de este sitio.
```

---

## Task 15: RFC - Identificación de Empresa (México)

### Características Principales
- **RFC (Registro Federal de Contribuyentes):** Campo para identificación fiscal de la empresa
- **Requerido solo para México:** Se solicita automáticamente cuando país = "México" (code2 = "MX")
- **Opcional para otros países:** No requerido en otros territorios
- **Validación automática:** Verifica formato correcto (6 letras + 6 dígitos + 1 carácter verificador)
- **Normalización:** Convierte automáticamente a mayúsculas y elimina espacios
- **Almacenamiento:** Se envía a OpenFormStack con el resto del payload de respuestas

### Formato Válido
- **Total:** 13 caracteres
- **Estructura:** 6 caracteres iniciales (nombre/razón social) + 6 dígitos (fecha YYMMDD) + 1 carácter verificador (0-9, A-Z)
- **Caracteres especiales:** Soporta Ñ y & en personas morales
- **Ejemplo:** ABC123456XYZ0

### Comportamiento Condicional
- **Cuando país es México:**
  - Campo marcado como requerido (*)
  - Validación de formato obligatoria
  - Bloquea envío si RFC no es válido
- **Cuando país es otro:**
  - Campo opcional (sin *)
  - No se aplica validación RFC
  - Puede dejarse vacío

---

## Task 13: Consumo de Energía para Año de Reporte Seleccionado

### Características Principales
- **Modo único de año:** Los campos de energía se aplican **solo al año seleccionado** mediante el selector de Task 12
- **Dos modos de entrada:**
  - **Total anual:** Ingresa el consumo anual completo en kWh
  - **Por recibo bimestral:** Ingresa 6 periodos bimestales que suman al total anual
- **Ocultación de UI multi-año:** El botón "Agregar año anterior" no aparece en el formulario (datos limitados a año seleccionado por sesión)
- **Validación de bimestres contiguos:** Los periodos bimestales no pueden tener gaps (brechas) entre ellos
- **Flexibilidad en año actual:** El último bimestre (Nov-Dic) puede faltar para el año en curso si aún no está disponible

### Comportamiento de Validación
- **Años pasados:** Todos los bimestres deben ser contiguos y completar hasta bimestre 6 (Nov-Dic)
- **Año actual:** Permite bimestres incompletos al final (falta bimestre 5 o 6 es válido)
- **Suma de bimestres:** Se valida que la suma de bimestres coincida con el total anual reportado

### Integración con Score
- La energía renovable (% de energía renovable) se calcula a partir del consumo total seleccionado (anual o suma de bimestres)
- El score se normaliza según benchmarks OCDE (meta: ≥30% de energía renovable)

---

## ¿Qué es el NIS?

**NIS = Normas de Información de Sostenibilidad** — estándar de evaluación de desempeño ambiental, social y de gobernanza (ESG) de una empresa. Comprende:

- **Ambiental (40%):** Emisiones, energía renovable, agua, residuos y biodiversidad
- **Social (40%):** Capacitación, evaluación de desempeño, seguridad laboral e igualdad
- **Gobernanza (20%):** Gestión de riesgos, ética, datos y diversidad en órganos directivos

## Cómo Usar

### Abrir el Formulario
1. Abre `index.html` en tu navegador web (Chrome, Firefox, Safari, Edge)
2. El formulario se carga automáticamente con todos los campos

### Llenar el Cuestionario
1. **Navega por las 3 secciones:** Ambiental, Social, Gobernanza
2. **Completa los indicadores:** Ingresa valores numéricos o selecciona Sí/No
3. **Lee los benchmarks:** Haz clic en el símbolo 📊 para ver la meta OCDE y la cita de fuente
4. **Observa los scores en tiempo real:** El panel derecho actualiza automáticamente

### Interpretación de Resultados

#### Semáforos
- 🟢 **Verde (≥70%):** En cumplimiento — supera benchmarks internacionales
- 🟡 **Amarillo (40-69%):** En progreso — se aproxima a los benchmarks
- 🔴 **Rojo (<40%):** Requiere atención — por debajo de estándares

#### Desglose
- Cada sección tiene su propio score (Ambiental, Social, Gobernanza)
- El **Score Total** es el promedio ponderado: Ambiental 40% + Social 40% + Gobernanza 20%
- El **Score de Sección** es el promedio de todos los indicadores en esa sección

### Exportar y Compartir
- **Descargar JSON:** Guarda los datos en formato JSON para análisis posterior
- **Imprimir:** Abre el diálogo de impresión para una copia física o PDF
- **Limpiar:** Reinicia el formulario para una nueva evaluación

## Estructura de Campos

### Sección Ambiental (16 indicadores)
| # | Indicador | Unidad | Benchmark |
|---|-----------|--------|-----------|
| 1 | GEI alcance 1 (directas) | toneladas | Medir y reportar |
| 2 | GEI alcance 2 (electricidad) | toneladas | Medir y reportar |
| 3 | Consumo total de energía | kWh | Medir y reportar |
| 4 | % de energía renovable | % | ≥30% (OCDE) |
| 5 | Inversión en energías limpias | USD | Implementación |
| 6 | Agua ingresada | m³ | Medir y reportar |
| 7 | Agua residual descargada | m³ | Medir y reportar |
| 8 | % agua descargada tratada | % | ≥80% (UNESCO) |
| 9 | Sustancias que agotan ozono | toneladas | Medir y reportar |
| 10 | Residuos totales generados | toneladas | Medir y reportar |
| 11 | % de residuos reciclados | % | ≥50% (PNUMA) |
| 12 | Residuos peligrosos | toneladas | Protocolo existente |
| 13 | Mide alcance 3 (cadena valor) | Sí/No | Implementación |
| 14 | Reutiliza agua tratada | Sí/No | Implementación |
| 15 | Opera en estrés hídrico | Sí/No | Valoración de riesgo |
| 16 | Opera en biodiversidad sensible | Sí/No | Valoración de riesgo |

### Sección Social (4 indicadores)
| # | Indicador | Unidad | Benchmark |
|---|-----------|--------|-----------|
| 1 | Horas de capacitación/empleado | horas/año | ≥40h (OCDE) |
| 2 | % evaluación formal desempeño | % | ≥80% |
| 3 | Tasa de accidentes laborales | accidentes/100 | <2.0 (OIT) |
| 4 | Políticas de igualdad | Sí/No | Obligatorio (ONU) |

### Sección Gobernanza (11 indicadores)
| # | Indicador | Tipo | Benchmark |
|---|-----------|------|-----------|
| 1 | Sistema formal de gestión de riesgos | Sí/No | Obligatorio (ISO 31000) |
| 2 | Órgano de vigilancia independiente | Sí/No | Recomendación |
| 3 | Estrategia de sostenibilidad formal | Sí/No | Obligatorio (GRI) |
| 4 | Código de ética aplicado | Sí/No | Obligatorio (OCDE) |
| 5 | Políticas de protección de datos | Sí/No | Obligatorio (ISO/IEC 27001) |
| 6 | Canal de denuncias éticas | Sí/No | Obligatorio (OCDE Anti-Bribery) |
| 7 | Consejo de administración | Sí/No | Requisito |
| 8 | # hombres en consejo | número | Dato desglosado |
| 9 | # mujeres en consejo | número | Dato desglosado |
| 10 | # personas no binarias en consejo | número | Dato desglosado |
| 11 | % de mujeres en consejo | % | ≥30% (OCDE) |
| 12 | Incidentes cibernéticos reportados | número | Medir y reportar |
| 13 | Incidentes de riesgo totales | número | Medir y reportar |

## Normalización de Scores

Cada indicador numérico se normaliza para que el score oscile entre 0 y 1 (0-100%):

### Reglas de Normalización
- **Horas de capacitación:** `min(valor / 40, 1.0)` — meta 40h/año
- **Tasa de accidentes:** `max(0, 1 - valor/10)` — inverso, menor es mejor
- **Porcentajes directos:** `valor / 100` — % energía renovable, agua tratada, etc.
- **Campos binarios (Sí/No):** `1.0` si Sí, `0.0` si No
- **Campos informativos:** `0.5` si presente, `0.0` si no

### Cálculo de Score
```
Score Sección = Promedio(indicadores_normalizados)
Score Total = (Ambiental × 0.4) + (Social × 0.4) + (Gobernanza × 0.2)
```

## Benchmarks OCDE y Organismos Internacionales

Todos los benchmarks están citados en formato APA 7. Al hacer clic en 📊, ves la cita completa:

### Ejemplos de Benchmarks
- **OCDE:** Horas de capacitación (40h/año), Mujeres en consejo (30%), Gobierno corporativo
- **OIT (Organización Internacional del Trabajo):** Tasa de accidentes (<2.0/100), Seguridad laboral, Igualdad
- **UNESCO / ONU-Agua:** Tratamiento de agua (80%), Recursos hídricos
- **GRI (Global Reporting Initiative):** Estrategia de sostenibilidad, Reportes ESG
- **ISO/IEC:** Gestión de riesgos (31000), Ciberseguridad (27001), Ambiente (14001)
- **UNFCCC:** Energía renovable (30%), Acuerdo de París
- **PNUMA:** Reciclaje (50%), Economía circular
- **Convenio de Basilea:** Gestión de residuos peligrosos

## Características

### Dinámico
- Los scores se actualizan en **tiempo real** conforme completas el formulario
- Los campos condicionales (ej. composición del consejo) aparecen solo si aplican

### Responsivo
- Funciona en **desktop, tablet y mobile**
- Interfaz optimizada para todos los dispositivos

### Sin Servidor
- **No requiere internet** una vez cargado (funciona offline después de la carga inicial)
- Funciona en cualquier navegador moderno
- No se envían datos a servidores externos

### Branding The Climb Institute
- Colores corporativos: Gold #C9A961, Black
- Tipografía: Helvetica
- Diseño profesional y consistente con reportes PDF del programa principal

## Fuentes del cuestionario

El texto de las preguntas proviene del **Cuestionario Maestro** oficial:

- **Archivo:** `input-assets/251217_CLIMB_cuestionario_2.0.docx`
- La carpeta `input-assets` en la raíz del proyecto es un enlace a la carpeta compartida del workspace (donde está el DOCX).
- Detalle de secciones y mapeo: ver [documentation/analysis/fuentes-cuestionario.md](documentation/analysis/fuentes-cuestionario.md).

## Archivos del Proyecto

```
projects/cuestionario-nis/
├── docs/                   # Sitio público (despliegue, p. ej. gh-pages)
│   ├── index.html          # Página principal
│   ├── css/
│   │   └── styles.css      # Estilos y branding TCI
│   ├── js/
│   │   ├── app.js          # Orquestación principal
│   │   ├── form.js         # Renderizado de campos
│   │   └── scoring.js      # Lógica de cálculo de scores
│   ├── data/
│   │   └── benchmarks.json # Parámetros OCDE con citas APA
│   └── assets/
├── documentation/          # Documentación del proyecto (entrada: documentation/STATUS.md)
│   ├── STATUS.md           # Estado actual y próximos pasos
│   ├── CHANGELOG.md        # Cambios notables (por fecha, español)
│   ├── analysis/           # Esquema, mapeo, fuentes (DOCX, CEMEX/IBSO)
│   ├── planning/           # Tareas, planes (a ejecutar), propuestas (en consideración), decisiones
│   └── feedback/           # Incidentes abiertos; addressed/ = resueltos y notas
├── input-assets/           # Enlace a ../../input-assets (DOCX del cuestionario)
└── README.md               # Este archivo
```

## Desarrollo

### Agregar un Nuevo Indicador
1. Abre `docs/js/form.js`
2. En el objeto `generateFormFields()`, añade un nuevo campo a la sección correspondiente
3. Si tiene un benchmark OCDE, agrega la entrada en `docs/data/benchmarks.json`
4. Actualiza la tabla en este README

### Cambiar Colores o Branding
1. Edita `docs/css/styles.css` — variables CSS en las primeras líneas
2. Todos los colores están centralizados en `:root {}`

### Ajustar Pesos de Secciones
1. En `docs/js/scoring.js`, modifica el objeto `this.weights` en el constructor
2. Actualmente: Ambiental 40%, Social 40%, Gobernanza 20%

## Pruebas

- **Unitarias e integración (Jest):** `npm test`
- **E2E con Cucumber + Playwright:** `npm run test:e2e` (arranca el servidor, ejecuta los escenarios y apaga). Las pruebas e2e se ejecutan en **headless** por defecto (sin ventana del navegador). Para ver el navegador: `npm run test:e2e:headed` o `HEADLESS=false npm run test:e2e`.
- Escenarios BDD: envío del formulario (`features/formulario.feature`) y comportamiento en situaciones límite (`features/formulario-edge.feature`).

## Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere instalación ni dependencias

## Soporte
Para preguntas sobre benchmarks específicos, consulta el JSON de benchmarks donde encontrarás la cita completa en APA.

Para cambios en el cuestionario, contacta al equipo de The Climb Institute.

---

**Desarrollado para:** The Climb Institute - NEXT 2025
**Versión:** 1.0
**Fecha:** 2026-02-25
