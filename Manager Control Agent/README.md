# Manager Control Agent: prototypes for Sue

Built 4 Nov 2026 for the Joe / Sue meeting on Mon 9 Nov 2026, 8:00 CST.

## Open it

- Start at `prototypes.html`: it links the three prototypes and has the Monday demo script.
- Simple: `weekly-list.html` (My Week). Standard: `index.html` (Manager Control). Advanced: `command-center.html` (Sales Command Center).
- Ideas and the full initiative list: `IDEAS.md`.
- Double click any page. It opens in the browser, nothing to install, no internet needed.
- Top right: Manager view (Sue), Rep view (pick a rep), Friday report (print or save as PDF).
- If `data/live.js` is in the `data` folder you see real HubSpot numbers. If not, the page shows made-up sample data and says so in the header.

## What Sue asked for and where it is

| Sue's priority | Where in the page |
|---|---|
| Top 20 priority accounts per BDM (top 10 per SAM), new business activity done | Manager table columns "Priority accounts" and "New business activity"; Rep view section 1 |
| Meeting types and outcomes, bad demos visible, lost deals, competitor feedback, no recording flagged | Manager column "Meetings" with gap chips; Rep view section 2 and "Won and lost" |
| Pipeline: due to close, how it changes, stale deals, close dates in the past | Manager column "Pipeline"; Rep view section 3 |
| Manager view and a view per rep | Manager view, click a rep to drill down |
| Friday report of done and missed | Friday report tab, one card per rep, printable |
| Reps reply and the agent updates HubSpot | Rep view "Reply to the agent" box (demo only, nothing is sent) |

## What the first snapshot showed (talking points for Sue)

- Priority account lists are mostly empty in HubSpot for the BDMs. Only a few BDMs have Target Accounts marked. The SAMs have theirs. Ask: each BDM marks their top 20 as Target Account, then the view fills itself.
- About half of this fortnight's meetings have no meeting type, and many past meetings still say Scheduled. The page flags each one.
- Most meetings have no recording attached in HubSpot. Teams and Otter recordings are not visible to HubSpot, so this flag needs a decision on where recordings live.
- Close dates in the past are the biggest hygiene gap: hundreds of open deals, concentrated in a few reps. Stale deals (no activity in 30 days) are few once disqualified and uncontactable stages are left out.
- Calls are logged by very few reps. Emails are logged widely.

## Refresh the data

- Say "refresh the Manager Control data" in this folder's chat. It reads HubSpot (never writes) and rewrites `data/live.js`.
- `data/live.js` holds real names and deals. It is never committed and never shared. Keep it on your computer.

## Next steps after Sue says yes

1. Agree the definition of "priority accounts" in HubSpot (Target Account flag per rep) and the top 20 / top 10 lists.
2. Decide how reps reply: in this page (needs hosting and an API, spends Netlify credits and API cost, warn first) or in the Sales Agent chat (no hosting).
3. Add the next views: two strategic prospects per BDM, customer portal onboarding, demo feedback, Q4 leaderboard, monthly owner audit.
4. Schedule the Friday report (Joe posts it by hand in the pilot; nothing is sent by the agent).
