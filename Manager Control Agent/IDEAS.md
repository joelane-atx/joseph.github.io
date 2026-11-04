# Manager Control Agent: ideas, from simple to the whole sales org

Built from Sue's brief (Otter "Joe / Sue", 3 Nov 2026) and a year of building agents at Interprefy. Short on purpose. Open the pages in this folder to see each idea working.

## 1. What Sue actually asked for, in one line each

- Strategy becomes a short, literal weekly list per rep. The agent ticks items off from HubSpot; reps never tick boxes.
- A manager view for Sue, and a view per rep. Sue can drill from the team to one person.
- Friday report to each rep and to Sue: done and missed. Not to get people in trouble, to make it visible.
- Reps can reply inside it and the agent does the HubSpot work, after a yes. Otherwise it is a telling-off platform.
- Clear, simple, no scrolling. Drill down for detail.
- Keep it between Joe and Sue for now.

## 2. Every initiative Sue mentioned, and how it is tracked

| # | Initiative | How HubSpot proves it | Ready? |
|---|---|---|---|
| 1 | Top 20 priority accounts per BDM (top 10 per SAM) worked weekly | Target Account flag per company, last activity date | Live, lists mostly empty for BDMs |
| 2 | Two strategic prospects per BDM, one touch a week, goal a meeting | Strategic Relationships = Strategic Prospects, activity | Live, prospects need naming |
| 3 | John Top 25 partnered with BDMs: worked, not worked, revenue | Strategic Relationships = John Top 25, revenue | Live |
| 4 | New business activity visible (2027: twice the new business) | Calls and emails logged per week | Live |
| 5 | Inbound leads followed on the 12 day cadence | "New Lead in" tasks overdue | Live |
| 6 | Meeting type on every meeting | Call and meeting type field | Live |
| 7 | Outcome on every past meeting | Meeting outcome field | Live |
| 8 | Meetings recorded (flag the ones that are not) | Recording on the meeting; Teams and Otter not visible yet | Live, decision needed |
| 9 | Demo feedback, red demos visible, trends per rep | New field Demo rating plus transcript summary | Needs a field |
| 10 | Lost deals with reason and competitor feedback | Closed Lost Reason, Lost to which competitor | Live |
| 11 | No close dates in the past | Open deals, live stages, close date | Live |
| 12 | No stale deals (30 days no activity) | Last activity date | Live |
| 13 | Every open deal has a next task; overdue task flags | Next activity date | Live |
| 14 | Monthly forecast on trajectory ("you said 40k, you are at 10") | Due to close vs a commitment per rep per month | Needs a number per rep |
| 15 | Large past customers not come back | Revenue, last won deal, no activity | One query, planned |
| 16 | Customer portal onboarding | Company field Portal onboarded | Needs a field |
| 17 | Media Hub free on first event: how many given | Deal checkbox or quote line item | Needs a field |
| 18 | Q4 incentive leaderboard, top of mind | Closed won CHF since the start | Live, rule to confirm |
| 19 | Monthly HubSpot owner audit: every customer has an owner | Companies with no owner or an inactive owner | Planned |
| 20 | Tool rollout: Claude, Outlook, HubSpot connected per person | Kept by the agent owner, daily nudges | Live |
| 21 | Sue's comment on a rep's activity, rep replies | This system | Prototype |
| 22 | 1:1 becomes coaching: lost reasons, not metrics | Lost reasons and demo trends per rep | From 9 and 10 |
| 23 | Protected new business time (parked by Sue) | Calendar blocks vs calls logged | Later |

## 3. Where the reps log in: five options

| Option | Cost | Replies to the agent | Best for |
|---|---|---|---|
| A. Open the page from the shared OneDrive folder (Sales Agent Handover Pack) | None | No, read only | Next week |
| B. Inside Claude, as a Sales Agent skill ("my week") | Claude seats only, no hosting | Yes, the rep says yes in chat and the agent updates HubSpot | The pilot, fits the one rule |
| C. Hosted site (Netlify) with Microsoft sign-in and the Claude API for replies | Netlify credits and API cost, warn first | Yes | Q1 rollout, phone friendly |
| D. HubSpot only: custom dashboard, task queue, workflows | None | No agent | If leadership wants no new tool |
| E. Teams: the Friday report posted as a message, replies in the thread | None, needs IT consent for Teams write | Partly | Reaching reps who ignore everything else |

Recommendation: A plus B for the pilot (zero spend), C in Q1 once Sue says it is helpful.

## 4. The prototype ladder

1. **My Week** (`weekly-list.html`): six things per rep, ticked by HubSpot, a note from Sue, a team grid. Could run next Monday.
2. **Manager Control** (`index.html`): Sue's three priorities as three views, manager table, rep view, Friday report. The 9 Nov demo.
3. **Sales Command Center** (`command-center.html`): the whole org. 23 initiatives with owners, targets, sources and status; scorecards and leaderboard; meetings intelligence with demo ratings and lost reasons; pipeline and forecast; account coverage; an agent inbox of proposed HubSpot changes waiting for a yes; rollout; four roles: Executive, Head of sales, Rep, Agent owner.

## 5. What makes the advanced one different (and sellable)

- **Strategy to activity, not dashboards.** Initiatives are first class: name, why, measure, source, cadence, target, status. Any sales leader can add one in plain words; the agent works out how to check it in the CRM.
- **The CRM is the judge.** Nothing is self reported. Every tick comes from a logged activity, a field, a date.
- **The human yes.** The agent proposes every CRM change in an inbox; a person approves. Audit trail by design. This is what made the Sales Agent pilot trusted at Interprefy.
- **Two way by default.** Manager note on the activity, rep reply in the same place, Friday report carries both.
- **Roles, not reports.** The CEO sees new business share and initiative health; the head of sales sees who needs them; the rep sees six things to do; the owner sees data quality.
- **Data hygiene is a side effect.** Reps fix close dates, types and outcomes because the list asks them to, not because of a HubSpot audit.
- **Runs anywhere.** A local page today, a Claude skill tomorrow, a hosted app when wanted. Same data shape, same rules.

Lessons from Interprefy this year baked in: the one rule (SOP, section 2); figures only with a source and a date; never ship a rep's details or performance in shared files; speed beats cleverness on follow up; returning customers are the biggest expansion source; rollouts stall on connectors, so track them daily; keep the page to one screen, Sue does not scroll.

## 6. Next ideas once the base is running

- **Monday build:** the agent writes each rep's week into HubSpot tasks (after Sue's yes once per week), so the list lives where reps already work.
- **Coaching card:** before each 1:1, one page per rep: lost reasons, demo ratings, prospects touched, what changed since last time.
- **Forecast with memory:** store each rep's monthly commitment and show the trajectory line week by week.
- **Account anniversaries:** rebook asks 8 to 12 weeks before last year's event, from won deals.
- **Expansion radar:** customers with new offices or entities (the Expansion Agent's data) as a coverage initiative.
- **Finance loop:** overdue invoices by rep (Finance Desk data) as a hygiene initiative.
- **Knowledge loop:** demo questions the reps could not answer, fed to the Knowledge Agent.
- **Product feedback digest:** monthly summary of lost reasons and demo comments for product and marketing.
- **Org licence:** the same system for any team on HubSpot or Salesforce, with the initiative library as the product.
