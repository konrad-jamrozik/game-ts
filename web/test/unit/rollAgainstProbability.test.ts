import { describe, expect, test } from 'vitest'
import { rollAgainstProbability, rollAgainstProbabilityNew } from '../../src/lib/turn_advancement/rolls'
import { rand } from '../../src/lib/utils/rand'

describe(rollAgainstProbability, () => {
  // Note:
  // Probability of 0 will cause the roll to always fail, Success = Roll > 10_000 -> impossible.
  // Probability of 1 will cause the roll to always succeed. Failure = Roll <= 0 -> impossible.
  //
  // Note: probability of 1 in the test cases below is in fact 0.(9) - see rand.ts for details.
  // prettier-ignore
  test.each<[number, number, boolean]>([
    [0,      0,      false ], // { probability: 0      , roll: 0,     , success: false }
    [0,      0.9999, false ], // { probability: 0      , roll: 0.9999 , success: false }
    [0.0001, 0.9998, false ], // { probability: 0.0001 , roll: 0.9998 , success: false }
    [0.0001, 0.9999, true  ], // { probability: 0.0001 , roll: 0.9999 , success: true  }
    [0.0001, 1,      true  ], // { probability: 0.0001 , roll: 1      , success: true  }
    [0.0002, 0.9997, false ], // { probability: 0.0002 , roll: 0.9997 , success: false }
    [0.0002, 0.9998, true  ], // { probability: 0.0002 , roll: 0.9998 , success: true  }
    [0.5,    0.4999, false ], // { probability: 0.5    , roll: 0.4999 , success: false }
    [0.5,    0.5,    true  ], // { probability: 0.5    , roll: 0.5    , success: true  }
    [0.9998, 0.0001, false ], // { probability: 0.9998 , roll: 0.0001 , success: false }
    [0.9998, 0.0002, true  ], // { probability: 0.9998 , roll: 0.0002 , success: true  }
    [0.9999, 0,      false ], // { probability: 0.9999 , roll: 0      , success: false }
    [0.9999, 0.0001, true  ], // { probability: 0.9999 , roll: 0.0001 , success: true  }
    [1,      0,      true  ], // { probability: 1      , roll: 0      , success: true  }
    [1,      0.0001, true  ], // { probability: 1      , roll: 0.0001 , success: true  }
    [1,      0.9999, true  ], // { probability: 1      , roll: 0.9999 , success: true  }
  ])(
    'probability: %f, roll: %f -> success: %s',
    (probability, roll, expectedSuccess) => {
      rand.set('injected_roll_result', roll)
      console.log(`probability: ${probability}, roll: ${roll}, expectedSuccess: ${expectedSuccess}`)
      const rollResult = rollAgainstProbability(probability, 'injected_roll_result')
      const rollResultNew = rollAgainstProbabilityNew(probability, 'injected_roll_result')
      console.log(
        `probability: ${probability}, roll: ${roll}, expectedSuccess: ${expectedSuccess}, rollResult: ${rollResult.success}`,
      )
      expect(rollResult.success).toBe(expectedSuccess)
      expect(rollResultNew.success).toBe(expectedSuccess)
    },
  )
})
