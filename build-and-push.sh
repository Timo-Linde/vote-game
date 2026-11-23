#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────
REGISTRY="docker-registry.timo-linde.de"
IMAGE_NAME="vote-game"

# Derive version from git tag, commit, or fallback
if git describe --tags --exact-match >/dev/null 2>&1; then
  VERSION=$(git describe --tags --exact-match)
elif git rev-parse --short HEAD >/dev/null 2>&1; then
  VERSION=$(git rev-parse --short HEAD)
else
  VERSION="dev-$(date +%Y%m%d%H%M)"
fi

echo "🏷️  Version: ${VERSION}"

# ─── Login ───────────────────────────────────────────────────────
echo "🔑  Logging in to ${REGISTRY}..."
docker login "${REGISTRY}"

# ─── Build ───────────────────────────────────────────────────────
echo "🔨  Building images..."
docker compose build

# ─── Tag ─────────────────────────────────────────────────────────
echo "🏷️  Tagging images..."
docker tag "vote-game-client" "${REGISTRY}/${IMAGE_NAME}-client:${VERSION}"
docker tag "vote-game-client" "${REGISTRY}/${IMAGE_NAME}-client:latest"
docker tag "vote-game-server" "${REGISTRY}/${IMAGE_NAME}-server:${VERSION}"
docker tag "vote-game-server" "${REGISTRY}/${IMAGE_NAME}-server:latest"

# ─── Push ────────────────────────────────────────────────────────
echo "📤  Pushing..."
docker push "${REGISTRY}/${IMAGE_NAME}-client:${VERSION}"
docker push "${REGISTRY}/${IMAGE_NAME}-client:latest"
docker push "${REGISTRY}/${IMAGE_NAME}-server:${VERSION}"
docker push "${REGISTRY}/${IMAGE_NAME}-server:latest"

echo "✅  Done — pushed ${VERSION} and latest"
