#!/usr/bin/env bash
set -euo pipefail

MODEL_NAME="vosk-model-small-es-0.42"
MODEL_URL="https://alphacephei.com/vosk/models/${MODEL_NAME}.zip"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${APP_DIR}/assets/model-es"

if [ -f "${TARGET}/graph/Gr.fst" ]; then
  echo "El modelo ya está en ${TARGET}"
  exit 0
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "${WORK_DIR}"' EXIT

echo "Bajando ${MODEL_NAME}..."
curl -fL --progress-bar -o "${WORK_DIR}/model.zip" "${MODEL_URL}"
unzip -q "${WORK_DIR}/model.zip" -d "${WORK_DIR}"

rm -rf "${TARGET}"
mkdir -p "${APP_DIR}/assets"
mv "${WORK_DIR}/${MODEL_NAME}" "${TARGET}"
echo "Modelo listo en ${TARGET}"
