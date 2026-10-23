#!/usr/bin/env bash
# Quick host report: disk, memory, load, docker state.
echo "== Disk ==";   df -h / | tail -1
echo "== Memory =="; free -h | sed -n 2p
echo "== Load ==";   uptime
echo "== Docker =="; docker ps --format 'table {{.Names}}\t{{.Status}}' 2>/dev/null || echo "docker not running"
