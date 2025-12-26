# About mission threat assessment

When player is presented information about missions, they have they have a `threat assessment` value
that tells the player how dangerous the mission is.

The formula for the threat assessment is:

``` text
for each enemy unit in the mission:
  add the enemy threat assessment to the final mission threat assessment

enemy threat assessment is calculated as:
  enemy skill * (1 + (enemy hit points / 100) + (enemy weapon base damage * 2 / 100))
  rounded to the nearest integer
```

Few examples:

| Skill | HP  | damage | Threat assessment | Formula                                 |
| ----- | --- | ------ | ----------------- | --------------------------------------- |
| 40    | 20  | 8      | 54                | `40*(1+0.2+0.16) = 40*1.36 = 54.4 = 54` |
| 60    | 25  | 10     | 87                | `60*(1+0.25+0.2) = 60*1.45`             |
| 100   | 100 | 10     | 220               | `100*(1+1+0.2) = 100*2.2 = 220`         |
