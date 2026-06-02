# Claude Best Practices — Token Efficiency Guide

## Input Optimization

**1. Don't upload raw PDFs paste text into Google Docs → download as `.md` 

**2. Convert files before uploading**
Same principle for Word docs, spreadsheets. Export to plain text or markdown whenever possible.

**3. Write shorter prompts: "I want to [task] to [goal]. Ask me questions using AskUserQuestion before you start."

**4. Batch your requests**
Don't send 3 separate messages for 3 tasks. One message, three tasks:
> "Summarize this, list the key points, suggest a headline."

**5. Upload once, reuse everywhere**
Use Projects to upload files once. Every new chat references it without re-burning tokens.

---

## Model Selection

**6. Match the model to the task**
- **Haiku** → quick tasks, grammar checks, simple Q&A
- **Sonnet** → writing, coding, most daily work
- **Opus** → deep reasoning, complex architecture, research only

Never use Opus for tasks Haiku can handle.

---

## Session Management

**7. Start fresh sessions regularly**
Every 15–20 messages → summarize, copy the brief, start a new chat. Long histories re-read everything.

**8. One topic per chat**
New topic = new chat. Dead context = wasted tokens.

**9. Edit, don't stack**
Instead of typing "No, I meant…" → click **Edit** on your original message, fix it, regenerate. History replaced, not stacked.

**10. Surgical corrections**
Instead of "redo the whole thing" to fix one part:
> "Only redo section 3. Keep everything else. No commentary. Just the output."

---

## Feature & Settings Management

**11. Default features OFF**
Don't leave Search & Connectors on by default. Turn features on per task, not per account.

**12. Set Personal Preferences once**
Settings → Personal Preferences. Set your tone and style once — it persists forever. Saves 3–5 setup messages per chat.

**13. Plan cheap, build expensive**
- Plan in Chat (cheap context)
- Build final output in Cowork/Projects (expensive, but targeted)

Don't build files in Cowork prematurely.

---

## Prompt Patterns

**14. Use AskUserQuestion before starting complex tasks**
> "Ask me questions using AskUserQuestion before you start."
This surfaces ambiguities upfront instead of mid-task corrections.

**15. Constrain output explicitly**
> "No commentary. Just the output."
> "Under 200 words."
> "Bullet points only."

**16. Reference, don't repeat**
Don't paste the same context block into every message. Say "refer to the doc above" or use Projects.
