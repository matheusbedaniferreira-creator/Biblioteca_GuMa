#!/bin/sh
set -eu
BASE="http://localhost:5173/api"
printf '\n[API health]\n'
curl -sS -i "$BASE/health" | head -n 15
printf '\n[Catalogo]\n'
curl -sS -i "$BASE/livros" | head -n 15
printf '\n[Usuario sem sessao - HTTP 401 esperado]\n'
curl -sS -i "$BASE/auth/me" | head -n 15
