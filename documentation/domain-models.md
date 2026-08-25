# Domain Models

The system is split into two bounded contexts: **restaurants** and **orders**.

---

## Bounded Context: restaurants

### Restaurant
The core aggregate.  

| Field | Type | Description |
|---|---|---|
| id | UUID | Unique identifier |
| ownerId | String | Links to the owning `Owner` |
| name | String | Display name |
| address | Address | Street, number, postal code, city, country |
| contactEmail | String | Public contact email |
| pictureUrls | List\<String\> | One or more photo URLs |
| defaultPreparationTime | int | Minutes to prepare an order |
| typeOfCuisine | String | e.g. "Italian", "Thai" |
| openingHours | String | Cron-style schedule string |
| isOpen | boolean | Current open/closed state |
| manualOverride | boolean | When true, the scheduler leaves the open state alone |
| latitude / longitude | Double | Geocoded from address via Nominatim |

**Behaviour**
- `open()` / `close()` — set open state and activate the manual override flag
- `clearManualOverride()` — lets the scheduler resume automatic open/close
- `updateCoordinates(lat, lng)` — called by the geocoding adapter after creation

---

 
**Derived state**

| live | draft | State |
|---|---|---|
| set | null | `LIVE` |
| null | set | `DRAFT` |
| set | set | `LIVE_WITH_PENDING` |

 

### DishData (value object)
An immutable snapshot of one version of a dish. Used for both `live` and `draft` slots.

| Field | Type |
|---|---|
| name | String |
| type | DishType (`STARTER`, `MAIN`, `DESSERT`) |
| foodTags | List\<String\> |
| description | String |
| price | double |
| pictureUrl | String |

---

### Address (value object)
| Field | Type |
|---|---|
| street | String |
| number | String |
| postalCode | String |
| city | String |
| country | String |

---

### Owner
The authenticated principal for custom session-token auth. Retrieved from `OwnerSessionTokenStore`.

| Field | Type |
|---|---|
| id | String |
| email | String |
| restaurantId | String? |

---

### PriceRangeCriteriaEvent
Records a change to the price-tie.
 

| Field | Type | Description |
|---|---|---|
| id | UUID | |
| effectiveAt | LocalDateTime | When these thresholds take effect |
| cheapMax | double | Max price for CHEAP tier |
| regularMax | double | Max price for REGULAR tier |
| expensiveMax | double | Max price for EXPENSIVE tier |

**Price :** `CHEAP` · `REGULAR` · `EXPENSIVE` · `PREMIUM`

---

## Bounded Context: orders

### Order
Event-sourced aggregate. All state changes are recorded as events.
 

| Field | Type | Description |
|---|---|---|
| id | UUID | Generated at placement time |
| restaurantId | UUID | Which restaurant fulfils this order |
| customerName | String | |
| deliveryStreet/Number/PostalCode/City/Country | String | Delivery address |
| contactEmail | String | |
| items | List\<OrderItem\> | Frozen dish snapshots |
| createdAt | LocalDateTime | |
| status | OrderStatus | See lifecycle below |
| rejectionReason | String? | Set only when rejected |
| courierLatitude / courierLongitude | Double? | Live courier position |

**Order lifecycle**

```
PENDING_DECISION
    ├── accept  → ACCEPTED
    │               └── markReady   → READY_FOR_PICKUP
    │                                   └── pickUp → IN_DELIVERY
    │                                                   └── deliver → DELIVERED
    └── reject  → REJECTED
```

Auto-decline: orders still in `PENDING_DECISION` 
after 5 minutes are automatically rejected by a scheduler.

---

 