# Timings and limits

Every fixed timing and limit of the networking plugin, for debugging. This page holds no rules of its own: each line points to the constant that sets it and the decision, issue or doc that says why. When a value here and its source disagree, the source wins; fix this page. The limits every package shares, from `@aeolus-fleet/common`, are in aeolus-fleet's [timings and limits](https://github.com/ThomasHendrickx/aeolus-fleet/blob/main/docs/timings-and-limits.md).

A default that configuration may change names its setting.

| Value | What it guards | Set in | Behind |
| --- | --- | --- | --- |
| keep-latest after 300 s | What a fleet's networking plugin declares until argo sets it | [network/declaration.ts](../packages/networking-plugin/src/core/network/declaration.ts) `DEFAULT_DECLARATION` | [0036](decisions/0036-networking-plugin-package.md), ThomasHendrickx/aeolus-fleet#260 |
| 10 s (default, `SUPPLY_RETRY_SECONDS`) | Supplying again what the fleet refused; a retry still running skips the next | [config.ts](../packages/networking-plugin/src/config.ts) `DEFAULT_SUPPLY_RETRY_SECONDS` | [0036](decisions/0036-networking-plugin-package.md), ThomasHendrickx/aeolus-fleet#260 |
| 5 s | Rescanning for fleets connected or switched on | [app.ts](../packages/networking-plugin/src/app.ts) `DEFAULT_RESCAN_MS` | none recorded |
| 1 s | Calling again after a fleet call is refused or fails | [fleet/fleet-watch.ts](../packages/networking-plugin/src/adapters/fleet/fleet-watch.ts) `RETRY_MS` | [0035](https://github.com/ThomasHendrickx/aeolus-fleet/blob/main/docs/decisions/0035-networking-plugin.md) |
| 25 s (0 on the first call) | One `fleet.follow` wait for declared rules | [network/follow-declarations.ts](../packages/networking-plugin/src/core/network/follow-declarations.ts) `WAIT_SECONDS` | [0037](https://github.com/ThomasHendrickx/aeolus-fleet/blob/main/docs/decisions/0037-declared-network-rules.md) |
| 10 | Deliveries per receive | [fleet/rest-fleet-door.ts](../packages/networking-plugin/src/adapters/fleet/rest-fleet-door.ts) `RECEIVE_MAX` | [architecture](networking-plugin.md) |
| 10 s (Prisma's), tried again without end | Prisma Migrate's advisory lock at start | [prisma/migrate.ts](../packages/networking-plugin/src/adapters/prisma/migrate.ts) `LOCK_TIMED_OUT` | none recorded |
| at least 32 characters | `INSTALLATION_TOKEN`, when set | [config.ts](../packages/networking-plugin/src/config.ts) `INSTALLATION_TOKEN_MIN_LENGTH` | [0020](https://github.com/ThomasHendrickx/aeolus-fleet/blob/main/docs/decisions/0020-installation.md) |
