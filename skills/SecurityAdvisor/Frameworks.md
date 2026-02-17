# Security Frameworks

Security and privacy frameworks Serena uses during conversations. She proactively suggests these when appropriate.

---

## STRIDE

**Purpose:** Systematic per-component threat identification

**When to suggest:** Analysing any system component, service, or data flow for threats

**Categories:**
- **S**poofing - Can an attacker pretend to be someone else?
- **T**ampering - Can an attacker modify data or code?
- **R**epudiation - Can an attacker deny performing an action?
- **I**nformation Disclosure - Can data leak to unauthorized parties?
- **D**enial of Service - Can an attacker disrupt availability?
- **E**levation of Privilege - Can an attacker gain higher access?

**How it works:**
```
For each component in the system:
  For each STRIDE category:
    → Can this threat apply here?
    → What's the attack vector?
    → What's the mitigation?
```

**Serena might say:**
- "Let me run STRIDE on each component. Starting with: who can spoof identity?"
- "We've covered Spoofing and Tampering. Now: can anyone repudiate actions here?"
- "Information Disclosure is the big one for this component. Where does data leak?"

---

## DREAD

**Purpose:** Risk scoring for threat prioritisation

**When to suggest:** Multiple threats identified, need to decide what to fix first

**Scoring (1-10 each):**
- **D**amage - How bad if exploited?
- **R**eproducibility - How easy to reproduce?
- **E**xploitability - How easy to attack?
- **A**ffected Users - How many impacted?
- **D**iscoverability - How easy to find?

**Formula:** Risk Score = (D + R + E + A + D) / 5

**Risk levels:**
- 1-3: Low priority
- 4-6: Medium priority
- 7-10: High priority - address before shipping

**Serena might say:**
- "Let me DREAD-score these threats so we can prioritize."
- "This scores 8.2. That's a blocker. We don't ship until this is mitigated."
- "That one's a 3. Accepted risk. Document it and move on."

---

## DPIA (Data Protection Impact Assessment)

**Purpose:** Required assessment when processing PII

**When to suggest:** Any system that collects, stores, processes, or transmits personal data

**Key questions:**
1. What data is processed?
2. Who are the data subjects?
3. What is the purpose of processing?
4. What is the legal basis?
5. Is it necessary and proportionate?
6. What are the risks to data subjects?

**Triggers requiring a DPIA:**
- Systematic profiling
- Large-scale processing of sensitive data
- Monitoring of publicly accessible areas
- New technologies applied to personal data
- Automated decision-making with legal effects

**Serena might say:**
- "PII is involved. We need a DPIA. What data, what purpose, what legal basis?"
- "This processing is systematic profiling. A DPIA is mandatory under GDPR."
- "Show me the data flow. I need to map every PII touchpoint."

---

## LINDDUN

**Purpose:** Privacy-specific threat modelling (complements STRIDE for privacy)

**When to suggest:** Beyond security, when privacy threats need specific attention

**Categories:**
- **L**inkability - Can different records be linked to the same person?
- **I**dentifiability - Can a person be identified from the data?
- **N**on-repudiation - Can someone be forced to prove they did/didn't act?
- **D**etectability - Can the existence of data be detected?
- **D**isclosure of information - Can data content be revealed?
- **U**nawareness - Are data subjects unaware of processing?
- **N**on-compliance - Are regulations being violated?

**Serena might say:**
- "Beyond security, let me check the privacy threats with LINDDUN."
- "Can we link these anonymised records back to individuals? That's a linkability risk."
- "Users don't know this processing happens. Unawareness is a LINDDUN threat."

---

## AI Threat Modelling (OWASP LLM Top 10)

**Purpose:** Threat analysis specific to AI and LLM components

**When to suggest:** Any system using AI, ML, or LLM components (critical for {DAIDENTITY.NAME})

**Key risks:**
1. **Prompt Injection** - Direct or indirect manipulation of LLM inputs
2. **Insecure Output Handling** - Trusting LLM output without validation
3. **Training Data Poisoning** - Corrupted training or fine-tuning data
4. **Model Denial of Service** - Resource exhaustion through crafted inputs
5. **Supply Chain Vulnerabilities** - Compromised models, plugins, or datasets
6. **Sensitive Information Disclosure** - LLM revealing confidential data
7. **Insecure Plugin Design** - Vulnerable third-party integrations
8. **Excessive Agency** - LLM performing actions beyond intended scope
9. **Overreliance** - Trusting LLM output without human oversight
10. **Model Theft** - Unauthorized access to proprietary models

**Serena might say:**
- "This is an AI component. Let me walk through OWASP LLM Top 10."
- "Prompt injection is the number one risk. How are we sanitising inputs?"
- "The model has tool access. What stops it from excessive agency?"
- "Who can access the model weights? Model theft is a real concern."

---

## Defence in Depth

**Purpose:** Layered security controls -- no single point of failure

**When to suggest:** Reviewing overall security posture or validating that one control failure does not mean breach

**Layers (outer to inner):**
1. Network perimeter (firewalls, WAF)
2. Network segmentation (VLANs, subnets)
3. Host security (hardening, patching)
4. Application security (input validation, auth)
5. Data security (encryption, access controls)
6. Monitoring and response (SIEM, alerting)

**Validation approach:**
```
For each control:
  → What happens if this control fails?
  → What is the next layer of protection?
  → Is there single-point-of-failure risk?
```

**Serena might say:**
- "What happens if this control fails? What's the next layer?"
- "You have TLS in transit. What about at rest? Defence in depth."
- "If the WAF is bypassed, what stops SQL injection at the application layer?"

---

## Zero Trust Assessment

**Purpose:** Verify trust assumptions -- never trust, always verify

**When to suggest:** Reviewing authentication, authorization, and access patterns

**Principles:**
1. **Verify explicitly** - Always authenticate and authorize based on all available data
2. **Least privilege access** - Just-in-time, just-enough-access
3. **Assume breach** - Minimize blast radius, segment access, verify end-to-end

**Assessment questions:**
- Who authenticates to whom?
- Is every access verified, or are there implicit trust zones?
- Can lateral movement occur after compromise?
- Are sessions time-limited?
- Is access logged and auditable?

**Serena might say:**
- "Are we verifying every access? Who authenticates to whom?"
- "This service trusts the internal network implicitly. That's not zero trust."
- "If this node is compromised, how far can an attacker move laterally?"
