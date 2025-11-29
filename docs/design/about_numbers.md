# About numbers

This document explains how numbers are handled in the codebase, including:

- integers
- floating point numbers
- fixed point numbers
- percentages
- basis points
- fractions
- decimals
- formatting

# Number types

Integer numbers, i.e. without decimal part, are stored (`stored` meaning `saved to a persistent storage`)
as plain [`number` type].

Fractional numbers are stored as type `Fixed6`, i.e. numbers with 6 decimal places precision.

Intermediate computations based on fractional numbers are performed using floating point numbers,
so in code they also show as `number` type.

There are no other numbers in the codebase. As such if you see a `number` type,
it is either an integer or a transient floating point number derived from the integer numbers
or `Fixed6` numbers.

Internally,`Fixed6` numbers are stored as integers where 1 is equal to 0.000001 (one millionth),
meaning plain number 1 is equal to `Fixed6` number 1_000_000.

# Number type conversions & arithmetic operations precision

While fractional numbers are stored as `Fixed6`, any floating point operations made
on them use full available `number` precision.

As such `Fixed6` is used only when a floating point number needs to be stored.
Then it is converted to `Fixed6` by flooring to 6 decimal places.

# Number precision

In the codebase each concept that is represented by numbers has its own `concept max number precision`,
or `concept precision` for short.

The max allowed `concept precision` for any concept is 4 decimal places.

For example, `suppression decay` concept can have constants as precise as `0.0001`, which is `0.01%`.
But it cannot be `0.00005`, because it would require constant precision of 5 decimal places.

As another example, `skill` concept can have constants as precise as `0.01`, which is `1%`.

Note that the actual computation can be more precise, e.g:

- Suppression `12.34%` multiplied by constant of `1.0002` results in `12.342468%` represented
  as a intermediate floating point number `0.12342468`.
- This floating point number can be then multiplied by another floating point number,
  resulting in yet another floating point number having even more decimal places.
- Such a  floating point number may be used to store an updated suppression value in game sate.
  Then it will have to be stored as `Fixed6` by flooring to 6 decimal places.
  So e.g. an intermediate floating point number `0.12342468` representing some derivation of the
  concept of suppression will be stored as `Fixed6` number `0.123424` or `12.3424%`.

# Number formatting

Furthermore, given concept may be formatted in various ways, depending on the context.

E.g. the concept of `skill` has a `concept precision` of 2 decimal places, but usually it is formatted as an integer.
In few places where the precision is important it is formatted as a number with 2 decimal places.

# Full example

As a example, let's take a concept named `foobarness` that has a `concept precision` of 2 decimal places.
As such, it is stored as a `Fixed6` number. Usually it is formatted as an integer,
but in few places where fractions matter it is formatted as a number with 2 decimal places.

Initial game state may be initialized to have `foobarness` set to `13.00`.
It is multiplied every turn by `1.12`.
As such once player advances a turn, `foobarness` will be set to `13.00 * 1.12 = 14.56`.
The actual computation will look like that:

``` typescript
// "asF6" means to convert a number to a Fixed6 number
// As such, stored_foobarness is stored as 13_000_000
const stored_foobarness: Fixed6 = asF6(13.00)

// "asFloat" means to convert a Fixed6 number to a floating point number
// As such, foobarness is set to 13_000_000 / 1_000_000 = 13.00
const foobarness: number = asFloat(stored_foobarness)

// intermediate_foobarness == 14.560000000000002 
const intermediate_foobarness: number = foobarness * 1.12

// Display intermediate_foobarness as integer with 1 decimal places,
// after flooring to 1 decimal place.
// i.e. 14.5
console.log(fmtDec1(intermediate_foobarness))

// next_foobarness == 27.227200000000007 
const next_foobarness: number = intermediate_foobarness * 1.87

// Display next_foobarness as percentage with 2 decimal places,
// i.e. 2722.72%
console.log(fmtPct2(next_foobarness))

// "asF6" means to convert a number to a Fixed6 number
// As such, stored_next_foobarness internally stored as integer 27_227_200,
// effectively flooring it to 27.227200, i.e. to 6 decimal places.
const stored_next_foobarness: Fixed6 = asF6(next_foobarness)
```

[`number` type]: https://www.typescriptlang.org/docs/handbook/basic-types.html#number
