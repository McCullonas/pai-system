# DeepDive Workflow

Fetches detailed local transport information for a specific city on demand.

---

## Trigger

"deep dive [city]", "local transport [city]", "what about getting around [city]"

---

## Execution Steps

### 1. Identify the City

Parse the city name from the user's request.

### 2. Check ExternalResources.md

Load `ExternalResources.md` and find the city's entry:
- Local transport operator URL
- Key info snippet
- Any existing notes

### 3. Fetch Live Information

In parallel where possible:

1. **Transport operator site:** WebFetch the city's transport URL from ExternalResources.md
2. **seat61.com:** WebFetch the relevant country page for any local transport tips
3. **Web search:** WebSearch for "[city] public transport visitor guide 2026"

### 4. Compile and Present

Present conversationally as Mark would — practical, opinionated, useful:

- **System overview:** Metro lines, tram, bus, what covers the tourist areas
- **Ticket types:** Single, day pass, tourist card, contactless payment
- **Airport connection:** How to get from the airport to the centre
- **Key lines for tourists:** Which metro/tram lines matter for the main sights
- **Tips:** What Mark would recommend, common mistakes
- **Integration with rail:** How the local system connects to the main train station

### 5. Update Conversation File

Append the deep dive findings to the active conversation file.

---

## Example Output Format

```
Right, Barcelona local transport. Here's what you need to know:

**Metro (TMB):** 12 lines, runs 05:00-midnight (24h Fri/Sat). Covers everything
you'd want to see. T-Casual card (10 trips, EUR 11.35) is your best bet.

**Key lines:**
- L3 (Green): Sants station to Las Ramblas, Passeig de Gracia (Gaudi)
- L1 (Red): Arc de Triomf, Hospital de Sant Pau
- L4 (Yellow): Barceloneta beach

**Free suburban trains:** Your Interrail ticket includes Rodalies/Cercanias
for 3 hours before and 4 hours after your long-distance journey. Covers
airport too.

**Airport:** Rodalies R2 to Sants (25 min, free with Interrail). Or Aerobus
(EUR 7.75, every 5 min to Placa Catalunya).

**Tip:** Don't buy single metro tickets — the T-Casual is always better value
unless you're literally making one journey.
```
