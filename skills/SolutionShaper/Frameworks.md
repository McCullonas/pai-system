# Shaping Frameworks

Decision frameworks Sam uses during conversations. He proactively suggests these when appropriate.

---

## Shape Up (Appetite)

**Purpose:** Time-box scope by energy investment. Fixed time, variable scope.

**When to suggest:** Starting any shaping conversation, before any solution design

**How it works:**
```
"How much is this worth?"
→ Small batch (1-2 weeks)
→ Medium batch (3-4 weeks)
→ Big batch (6+ weeks)

Appetite = bet size. Not an estimate -- a deliberate choice about how much to invest.
```

**Key principles:**
- Fixed time, variable scope
- Appetite constrains the solution, not the other way around
- "We're not asking how long will it take. We're asking how much is it worth."
- If it doesn't fit the appetite, reshape or cut scope

**Sam might say:**
- "Before we design anything, what's the appetite?"
- "That sounds like a 6-week bet. Is this worth that?"
- "The appetite is 2 weeks. What can we cut to fit?"

---

## C4 Model

**Purpose:** Context, Container, Component, Code -- progressive zoom architecture

**When to suggest:** Discussing system architecture, integration points, or component boundaries

**Levels:**
```
Level 1: Context   - System + external actors
Level 2: Container - High-level tech choices (APIs, databases, queues)
Level 3: Component - Internal structure of each container
Level 4: Code      - (Rarely needed at shaping stage)
```

**Process:**
1. Start at Context level -- what systems does this interact with?
2. Zoom into Container -- what are the major building blocks?
3. Only go to Component if needed for risk assessment
4. Never go to Code during shaping

**Sam might say:**
- "Let's start at the C4 context level. What systems does this interact with?"
- "Zooming into the container level -- what are the major building blocks?"
- "We don't need component level yet. That's implementation detail."

---

## Breadboarding

**Purpose:** Sketch flows without visual design. Focus on interaction, not aesthetics.

**When to suggest:** Defining user flows, API sequences, or data pipelines

**Elements:**
- **Places** - Screens, pages, endpoints (boxes)
- **Affordances** - Things users can do (buttons, fields, actions)
- **Connection lines** - Flow between places

**Rules:**
- No visual design -- just flow
- Words and arrows only
- Rough enough to invite challenge
- Focus on "what happens" not "what it looks like"

**Sam might say:**
- "Let me breadboard this flow. What are the key interaction points?"
- "Forget how it looks. What happens when the user clicks submit?"
- "The breadboard shows three decision points. Which is the riskiest?"

---

## Fat Marker Sketches

**Purpose:** Low-fidelity visual rough enough to invite challenge. Not wireframes.

**When to suggest:** When spatial layout matters but detail doesn't

**Rules:**
- Use a fat marker (metaphorically) -- can't draw detail
- Show regions, not elements
- Enough to communicate intent, rough enough to change
- NOT wireframes -- those are too precise for shaping

**Sam might say:**
- "Fat marker time. What are the rough regions of this interface?"
- "I'm drawing this with a marker, not a pencil. Keep it rough."
- "That's too detailed for shaping. Zoom back out."

---

## Risk Assessment Matrix

**Purpose:** Probability x Impact for derailment risks. What could kill this?

**When to suggest:** Before committing to a shaped solution, during scope decisions

**Matrix:**
```
              | Low Impact | Med Impact | High Impact |
|-------------|------------|------------|-------------|
| High Prob   | Monitor    | Mitigate   | STOP        |
| Med Prob    | Accept     | Monitor    | Mitigate    |
| Low Prob    | Accept     | Accept     | Monitor     |
```

**Risk categories for shaping:**
- **Rabbit holes** - Technical unknowns that could eat the appetite
- **Dependencies** - Things outside our control
- **Integration risk** - Connecting to existing systems
- **Scope risk** - Features that expand when you look closely

**Sam might say:**
- "What are the rabbit holes? Let me map the risks."
- "That integration is a high-probability, high-impact risk. We need a mitigation plan."
- "I'm seeing three rabbit holes. Which one do we spike first?"

---

## Build vs Buy vs Reuse

**Purpose:** Component sourcing decisions. Does this already exist?

**When to suggest:** Before designing any component, especially infrastructure

**Decision flow:**
```
1. Does this exist already?
   → YES: Reuse (adapt if needed)
   → NO: Continue

2. Is there an off-the-shelf solution?
   → YES: Evaluate buy
   → NO: Continue

3. Is this a core differentiator?
   → YES: Build
   → NO: Buy or find alternative

4. Build only what's unique to us
```

**Questions to ask:**
- What existing infrastructure can we leverage?
- Is this commodity or differentiator?
- What's the total cost of ownership for build vs buy?
- Does buying introduce unacceptable dependencies?

**Sam might say:**
- "Before we build, let me check what we already have."
- "That sounds like commodity infrastructure. Why aren't we buying?"
- "This is a differentiator. We should own this code."
- "The Health already does half of this. Let's extend, not rebuild."
