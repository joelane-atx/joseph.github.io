# Manager Control Agent

Sue Yardley's management view of the sales team, built by Joe Flaten. Brief taken 3 Nov 2026 (Otter "Joe / Sue"). Prototype to show Sue on Mon 9 Nov 2026, 8:00 CST, before her 1:1 with Oddmund.

## What it is for

Sue wants to see, without chasing, whether the strategy she sets is actually being worked. The agent turns the strategy into a short weekly list per rep, checks it against what is logged in HubSpot (so reps do not tick boxes themselves), and reports every Friday what was done and what was missed. A manager view for Sue, a view per rep. Reps can reply to the agent, and in the pilot the agent will update HubSpot for them after they say yes, so it helps rather than scolds.

## The first three views (Sue's priorities, in her words)

1. Priority accounts: top 20 per BDM, top 10 per SAM, and the new business activity done on them.
2. Meetings: type and outcome of each meeting so bad demos are visible, plus lost deals, competitor feedback, and a flag when a meeting has no recording.
3. Pipeline: what is due to close and how that changes, stale deals, close dates in the past.

Later: two named strategic prospects per BDM worked weekly, customer portal onboarding, demo feedback trends, Q4 incentive leaderboard, monthly HubSpot owner audit, Sue's comments on a rep's activity.

## Rules for this folder

- Read HubSpot only. Never create, change or delete anything in HubSpot from this folder.
- Build and test locally. No Netlify deploy, no AI Gateway or API spend, without Joe's yes and a credit estimate first.
- Post nothing and send nothing. No Teams messages, no email, no HubSpot notes.
- Keep every file in this folder.
- Keep this work between Joe and Sue until Sue says otherwise.
- Never commit real HubSpot data. `data/live.js` is the live snapshot and is listed in `.gitignore`. Only `data/sample.js` (made-up names) is committed.
- Plain language for Joe: bullets, lead with the answer, no em or en dashes.

## Files

- The build, from Sue's written brief (emailed 5 Nov, kept in `brief/`, not committed): `sales-control.html` (Sue's super control; view as Team Lead, John, rep), `delivery-options.html`, on `app/future.css` (dark style) and `app/engine.js` (Sue's rules suggest tasks, Sue's task store, evidence check against HubSpot, Teams message queue, replies, forecast lines, roll-up).
- `sales-control-orbit.html`: the same build with a spinning 3D org graph hero on the dashboard, kept as a second version so Joe can compare. `sales-control-ops.html`: third version, the orbit graph plus mission-control charts from `app/ops.js` (step and wave sparklines, thin bins, two-colour histogram, pods grid, rose by week, before and after dumbbells, Pareto, dispatch queue; all SVG, colours from CSS variables so light and dark both work). `app/orbit.js`: the spinning graph (canvas, no libraries). People are hubs; their priority accounts, deals and meetings orbit them. Drag to spin, hover a dot. Light and dark aware.
- Model: Sue has super control and sets the tasks. Everyone else has their own view in the same platform, limited to their scope; Sue can view as any of them and manage from there. Teams messages are queued only (post nothing).
- Sue's tasks are not HubSpot tasks. Her rules only suggest; nothing is on a list until Sue (or John, or a Team Lead) accepts or enters it. HubSpot is only the evidence the agent reads on Friday to confirm each task. HubSpot's own task list is shown only in the older prototypes, labelled "HubSpot tasks".

- `v1.html`: V1, the simple version from the 3 Nov call. One screen, real reps, Sue's three priorities, leaderboard, one nudge per person, drill-down drawer, a short task list (tasks entered here carry setBy 'Sue (V1)'), Teams message to copy. Visibility first. Sue can flag or comment on any priority account (`app/flags.js`, saved in the browser under `mca.flags`), the rep replies, and flags marked for HubSpot wait in a notes queue: copied by hand for now, never written from this folder.
- `v2.html`: V2, the full platform, in progress. Built on the ops version plus Initiative board (one tab per initiative from `data/initiatives.js`) and Tool setup (Claude, Outlook, HubSpot per person from `rollout` in the data, overrides saved in the browser under `mca.setup`). Plan and status in `V2-PLAN.md`.
- `demo-script.html`: run of show for Mon 9 Nov with live numbers from the snapshot, each point tagged to its source (call, brief, HubSpot), and the decisions to ask Sue for.
- Accuracy rules (checked 8 Nov against the brief): top 20 per BDM = Target Accounts (stand-in for the new Priority account property), Tier 1 first then lifetime revenue; strategic prospects and John Top 25 are separate lists; forecast uses HubSpot Forecast category (won + Commit + weighted Best case + weighted Pipeline and no category; Not forecasted left out); win, loss and disqualified over 90 days come from closed stages per owner.
- `prototypes.html`: start here, links the three prototypes and the demo script.
- `weekly-list.html`: simple prototype, My Week. `command-center.html`: advanced prototype, Sales Command Center. `app/common.js`: shared logic. `data/initiatives.js`: the initiative catalogue (no personal data).
- `IDEAS.md`: every initiative, how it is tracked, login options, the ladder, what to build next.
- `index.html`: the standard prototype. Open it in a browser, no server needed. Three views: Manager, Rep, Friday report.
- `data/live.js`: snapshot of HubSpot for the real reps (not committed). The page uses it when present.
- `data/sample.js`: made-up data so the page always opens. Used only when `live.js` is missing.
- `README.md`: how to open it, how to refresh the data, what to show Sue, what is next.

## How to refresh `data/live.js` (read only)

Latest build: 9 BDMs, 7 SAMs and 5 CSMs (HubSpot teams BDMs, SAM Team, CSMs). The snapshot also holds `forecast` (Forecast category per owner for deals closing this month, closed won this month, Direct Sales totals) and `closed90` (won, lost, disqualified per owner over 90 days).

Ask this chat: "refresh the Manager Control data". It then reads HubSpot with the HubSpot connector (never writes) for the 9 BDMs and 7 SAMs and rewrites `data/live.js` in the shape below. Window: this week (Mon to Sun) and last week.

- Reps: the BDMs team and the SAM team in HubSpot (owner ids and names).
- Accounts: companies owned by each rep that are Target Account = true, or on the Strategic Relationships lists "John Top 25" or "Strategic Prospects". Fields: name, domain, owner, abm_tier, interprefy_stakeholder_company, notes_last_updated, notes_last_contacted, hs_num_open_deals, num_associated_deals, total_revenue, country.
- Meetings: hs_meeting_start_time in the two weeks, with hs_activity_type, hs_meeting_outcome, hs_meeting_recording_duration, hs_object_source_label and the company name.
- Deals: open deals in live stages only (leave out Closed Sales Disqualified and Closed - Uncontactable). Three buckets: due to close (closedate today to 31 Dec), close date in the past, stale (notes_last_updated older than 30 days and closedate not in the past). Lists hold the largest deals; counts and sums per owner come from SQL totals. Closed won and closed lost since 30 days ago with closed_lost_reason_new and lost_to_which_competitor.
- Tasks: hs_timestamp in this week and last week, with subject, status, type. Counts per owner and status from SQL.
- Activity: calls and emails per owner per week from SQL (DATE_TRUNC week).

Use `query_crm_data` for counts and `search_crm_objects` for lists. The search tool's hs_is_closed filter is unreliable in this portal: filter by deal stage label instead.

## Definitions used in the page

- Worked this week: an activity logged on the account this week. Not touched: no activity in 30 days. Buying: has an open deal.
- Meeting gaps: no type, past meeting with no outcome, no recording attached in HubSpot (Teams and Otter recordings are not visible to HubSpot yet).
- Stale deal: open, live stage, no activity logged in 30 days.
