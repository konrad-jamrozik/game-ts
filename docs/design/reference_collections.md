# Data tables reference

This document lists table with core game collections like leads, missions, enemy units, etc.

# Baseline agent stats

Newly hired agent has:

- 30 hit points
- 100 skill
- 10 damage weapon, meaning it has a damage range of 5-15

# Enemy units

| Cult unit      | Officer | Alias   | Skill | HP  |    Damage    |
| -------------- | :-----: | ------- | :---: | :-: | :----------: |
| Initiate       |         | In Init |  40   | 20  | 8  (  4-12 ) |
| Operative      |         | Op Oper |  60   | 20  | 10 (  5-15 ) |
| Handler        |   yes   | Hn Hndl |  70   | 20  | 10 (  5-15 ) |
| Soldier        |         | Sl Sldr |  100  | 30  | 14 (  7-21 ) |
| Lieutenant     |   yes   | Lt Ltnt |  120  | 30  | 14 (  7-21 ) |
| Elite          |         | El Elit |  200  | 40  | 20 ( 10-30 ) |
| Commander      |   yes   | Cm Cmdr |  250  | 40  | 20 ( 10-30 ) |
| High Commander |   yes   | HC HCmd |  400  | 50  | 30 ( 15-45 ) |
| Cult leader    |   yes   | CL CLdr |  800  | 80  | 40 ( 20-60 ) |

Typical ratios:

- 1 handler for 5-8 (initiates or operatives)
- 1 lieutenant for 2-3 handlers and 4-5 soldiers
- 1 commander for 2 lieutenants and 2 elites
- 1 high commander for 3 commanders and 4 elites

# Offensive missions

The table below shows some of the details of player offensive missions.

| Mission                       | Exp | Troops                      | Officers                      | MoneyR | FundR |  PanicR | Suppr. |
| ----------------------------- | --- | --------------------------- | ----------------------------- | -----: | ----: | ------: | -----: |
| Apprehend cult member         |   3 |  2 In,   1 Op               |                               |      5 |     0 |  0.05 % |      0 |
| Raid cult safehouse           |   8 |  4 In,   4 Op               | 1 Hn                          |    100 |     5 |  0.1  % |      1 |
| Raid cult outpost             |  10 |  8 In,   8 Op,  2 Sl        | 3 Hn                          |    400 |    10 |  0.5  % |    1-3 |
| Raid cult training facility   |  12 | 30 In,  16 Op,  4 Sl        | 6 Hn,  1 Lt                   |    800 |    15 |    1  % |    3-9 |
| Raid cult logistics hub       |  15 | 12 In,  24 Op, 10 Sl,  2 El | 5 Hn,  2 Lt, 1 Cm             |  2,000 |    20 |    2  % |   5-15 |
| Raid cult command center      |  20 |  - In,  20 Op, 20 Sl,  6 El | 4 Hn,  4 Lt, 3 Cm             |  3,000 |    25 |    5  % |  10-30 |
| Raid cult regional stronghold |  30 |  - In,   - Op, 40 Sl, 10 El | - Hn,  8 Lt, 3 Cm, 1 HC       |  5,000 |    50 |   10  % |  15-45 |
| Raid cult HQ                  |  40 |  - In,   - Op, 60 Sl, 20 El | - Hn, 12 Lt, 6 Cm, 2 HC, 1 CL | 10,000 |   100 |   20  % |    N/A |

For descriptions see https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/69367e41-e044-8332-baa8-f61660ca87af

Legend:
`Exp` - In how many turns the mission expires.
`Troops` - What troop-type enemies are present on the mission.
`Officers` - What officer-type enemies are present on the mission.
`MoneyR` - Money reward.
`FundR` - Funding reward.
`IntelR` - Intel reward.
`PanicR` - Panic reduction.
`ThreatR` - Threat reduction of given faction.
`SupprR` - Suppression reward (increase) of given faction.

# Defensive missions / Faction operations

The table below shows some of the details of player defensive missions, to counter faction operations.

KJA Update the values in the defensive missions table; now they are made up.

| Mission                                  | Lvl | Exp | Troops                    | Officers               | Money | Fund       | Intel | Panic            | Threat           | Suppr  |
| ---------------------------------------- | :-: | --- | ------------------------- | ---------------------- | ----: | ---------: | ----: | ---------------: | ---------------: | -----: |
| Foil recruitment push                    | 1   | 2   | 1 In,   1 Op              |                        |     0 |    0 / -0  |     5 |   0.1 % / -0.2 % |  0.02 % / -0.1 % |  0.2 % |
| Foil business extortion                  | 1   | 2   | 2 In                      |                        |     0 |    0 / -0  |     5 |  0.15 % / -0.3 % |  0.02 % / -0.1 % |  0.2 % |
| Foil supply theft                        | 1   | 3   | 2 In,   1 Op              |                        |    10 |    0 / -5  |    10 |   0.2 % / -0.4 % | 0.05 % / -0.15 % |  0.5 % |
| Foil sabotage                            | 2   | 3   | 2 In,   2 Op              |                        |     0 |    2 / -5  |    10 |   0.3 % / -0.6 % |  0.05 % / -0.2 % |    1 % |
| Foil VIP assassination                   | 2   | 4   | 3 In,   2 Op              | 1 Hn                   |     0 |   5 / -10  |    15 |     0.5 % / -1 % |   0.1 % / -0.3 % |    2 % |
| Defend against office raid               | 2   | 4   | 4 In,   3 Op              | 1 Hn                   |     0 |   5 / -10  |    15 |   0.8 % / -1.5 % |   0.1 % / -0.5 % |    3 % |
| Foil financial heist                     | 3   | 5   | 3 In,   4 Op,  2 Sl       | 1 Hn, 1 Lt             |    50 |   10 / -20 |    25 |       1 % / -2 % |   0.3 % / -0.8 % |    8 % |
| Intercept arms deal                      | 3   | 6   | 2 In,   5 Op,  3 Sl       | 2 Hn                   |   150 |   10 / -20 |    30 |     0.8 % / -2 % |     0.4 % / -1 % |   12 % |
| Defend against facility raid             | 3   | 6   | 4 In,   6 Op,  4 Sl       | 2 Hn, 1 Lt             |     0 |   10 / -25 |    25 |     1.5 % / -3 % |     0.5 % / -1 % |   15 % |
| Defend against city government assault   | 4   | 8   | -       8 Op,  6 Sl, 2 El | 3 Hn, 2 Lt, 1 Cm       |     0 |   15 / -30 |    40 |       3 % / -6 % |       2 % / -3 % |   30 % |
| Counter civilian terror                  | 4   | 8   | -       6 Op,  8 Sl, 3 El | 2 Hn, 2 Lt             |     0 |   15 / -40 |    50 |     5 % / -10 %  |     2.5 % / -4 % |   35 % |
| Defend against retaliation strike        | 4   | 10  | -      10 Op, 10 Sl, 4 El | 4 Hn, 3 Lt, 1 Cm       |     0 |   20 / -50 |    60 |       4 % / -8 % |       3 % / -5 % |   45 % |
| Foil nuclear plant bombing               | 5   | 12  | -             15 Sl, 5 El | -     3 Lt, 2 Cm       |     0 |  40 / -75  |    80 |    15 % / -25 %  |    10 % / -15 %  |   80 % |
| Foil coup attempt                        | 5   | 12  | -             15 Sl, 5 El | -     3 Lt, 2 Cm       |     0 |  40 / -75  |    80 |    15 % / -25 %  |    10 % / -15 %  |   80 % |
| Defend military installation             | 5   | 12  | -             15 Sl, 5 El | -     3 Lt, 2 Cm       |     0 |  40 / -75  |    80 |    15 % / -25 %  |    10 % / -15 %  |   80 % |
| Defend against HQ assault                | 6   | 15  | -             20 Sl, 8 El | -     4 Lt, 3 Cm, 1 HC |     0 |  50 / -150 |   100 |    20 % / -30 %  |    15 % / -20 %  |  100 % |

Legend:
`Lvl` - Mission level (1-5), indicating difficulty tier.
`Exp` - In how many turns the mission expires.
`Troops` - What troop-type enemies are present on the mission.
`Officers` - What officer-type enemies are present on the mission.
`Money` - Money reward.
`Fund` - Funding reward on success / penalty on failure (negative = funding loss).
`Intel` - Intel reward.
`Panic` - Panic reduction on success / penalty on failure (negative = panic increase).
`Threat` - Threat reduction on success / penalty on failure (negative = threat increase).
`Suppr` - Suppression reward (increase) of given faction.

Level description:
- Level 1 = soft operations
- Level 2 = violent but small-scale
- Level 3 = strategic threats
- Level 4 = regional destabilization
- Level 5 = global conflict
- Level 6 = existential
-

# Leads

The leads system follows a progression chain where completing missions unlocks new investigation opportunities.

| ID                              | Intel Cost | Repeatable |
| ------------------------------- | ---------: | :--------: |
| Criminal organizations          |         10 |   false    |
| Cult profile                    |         50 |   false    |
| Locate cult member              |         20 |    true    |
| Interrogate cult member         |          0 |   false    |
| Locate cult safehouse           |         50 |    true    |
| Interrogate cult handler        |          0 |   false    |
| Locate cult outpost             |        100 |    true    |
| Interrogate cult soldier        |          0 |   false    |
| Locate cult training facility   |        200 |    true    |
| Interrogate cult lieutenant     |          0 |   false    |
| Locate cult logistics hub       |        300 |    true    |
| Interrogate cult commander      |          0 |   false    |
| Locate cult command center      |        400 |    true    |
| Analyze command structure      |        500 |   false    |
| Locate cult regional stronghold |        600 |    true    |
| Interrogate cult high commander |          0 |   false    |
| Locate cult HQ                  |        800 |    true    |
| Interrogate cult leader         |          0 |   false    |

# Dependency diagram

The diagram below shows the dependencies between leads and missions.

<!-- cspell:disable -->
```mermaid
graph TD;
    %% Left column = Leads, Right column = Missions

    subgraph Missions
        direction TB
        AppreMembr[Apprehend cult member]
        RaidSafhse[Raid cult safehouse]
        RaidOutpst[Raid cult outpost]
        RaidTrainFac[Raid cult training facility]
        RaidLogHub[Raid cult logistics hub]
        RaidCmdCtr[Raid cult command center]
        RaidRegStr[Raid cult regional stronghold]
        RaidHeadqr[Raid cult HQ]
        TermCult[Terminate cult]
    end
    
    subgraph Leads
        direction TB
        CrimOrganz[Criminal organizations]
        LocatMembr[Locate cult member]
        IntrgMembr[Interrogate cult member]
        LocatSafhse[Locate cult safehouse]
        IntrgHndlr[Interrogate cult handler]
        LocatOutpst[Locate cult outpost]
        IntrgSoldr[Interrogate cult soldier]
        LocatTrainFac[Locate cult training facility]
        IntrgLietn[Interrogate cult lieutenant]
        LocatLogHub[Locate cult logistics hub]
        IntrgCmndr[Interrogate cult commander]
        LocatCmdCtr[Locate cult command center]
        AnalyzCmdStr[Analyze command structure]
        LocatRegStr[Locate cult regional stronghold]
        IntrgHiCmd[Interrogate cult high commander]
        LocatHeadqr[Locate cult HQ]
        IntrgCultLdr[Interrogate cult leader]
        CultProfil[Cult profile]
    end

    CrimOrganz --> LocatMembr
    LocatMembr --> AppreMembr
    AppreMembr --> IntrgMembr
    IntrgMembr --> LocatSafhse
    IntrgMembr --> CultProfil
    LocatSafhse --> RaidSafhse
    RaidSafhse --> IntrgHndlr
    IntrgHndlr --> LocatOutpst
    LocatOutpst --> RaidOutpst
    RaidOutpst --> IntrgSoldr
    IntrgSoldr --> LocatTrainFac
    LocatTrainFac --> RaidTrainFac
    RaidTrainFac --> IntrgLietn
    IntrgLietn --> LocatLogHub
    LocatLogHub --> RaidLogHub
    RaidLogHub --> IntrgCmndr
    IntrgCmndr --> LocatCmdCtr
    LocatCmdCtr --> RaidCmdCtr
    RaidCmdCtr --> AnalyzCmdStr
    AnalyzCmdStr --> LocatRegStr
    LocatRegStr --> RaidRegStr
    RaidRegStr --> IntrgHiCmd
    IntrgHiCmd --> LocatHeadqr
    LocatHeadqr --> RaidHeadqr
    RaidHeadqr --> IntrgCultLdr
    IntrgCultLdr --> TermCult
```
<!-- cspell:enable -->
