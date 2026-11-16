#!/bin/bash
# Arma un audio .m4a (AAC, un canal) con la voz de la computadora. Solo en macOS.
# Uso: scripts/make-audio.sh "Llovieron 18 milímetros anoche" lluvia.m4a
# La voz se cambia con VOICE; Paulina habla español de México: la Mac no trae una rioplatense.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo 'Uso: scripts/make-audio.sh "frase" archivo.m4a' >&2
  exit 1
fi

phrase="$1"
output="$2"
voice="${VOICE:-Paulina}"
temporary="$(mktemp -t make-audio).aiff"

say -v "$voice" -o "$temporary" "$phrase"
afconvert -f m4af -d aac -c 1 "$temporary" "$output"
rm -f "$temporary"
echo "$output"
