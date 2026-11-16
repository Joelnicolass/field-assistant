# Field Assistant

Asistente de campo por voz para Android: el productor le habla al teléfono, la app responde en
voz alta, registra lo que pasó en el campo y contesta preguntas. Es la respuesta a un
challenge técnico; la consigna está en `CHALLENGE.md`.

**Antes de escribir código, leé `RULES.md`.** Lo que dice ahí manda sobre cualquier guía
genérica de un comando.

## Documentos y autoridad

`CHALLENGE.md` > `PRD.md` > `FEATURES.md` > `RULES.md` > `VISUAL.md` > `RFCs/` > planes.

Si dos documentos se contradicen: decilo, seguí el de mayor autoridad y marcá el otro para
corregir. Nunca lo resuelvas en silencio.

## El flujo

Cada paso deja un archivo que el siguiente lee.

| # | Comando | Deja |
| --- | --- | --- |
| 1 | `/create-prd` | `PRD.md` |
| 2 | `/verify-prd` | `PRD-REVIEW.md` y el `PRD.md` corregido |
| 3 | `/extract-features` | `FEATURES.md` |
| 4 | `/generate-rules` | `RULES.md` |
| 5 | `/create-visual-guide` | `VISUAL.md`, a partir de las capturas de `docs/visual-refs/` |
| 6 | `/generate-rfcs` | `RFCs/` y `RFCS.md` |
| 7 | `/test-strategy` | `TEST-STRATEGY.md` |
| 8 | `/build-rfc <id>` | El código de un RFC, por pasos |
| 9 | `/review-rfc <id>` | `reviews/REVIEW-RFC-<id>.md`, en una sesión nueva |

`/manage-changes` para un cambio de requisitos y `/workflow-status` para ver dónde está todo.

## Ajustes del flujo para este proyecto

- **Cinco RFCs como máximo.** El RFC-001 es el scaffold de Expo, todas las librerías y el
  research. Cualquier comando que genere o modifique RFCs respeta este tope.
- **Se implementa con `/build-rfc`, no con `/implement-rfc`.** Un paso por vez: el subagente
  `dev` implementa, `qa` prueba y el flujo se detiene para que el usuario revise y apruebe.
- **Un RFC por vez**, en el orden de `RFCS.md`.
- **`VISUAL.md` antes de cualquier RFC con pantallas.** Sin esa guía no se arma interfaz.
- **`/generate-rules` conserva los identificadores** de las reglas que ya existen.

## Cómo se trabaja

- El usuario revisa el código de cada paso antes de seguir: nada de avanzar por cuenta propia.
- Antes de usar una API de Expo, React Native o una librería, verificarla en los tipos y el
  README instalados en `node_modules`, no de memoria.
- Un commit por paso aprobado. Sin push salvo que el usuario lo pida.
- `DECISIONS.md` es del usuario: registra sus decisiones, qué se usa, qué se hace y por qué, en
  el mismo commit que el código que las aplica. No se usa para justificar sugerencias de una
  revisión que no se tomaron ni elecciones de un agente.
- El uso de IA se anota en `AI-USAGE.md`: qué herramienta y para qué. La consigna lo pide.
- El usuario tiene que poder explicar cualquier línea: si algo no se entiende leyéndolo, está
  mal escrito.
