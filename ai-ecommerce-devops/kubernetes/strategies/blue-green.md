# Blue-Green with a Service selector switch
1. Deploy `shopstream-green` (label `version: green`) next to the live `shopstream-blue`.
2. Smoke test green: `kubectl -n shopstream port-forward deploy/shopstream-green 8081:3000`.
3. Cut over: `kubectl -n shopstream patch svc shopstream -p '{"spec":{"selector":{"app":"shopstream","version":"green"}}}'`
4. Roll back instantly by patching the selector back to `blue`.
