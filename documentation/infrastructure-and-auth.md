# Infrastructure & Authentication

## Services

Start everything with:
```bash
docker compose up -d
```

| Service | URL / Port | Credentials |
|---|---|---|
| Spring Boot backend | http://localhost:8080 | — |
| RabbitMQ management | http://localhost:15672 | user / password |
| Keycloak admin console | http://localhost:8180/auth/ | admin / admin |


---

## Keycloak (Identity Provider)

Keycloak is the IDP for customer and Keycloak-registered owner authentication.

**Admin console:** http://localhost:8180/auth/
Login with `admin` / `admin`.

### Realm: `kdg`

All configuration lives in the `kdg` realm.

| Setting | Value |
|---|---|
| Realm | `kdg` |
| Issuer URI | `http://localhost:8180/realms/kdg` |
| Frontend client | `kdg-frontend` |


**Client** — `kdg-frontend` frontend origin in allowed redirect URIs (e.g. `http://localhost:5173/*`)

### JWT flow

```
Browser → POST /realms/kdg/protocol/openid-connect/token (via Keycloak login page)
       ← access_token (JWT, short-lived, sent to backend)
       ← refresh_token (stays in browser, used to renew access token)
       ← id_token     (contains user profile: name, email — used by frontend only)

Browser → GET /api/...  Authorization: Bearer <access_token>

```

---


| Table | Purpose |
|---|---|
| `restaurants` | Restaurant projection |
| `dishes` | Dish records with live/draft column sets |
| `orders` | CQRS read projection of order state |
| `order_events` | Append-only event store |
| `order_snapshots` | Periodic snapshots to speed up event replay |
| `owner_accounts` | Owners registered via custom auth |
| `price_range_criteria_events` | History of price-tier  changes |
