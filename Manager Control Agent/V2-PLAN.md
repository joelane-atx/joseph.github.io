# V2 plan: the full sales org platform

V1 (`v1.html`) is the simple version Sue asked for on 3 Nov. V2 (`v2.html`) is the whole platform. Same data, same task store, same rules: read HubSpot only, send nothing.

## What V2 already has

- Sue's super control and a view for everyone else: Team Lead, John, rep (Sales Control).
- Tasks Sue enters or accepts from her rules, checked against HubSpot on Friday.
- Teams messages queued (not sent), replies logged, feedback, Friday report.
- Forecast, win/loss, initiatives, announcements, coaching cockpit, HubSpot audits, overdue invoices, Sue's rules, success measures, open questions, rollout plan.
- Dashboard with the spinning org graph and the ops charts.
- New in V2: **Initiative board**, one tab per initiative (23), who is on track, at risk, off track, and one click to make a task for everyone off track.
- New in V2: **Tool setup**, Claude, Outlook and HubSpot per person, blockers, and today's chase message for the shared chat (from the 3 Nov call).

## Next, in order

0. **Sue's flags on accounts** (built in V1, move into V2): flag or comment on any priority account, rep replies, each flag can be queued as a HubSpot note on the company. Writing the note needs the read-only rule lifted and Sue's yes; the note would @mention the owner so HubSpot notifies them.

1. **V1 home inside V2**: the one-screen leaderboard as the first view, the charts one click away.
2. **Strategic prospects**: two named per BDM, touched weekly, goal a meeting. Needs prospects named in HubSpot.
3. **Demo feedback**: red or green per demo, trend per rep, from the meeting notes. Needs the feedback field or note template.
4. **Customer portal onboarding** and **Media Hub on first event**: counts per rep. Need a HubSpot field each.
5. **Large accounts not come back**: CHF 20k+ in 24 months, nothing won in 12, owner and next action.
6. **Reply with a yes**: rep replies in the platform, the agent proposes the HubSpot change, the rep says yes. Needs HubSpot write and Sue's approval.
7. **Monthly commitment per rep**: "you said 40k, you are at 10k" trajectory line.
8. **Hosting and sign-in**: Netlify with Microsoft sign-in, Claude API for replies. Spends credits, so a cost estimate and Joe's yes first.

## Needs from people

- Sue: agree V1 scope on 9 Nov; say which of the next items come first.
- Sven: HubSpot fields for priority account, demo rating, portal onboarded, Media Hub; later write access for the agent.
- IT: Teams write consent, if messages should post by themselves.
