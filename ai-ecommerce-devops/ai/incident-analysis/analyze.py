#!/usr/bin/env python3
"""AI-assisted incident analysis.

Pipeline: read logs (JSON lines or plain text) -> rule-based classification (works offline)
-> optional LLM enrichment (set ANTHROPIC_API_KEY) -> report with category, severity,
possible root cause and suggested remediation.

Usage:
    python analyze.py sample_logs/db_timeout.log
    python analyze.py --llm sample_logs/db_timeout.log
    kubectl -n shopstream logs deploy/shopstream --tail=500 | python analyze.py -
"""
import argparse, json, os, re, sys, urllib.request
from collections import Counter

RULES = [
    # (category, regex, severity, root cause, remediation)
    ("Database connectivity", r"(connection timeout|ECONNREFUSED.*5432|database connection|db-unavailable|too many connections)", "HIGH",
     "Database unreachable, credentials wrong, or connection limit reached.",
     ["Check DB pod/container is running and healthy", "Verify network/service DNS between app and DB",
      "Verify DATABASE_URL credentials in the Secret", "Check max_connections and app pool size"]),
    ("Out of memory", r"(heap out of memory|OOMKilled|Cannot allocate memory)", "CRITICAL",
     "Container exceeded its memory limit or leaks memory.",
     ["Check `kubectl describe pod` for OOMKilled", "Review memory limits vs Grafana RSS panel", "Profile for leaks; raise limit as a stopgap"]),
    ("Image / startup failure", r"(ImagePullBackOff|ErrImagePull|CrashLoopBackOff|Cannot find module)", "HIGH",
     "Bad image tag, missing registry credentials, or app crashing on boot.",
     ["Verify the image tag exists in the registry", "Check imagePullSecrets", "Read `kubectl logs --previous`"]),
    ("Authentication / permission", r"(401|403|permission denied|unauthorized|access denied)", "MEDIUM",
     "Expired/incorrect credentials or missing RBAC/IAM permission.",
     ["Rotate/verify the credential", "Check Role/RoleBinding or IAM policy"]),
    ("Application error (5xx)", r"(\"status\":5\d\d|HTTP 5\d\d|Internal Server Error|Unhandled)", "HIGH",
     "Unhandled exception in application code.",
     ["Find the stack trace around the first 5xx", "Check the most recent deployment (git log / helm history)", "Roll back if it started after a release"]),
    ("Latency / timeout", r"(timeout|ETIMEDOUT|slow query|deadline exceeded)", "MEDIUM",
     "Slow dependency or resource saturation.",
     ["Check p95 latency and CPU panels", "Look for slow downstream calls", "Scale replicas / raise limits"]),
]
SEV_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

def read_lines(path):
    return sys.stdin.read().splitlines() if path == "-" else open(path, errors="replace").read().splitlines()

def classify(lines):
    hits = {}
    for ln in lines:
        for cat, rx, sev, cause, fix in RULES:
            if re.search(rx, ln, re.I):
                h = hits.setdefault(cat, {"count": 0, "sev": sev, "cause": cause, "fix": fix, "example": ln.strip()[:240]})
                h["count"] += 1
    return hits

def llm_enrich(lines, summary):
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return "(LLM skipped: set ANTHROPIC_API_KEY to enable)"
    errors = [l for l in lines if re.search(r"error|fail|timeout|exception|5\d\d", l, re.I)][-40:]
    body = json.dumps({
        "model": os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5"),
        "max_tokens": 600,
        "messages": [{"role": "user", "content":
            "You are an SRE assistant. Given these log lines and a rule-based summary, give: "
            "(1) most likely root cause, (2) severity, (3) the first 3 commands to run. Be concise.\n\n"
            f"SUMMARY: {json.dumps(summary)[:1500]}\n\nLOGS:\n" + "\n".join(errors)}],
    }).encode()
    req = urllib.request.Request("https://api.anthropic.com/v1/messages", data=body, method="POST",
        headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)["content"][0]["text"]
    except Exception as e:
        return f"(LLM call failed: {e})"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("logfile"); ap.add_argument("--llm", action="store_true"); ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    lines = read_lines(a.logfile)
    hits = classify(lines)
    worst = max((h["sev"] for h in hits.values()), key=SEV_ORDER.index, default="LOW")
    summary = {"lines_analyzed": len(lines), "overall_severity": worst,
               "findings": {k: {"count": v["count"], "severity": v["sev"], "cause": v["cause"], "remediation": v["fix"]} for k, v in hits.items()}}
    if a.json:
        print(json.dumps(summary, indent=2)); return
    print(f"Lines analyzed: {len(lines)}   Overall severity: {worst}\n")
    if not hits:
        print("No known incident patterns found.")
    for cat, h in sorted(hits.items(), key=lambda kv: -SEV_ORDER.index(kv[1]["sev"])):
        print(f"[{h['sev']}] {cat}  (x{h['count']})")
        print(f"  Example : {h['example']}")
        print(f"  Cause   : {h['cause']}")
        print("  Investigate/fix:")
        for s in h["fix"]: print(f"    - {s}")
        print()
    if a.llm:
        print("--- LLM analysis ---"); print(llm_enrich(lines, summary))

if __name__ == "__main__":
    main()
