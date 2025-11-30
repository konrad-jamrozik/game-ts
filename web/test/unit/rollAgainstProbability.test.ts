import { describe, expect, test } from 'vitest'
import { rollAgainstProbabilityQuantized, rollAgainstProbabilityFloat } from '../../src/lib/turn_advancement/rolls'
import { rand } from '../../src/lib/utils/rand'

/**
 * See also related tests in fmtRoll.test.ts
 */
describe('rollAgainstProbability', () => {
  // Note:
  // Roll is a random number in [0, 1)
  // As such:
  // - probability of 0 will cause the roll to always fail, Success = Roll >= 1 -> impossible.
  // - probability of 1 will cause the roll to always succeed. Failure = Roll < 0 -> impossible.
  //
  // Note: probability of 1 in the test cases below is in fact 0.(9) - see rand.ts for details.
  // prettier-ignore
  test.each<[number, number, boolean, boolean]>([
        [0,        0,        false , false ], // { prob: 0      , roll: 0,     , success: false }
        [0,        0.9999,   false , false ], // { prob: 0      , roll: 0.9999 , success: false }
        [0.0001,   0.9998,   false , false ], // { prob: 0.0001 , roll: 0.9998 , success: false }
        [0.0001,   0.9999,   true  , true  ], // { prob: 0.0001 , roll: 0.9999 , success: true  }
        [0.0001,   1,        true  , true  ], // { prob: 0.0001 , roll: 1      , success: true  }
        [0.0002,   0.9997,   false , false ], // { prob: 0.0002 , roll: 0.9997 , success: false }
        [0.0002,   0.9998,   true  , true  ], // { prob: 0.0002 , roll: 0.9998 , success: true  }
        [0.3,      0.7,      true  , true  ], // { prob: 0.3    , roll: 0.7    , success: true  }
        [0.5,      0.4999,   false , false ], // { prob: 0.5    , roll: 0.4999 , success: false }
        [0.5,      0.5,      true  , true  ], // { prob: 0.5    , roll: 0.5    , success: true  }
        [0.5555,   0.4445,   true  , true  ], // { prob: 0.5555 , roll: 0.5555 , success: true  }
        [0.9998,   0.0001,   false , false ], // { prob: 0.9998 , roll: 0.0001 , success: false }
        [0.9998,   0.0002,   true  , true  ], // { prob: 0.9998 , roll: 0.0002 , success: true  }
        [0.9999,   0,        false , false ], // { prob: 0.9999 , roll: 0      , success: false }
        [0.9999,   0.0001,   true  , true  ], // { prob: 0.9999 , roll: 0.0001 , success: true  }
        [1,        0,        true  , true  ], // { prob: 1      , roll: 0      , success: true  }
        [1,        0.0001,   true  , true  ], // { prob: 1      , roll: 0.0001 , success: true  }
        [1,        0.9999,   true  , true  ], // { prob: 1      , roll: 0.9999 , success: true  } 
        
        // Rolls above Fixed4 precision     
        [0.0001,   0.999_89, false , false ], // { prob: 0.0001   , roll: 0.999_89, float: false , quant: false }
        // ⚠️ Notice the result difference 
        [0.000_01, 0.999_99, true  , false ], // { prob: 0.000_01 , roll: 0.999_99, float: true  , quant: false }
        [0.000_01, 0.999_98, false , false ], // { prob: 0.000_01 , roll: 0.999_98, float: false , quant: false }
        [0.555_55, 0.444_45, true  , true  ], // { prob: 0.555_55 , roll: 0.444_45, float: true  , quant: true  }
        // ⚠️ Notice the result difference 
        [0.555_55, 0.444_44, false , true  ], // { prob: 0.555_55 , roll: 0.444_44, float: false , quant: true  }
    ])( 
      'prob: %f, roll: %f -> float success: %s, quantized success: %s',
      (probability, roll, expectedFloatSuccess, expectedQuantizedSuccess) => {
        rand.set('injected_roll_result', roll)
        const rollResultFloat = rollAgainstProbabilityFloat(probability, 'injected_roll_result')
        const rollResultQuantized = rollAgainstProbabilityQuantized(probability, 'injected_roll_result')
        expect(rollResultFloat.success).toBe(expectedFloatSuccess)
        expect(rollResultQuantized.success).toBe(expectedQuantizedSuccess)
      },
    )
})
