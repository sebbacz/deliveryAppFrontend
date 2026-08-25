# Programming 6 — Keep Dishes Going

**Sebastian Gondek**

- Documentation: `/documentation`
- Wireframes: `/wireframes`

---

#  Keep Dishes Going 

## Challenges & Accomplishments

The most challenging part was implementing 
the **dish draft/pending state machine**.
A dish can be in one of three states — `DRAFT`, `LIVE`, or `LIVE_WITH_PENDING` — and the UI had to correctly reflect each state with the right action buttons, without ever 
letting a pending edit break the live menu that customers see.

I'm most proud of the **guesstimated delivery time**: it uses the Haversine formula to calculate the straight-line distance between the user's 
geolocation and the restaurant, then combines that with the restaurant's preparation time to show a realistic delivery estimate on every card.

---

## ✅ Finished Features

- [x] Keycloak authentication (login / logout / role-based access)
- [x] Restaurant creation and owner dashboard
- [x] Dish draft/edit workflow — edit dishes without affecting the live menu
- [x] Publish / unpublish dishes
- [x] Mark dishes as out of stock / back in stock
- [x] Restaurant listing with search and cuisine filter
- [x] Map view of nearby restaurants (OpenStreetMap / Leaflet)
- [x] Restaurant detail page with full menu
- [x] Add to basket with localStorage persistence across page refreshes
- [x] Checkout flow with Stripe payment
- [x] Order placement and confirmation
- [x] Order tracking page with live courier location on map
- [x] Owner order management (accept / reject / mark ready / picked up / delivered)
- [x] 5-minute auto-decline countdown for pending orders
- [x] Price range criteria system with history chart
- [x] Delivery time estimation using Haversine distance + preparation time
- [x] Opening hours display per restaurant

---

## ❌ Unfinished / Planned Features

- hope everything is done 

