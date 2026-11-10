#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env
printf '\nArquivos .env criados (se ainda nao existiam).\n'
printf 'Agora preencha as credenciais reais e execute: docker compose up --build\n'
