# Balad Map API Research — for PadelPro "nearest club" feature

Research date: 2026-10-14
Status: **Balad has NO public developer API. Neshan is the viable option.**

---

## 1. Balad (بلد) — Developer API

### Verdict: ❌ No public developer API exists

- Balad is a consumer map/navigation app (balad.ir, ~12M installs, Persian voice navigation).
- Their GitHub org (`github.com/BaladMaps`) exists but has **zero public repositories**.
- No developer portal found (no equivalent of Neshan's platform.neshan.org).
- Multiple web searches (English + Persian) for "Balad developer API", "سرویس توسعه دهندگان بلد", "developer.balad.ir" returned nothing — only consumer app listings and unrelated results.
- Balad's site (balad.ir) is a places directory + app download page; no developer/API link anywhere in the footer or nav (checked 2026-10-14).
- Balad's published contact: 02128426480 — business/API access would require direct contact with them (not self-serve).

**Do NOT plan on Balad API integration.** If رضا specifically wants the Balad brand, the only path is calling their business line — but there is no documented self-serve API.

---

## 2. Neshan (نشان) — The practical alternative ✅

Neshan is Iran's established maps developer platform, built on OpenStreetMap data.

### Developer portal
- **https://platform.neshan.org** — sign up, create apps, get API keys
- Docs referenced at https://developer.neshan.org (API key obtainable free per wpsocket docs)

### Authentication
- API key passed per-request as HTTP header: **`Neshan-Api-Key: <key>`** (alias: `Api-Key`)
- Per-service overrides supported: `Neshan-Api-Key-<service>`
- **Static map endpoints use `?key=<key>` query param instead of header**
- **Web SDK (map tiles in browser) needs a SEPARATE map key** — service keys won't render base tiles

### Available services (REST)
| Service | Purpose | Notes |
|---|---|---|
| Search | Place/business search | Persian-aware |
| Geocoding | Address → coordinates | Good Persian address support |
| Reverse geocoding | Coordinates → address | Endpoints `/v4/reverse` or `/v5/reverse` (account-dependent) |
| Routing | Turn-by-turn route, ETA | Accounts for Iranian traffic zones |
| Distance Matrix | N×M distances + durations | Perfect for "nearest club" |
| Static Map | Render map image | Key as query param |
| Web SDK | Interactive map in browser | `static.neshan.org`, needs map key |
| Isochrone | Reachable area polygon | |
| Map Matching | Snap GPS trace to roads | |
| TSP / VRP | Route optimization | |

### Pricing
- Free tier exists (API key obtainable for free per platform docs).
- Exact quotas/pricing should be confirmed at platform.neshan.org (not captured in this research — needs رضا to sign up and check the dashboard).

### Iran-specific considerations
- Neshan is an Iranian company (Rajman/Fanap) — no sanctions issue for Iranian users.
- Works with Iranian traffic restrictions (odd/even zones), Persian voice guidance.
- **CORS**: REST APIs called from browser need CORS support. Neshan's APIs are commonly called from Iranian web apps; if CORS is restricted, route calls through a small server-side proxy (e.g., the existing `live-price-search` Edge Function pattern on Supabase).
- **API key secrecy**: In a Capacitor APK, the JS bundle is readable — a key embedded in the app can be extracted. Mitigations:
  1. Restrict the key by HTTP referrer / package name in the Neshan dashboard (if supported).
  2. Proxy sensitive calls (routing, matrix) through Supabase Edge Function; keep the Web SDK map key client-side (it's meant to be public-ish).

---

## 3. What PadelPro actually needs (and the cheapest path)

For "show nearest club to my GPS location":

### Distance calculation — NO API NEEDED
Club coordinates are already in the app's data. Distance from user GPS → each club is a pure math problem (Haversine formula), computed client-side in milliseconds:

```ts
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
```

Sort clubs by this distance → "nearest club" list. **Zero API calls, zero cost, works offline.** This covers 90% of the feature.

### Map display — Neshan Web SDK
To show clubs as pins on an interactive map: Neshan Web SDK (`static.neshan.org`), needs a free map key from platform.neshan.org.

### Travel time — Neshan Routing/Matrix API (optional, Phase 2)
Only needed if رضا wants "15 min drive" labels or "navigate" buttons. Use Distance Matrix for bulk ETAs or deep-link to the Neshan/Balad *app* for actual navigation:
- `neshan://` or `balad://` deep links can open the user's installed nav app with the destination pre-filled (no API key needed).

### Creative differentiator ideas (per رضا's "be different" brief)
- **"Padel radar"**: circular radar-sweep animation from user location, clubs pop in ordered by distance with travel-time chips.
- **"Nearest available court right now"**: combine distance + live slot availability — nearest club *with a free slot in the next 2 hours* ranks first.
- **Price-aware ranking**: toggle "nearest" vs "cheapest nearby" vs "best rated nearby".
- **One-tap navigate**: deep-link into Neshan/Balad app for turn-by-turn.

---

## 4. Comparison: Balad vs Neshan for developers

| | Balad | Neshan |
|---|---|---|
| Public developer API | ❌ None found | ✅ Full platform |
| Self-serve API key | ❌ | ✅ platform.neshan.org |
| Map tiles / Web SDK | ❌ | ✅ |
| Geocoding / Routing / Matrix | ❌ | ✅ |
| Free tier | N/A | ✅ (key obtainable free) |
| Iranian company | ✅ | ✅ |
| Consumer app popularity | 12M installs (#2) | 32M installs (#1) |

**Recommendation: Build on Neshan.** Balad has no developer offering to integrate with.

---

## 5. Next steps (need رضا)

1. **رضا signs up at https://platform.neshan.org** and creates an app → gets API key + Web SDK map key. (Account-side action — needs him.)
2. Then: implement Haversine-based "nearest club" sort (no key needed), add Neshan Web SDK map view (map key), optionally Distance Matrix for drive times (API key, proxied via Supabase Edge Function).
3. Add `lat`/`lng` to every club in the data — required for any of this to work. (Many clubs may already have coordinates; audit needed.)

## Sources
- https://balad.ir (checked 2026-10-14 — no developer section)
- https://github.com/BaladMaps (no public repos)
- https://platform.neshan.org (Neshan developer portal)
- https://github.com/neshanmaps/neshan-mcp/blob/HEAD/CLAUDE.md (endpoint + auth details)
- https://github.com/sepehrghr/neshan-mcp-server/blob/HEAD/CLAUDE.md (platform overview)
- https://wpsocket.com/plugin/neshan-maps/ (free API key confirmation)
- https://en.wikipedia.org/wiki/Neshan (company background)
