# Custom TickTick Node - Deployment & Maintenance Guide

## Overview

This is a **forked** version of the `n8n-nodes-ticktick` community node, with custom additions (e.g., Comment resource). It is installed on the self-hosted n8n instance on DigitalOcean via a custom Docker build — NOT through the n8n Community Nodes UI.

**GitHub repo:** https://github.com/botechos/n8n-nodes-ticktick

## Architecture

```
Server: DigitalOcean Droplet (Botechos)
n8n config: /opt/n8n-docker-caddy/
├── docker-compose.yml    # Defines n8n + caddy services
├── Dockerfile.n8n        # Custom n8n image (Python + TickTick fork)
├── caddy_config/
└── local_files/
```

The custom n8n image (`n8n-custom:<version>`) is built from `Dockerfile.n8n` which does three things:

1. **Python stage** — installs Python 3.12 + trafilatura (pre-existing, unrelated to TickTick)
2. **TickTick builder stage** — clones the fork from GitHub, runs `npm ci --ignore-scripts && npm run build`
3. **Final stage** — based on official `n8nio/n8n:<version>`, copies Python and the built TickTick node into `/opt/custom-nodes/n8n-nodes-ticktick/`

The environment variable `N8N_CUSTOM_EXTENSIONS=/opt/custom-nodes/n8n-nodes-ticktick` in `docker-compose.yml` tells n8n where to find the custom node.

## Important Rules

### DO NOT install n8n-nodes-ticktick from the n8n Community Nodes UI

The custom fork is baked into the Docker image. Installing the original from the UI would create a **duplicate/conflict**. If you ever see `n8n-nodes-ticktick` in Settings > Community Nodes, **uninstall it** from there — the Dockerfile version is the correct one.

### The fork is NOT on npm

It is installed directly from GitHub during the Docker build. It will never appear in the Community Nodes list in the n8n UI. This is expected behavior.

## Routine Operations

### Restarting n8n (no changes)

```bash
cd /opt/n8n-docker-caddy
docker compose restart n8n
```

The custom node persists — it's baked into the image, not the volume.

### Rebuilding after TickTick fork changes

If the fork on GitHub has been updated with new features:

```bash
cd /opt/n8n-docker-caddy
docker compose build --no-cache n8n
docker compose up -d n8n
```

`--no-cache` is important here because Docker caches the `git clone` step. Without it, you'll get the old code.

### Updating n8n version

The n8n version is pinned in two places. **Both must be updated together:**

1. **`Dockerfile.n8n`** — the `FROM` line:
   ```dockerfile
   FROM docker.n8n.io/n8nio/n8n:2.7.4
   ```
   Change `2.7.4` to the new version.

2. **`docker-compose.yml`** — the `image` line:
   ```yaml
   image: n8n-custom:2.7.4
   ```
   Change `2.7.4` to match.

Then rebuild:

```bash
cd /opt/n8n-docker-caddy
docker compose up -d --build n8n
```

If the build fails after an n8n version update, it's likely because:
- The TickTick fork's dependencies are incompatible with the new n8n version
- The `node:20-alpine` builder image may need updating if n8n requires a newer Node.js

In that case, the fork needs to be updated locally (on the dev machine in Cursor), pushed to GitHub, then the server rebuilt.

### Checking if the custom node is loaded

```bash
docker exec n8n-docker-caddy-n8n-1 ls /opt/custom-nodes/n8n-nodes-ticktick/dist/
```

You should see directories like `nodes/` and `credentials/`.

To check n8n startup logs for node loading:

```bash
docker logs n8n-docker-caddy-n8n-1 2>&1 | head -50
```

### Checking the current Dockerfile

```bash
cat /opt/n8n-docker-caddy/Dockerfile.n8n
```

Expected structure:
```dockerfile
FROM alpine:3.22 AS python-env
# ... python install ...

FROM node:20-alpine AS ticktick-builder
# ... git clone, npm ci --ignore-scripts, npm run build ...

FROM docker.n8n.io/n8nio/n8n:<VERSION>
USER root
# ... COPY python ...
# ... mkdir + COPY ticktick dist + package.json ...
USER node
```

### Checking docker-compose.yml for the env var

```bash
grep "N8N_CUSTOM_EXTENSIONS" /opt/n8n-docker-caddy/docker-compose.yml
```

Expected output:
```
      - N8N_CUSTOM_EXTENSIONS=/opt/custom-nodes/n8n-nodes-ticktick
```

If this line is missing, the custom node won't load.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| TickTick node not found in n8n | `N8N_CUSTOM_EXTENSIONS` env var missing | Add it to docker-compose.yml and restart |
| TickTick node not found in n8n | Docker image was rebuilt without the ticktick-builder stage | Check Dockerfile.n8n has the ticktick-builder stage |
| Two TickTick nodes appear | Original was installed via Community Nodes UI | Uninstall it from Settings > Community Nodes |
| Build fails on `npm ci` | Dependencies issue (e.g., native modules) | Ensure `--ignore-scripts` flag is present in Dockerfile |
| Build uses stale code after fork update | Docker cache | Rebuild with `--no-cache`: `docker compose build --no-cache n8n` |
| n8n container keeps restarting | Check logs | `docker logs n8n-docker-caddy-n8n-1 --tail 100` |

## File Locations Summary

| What | Where |
|------|-------|
| Docker config | `/opt/n8n-docker-caddy/` |
| Dockerfile | `/opt/n8n-docker-caddy/Dockerfile.n8n` |
| docker-compose | `/opt/n8n-docker-caddy/docker-compose.yml` |
| Custom node (inside container) | `/opt/custom-nodes/n8n-nodes-ticktick/` |
| n8n data volume | `n8n_data` mounted at `/home/node/.n8n` |
| GitHub source | https://github.com/botechos/n8n-nodes-ticktick |
