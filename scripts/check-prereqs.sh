#!/bin/bash

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not running. Please install Docker Desktop or Docker Engine."
    exit 1
fi

# Check if required ports are available
ports=(80 5432 6379 5672 15672)
portConflicts=()

for port in "${ports[@]}"; do
    if lsof -i :"$port" -sTCP:LISTEN > /dev/null 2>&1; then
        portConflicts+=("$port is already in use")
    fi
done

if [ ${#portConflicts[@]} -gt 0 ]; then
    echo "ERROR: Port conflicts detected: ${portConflicts[*]}"
    exit 1
fi

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "ERROR: pnpm is not installed or not in PATH"
    echo "Please install pnpm: https://pnpm.io/installation/"
    exit 1
fi

echo "pnpm is available: $(pnpm --version)"

# Check system resources for Docker
if ! docker info &> /dev/null; then
    echo "ERROR: Cannot get Docker information"
    exit 1
fi

echo "System resources check passed."
