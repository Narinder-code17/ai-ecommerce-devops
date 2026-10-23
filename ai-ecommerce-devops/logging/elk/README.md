Open Kibana at http://localhost:5601 -> Stack Management -> Data Views -> create `shopstream-logs-*`
(time field `@timestamp`), then Discover. Useful queries: `app.level:error`, `app.path:"/api/orders"`.
