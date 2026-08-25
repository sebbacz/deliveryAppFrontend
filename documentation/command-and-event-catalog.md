# Command and Event Catalog

---

## Commands

Each command is handled by exactly one use case.

### restaurants

| Command | Fields | Handled by |
|---|---|---|
| `CreateRestaurantCmd` | ownerId, name, street, number, postalCode, city, country, contactEmail, pictureUrls, defaultPreparationTime, typeOfCuisine, openingHours | `CreateRestaurantUseCase` |
| `SaveDishDraftCmd` | restaurantId, name, type, foodTags, description, price, pictureUrl | `CreateDishDraftUseCase` |
| `UpdateDishDraftCmd` | dishId, name, type, foodTags, description, price, pictureUrl | `EditDishDraftUseCase` |
| `ScheduleDishChangesCmd` | restaurantId, scheduledAt | `ScheduleDishChangesUseCase` |
| `AddCriteriaEventCmd` | effectiveAt, cheapMax, regularMax, expensiveMax | `AddCriteriaEventUseCase` |

Commands with no extra fields (just an ID) are handled inline by their use case and do not have a separate Cmd record:

| Action | Use case |
|---|---|
| Publish dish | `PublishDishUseCase` |
| Unpublish dish | `UnpublishDishUseCase` |
| Update dish stock | `UpdateDishStockUseCase` |
| Open / close restaurant | `OpenCloseRestaurantUseCase` |
| Delete restaurant | `DeleteRestaurantUseCase` |
| Sign up owner | `SignUpOwnerUseCase` |
| Sign in owner | `SignInOwnerUseCase` |

---

### orders

| Command | Fields | Handled by |
|---|---|---|
| `CreateOrderCmd` | restaurantId, customerName, deliveryStreet, deliveryNumber, deliveryPostalCode, deliveryCity, deliveryCountry, contactEmail, items (dishId, dishName, price, quantity) | `CreateOrderUseCase` |
| `AcceptOrderCmd` | orderId | `AcceptOrderUseCase` |
| `RejectOrderCmd` | orderId, reason | `RejectOrderUseCase` |
| `MarkOrderReadyCmd` | orderId | `MarkOrderReadyUseCase` |
| `MarkOrderPickedUpCmd` | orderId | `MarkOrderPickedUpUseCase` |
| `MarkOrderDeliveredCmd` | orderId | `MarkOrderDeliveredUseCase` |
| `UpdateCourierLocationCmd` | orderId, latitude, longitude | `UpdateCourierLocationUseCase` |

---

## Events

Events are immutable records in `orders/domain/events/`. 


| Event | Fields | Raised when |
|---|---|---|
| `OrderPlacedEvent` | orderId, restaurantId, customerName, deliveryAddress fields, contactEmail, items, occurredAt | Customer places a new order |
| `OrderAcceptedEvent` | orderId, occurredAt | Restaurant owner accepts the order |
| `OrderRejectedEvent` | orderId, reason, occurredAt | Restaurant owner rejects the order (or auto-decline fires) |
| `OrderReadyEvent` | orderId, occurredAt | Restaurant marks the order ready for pickup |
| `OrderPickedUpEvent` | orderId, occurredAt | Delivery service confirms courier picked up the order |
| `OrderDeliveredEvent` | orderId, occurredAt | Delivery service confirms the order was delivered |
| `CourierLocationUpdatedEvent` | orderId, latitude, longitude, occurredAt | Delivery service pushes a live courier location update |

### RabbitMQ — published routing keys

Events published to the `kdg.events`  

| Routing key | Published when |
|---|---|
| `restaurant.{restaurantId}.order.accepted.v1` | Order accepted |
| `restaurant.{restaurantId}.order.ready.v1` | Order ready for pickup |

### RabbitMQ —   queues

Events received from the delivery service:

| Queue | Meaning |
|---|---|
| `kdg.delivery.pickedup.queue` | Courier picked up the order → raises `OrderPickedUpEvent` |
| `kdg.delivery.delivered.queue` | Order delivered → raises `OrderDeliveredEvent` |
| `kdg.delivery.location.queue` | Courier location update → raises `CourierLocationUpdatedEvent` |
