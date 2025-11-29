# About numbers

This document explains how numbers are handled in the codebase, including:

- Number types: integers, floating point numbers, fixed point numbers, percentages, basis points, fractions, decimals
- Precision of computation, including rounding.
- Formatting, to display to the player

# Number types

Integer numbers, i.e. without decimal part, are stored (`stored` meaning `saved to a persistent storage`)
as plain [`number` type].

Fractional numbers are stored as type `Fixed6`, i.e. numbers with 6 decimal places precision.

Intermediate computations based on fractional numbers that require floating point precision
are performed using floating point numbers, so in code they also show as `number` type.
E.g. multiplication or division of two `Fixed6` numbers results in a floating point number.

Intermediate computations based on fractional numbers that do not require floating point precision
are performed using arithmetic operations on `Fixed6` numbers.
E.g. addition or subtraction of `Fixed6` numbers results in a `Fixed6` number
without any loss of precision.

There are no other numbers in the codebase. As such if you see a `number` type,
it is either an integer or a transient floating point number derived from the integer numbers
or `Fixed6` numbers.

Internally, `Fixed6` numbers are stored as integers where 1 is equal to 0.000001 (one millionth),
meaning plain number 1 is equal to `Fixed6` number 1_000_000.

# Number type conversions & arithmetic operations precision

While fractional numbers are stored as `Fixed6`, any floating point operations made
on them use full available `number` precision.

As such `Fixed6` is used only when:

- A floating point number needs to be stored.
  Then it is first converted to `Fixed6` by **rounding** to 6 decimal places.
- The computations do not require floating point precision. E.g. because `Fixed6` is added to an integer,
  or there is a series of `Fixed6` operations resulting in `Fixed6`, with no loss of precision at any point,
  e.g. because only additions and subtractions are performed.

# Number precision

In the codebase each domain model concept that is represented by numbers has its own `concept max number precision`,
or `concept precision` for short.

The max allowed `concept precision` for any concept is 4 decimal places.

For example, `suppression decay` concept can have constants as precise as `0.0001`, which is `0.01%`.
But it cannot be `0.00005`, because it would require constant precision of 5 decimal places.

As another example, `skill` concept can have constants as precise as `0.01`, which is `1%`.

Note that the actual computation can be more precise, e.g:

- Suppression `12.34%` multiplied by constant of `1.0002` results in `12.342468%` represented
  as an intermediate floating point number `0.12342468`.
- This floating point number can be then multiplied by another floating point number,
  resulting in yet another floating point number having even more decimal places.
- Such a floating point number may be used to store an updated suppression value in game state.
  Then it will have to be stored as `Fixed6` by **rounding** to 6 decimal places.
  So e.g. an intermediate floating point number `0.12342468` representing some derivation of the
  concept of suppression will be stored as `Fixed6` number `0.123425` or `12.3425%`.

Because storage is done in `Fixed6` and all concepts are limited to at most 4 decimal places,
this gives 2 decimal places of “precision buffer”: rounding error (±0.000001) is always smaller
than the smallest concept precision step (0.0001).

# Number formatting

Given domain model concept may be formatted in various ways, depending on the context.

E.g. the concept of `skill` has a `concept precision` of 2 decimal places, but usually it is formatted as an integer.
In few places where the precision is important it is formatted as a number with 2 decimal places.

Every time a number is formatted to a less decimal places than actual, the formatted number is **floored**
to the decimals places it is formatted to. This is independent from how values are stored:
storage uses rounding to the `Fixed6` grid, while presentation may still floor to avoid ever
displaying “optimistic” values.

The code supports formatting directly both `number` and `Fixed6` numbers.

# Full example

As a example, let's take a concept named `foobarness` that has a `concept precision` of 2 decimal places.
As such, it is stored as a `Fixed6` number. Usually it is formatted as an integer,
but in few places where fractions matter it is formatted as a number with 2 decimal places.

Initial game state may be initialized to have `foobarness` set to `13.00`.
It is multiplied every turn by `1.12`.
As such once player advances a turn, `foobarness` will be set to `13.00 * 1.12 = 14.56`.
The actual computation will look like that:

```typescript
// "asF6" means to convert a number to a Fixed6 number
// As such, stored_foobarness is stored as 13_000_000
const stored_foobarness: Fixed6 = asF6(13.0)

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

// "asF6" means to convert a number to a Fixed6 number by rounding to 6 decimals
// As such, stored_next_foobarness internally stored as integer 27_227_200,
// effectively rounding it to 27.227200, i.e. to 6 decimal places.
const stored_next_foobarness: Fixed6 = asF6(next_foobarness)
```

# Known limitations of this design

## 1. Floating-point quirks affect intermediate calculations

All domain math is performed using JavaScript `number`, which is a 64-bit binary floating-point type.
This means intermediate values can contain artifacts such as:

```typescript
if (value >= 0.5) 
// fails due to (0.49999999997 >= 0.5) == false
```

These artifacts do not persist (because values are clamped when stored as `Fixed6` via rounding),
but they **can influence logic** if intermediate results are used in comparisons, thresholds, or branching conditions.

Game logic that is sensitive to boundary values should use Fixed6-based comparisons or tolerant comparisons,
rather than comparing raw floats.

## 2. Quantization error due to rounding

When persisting values, conversion to `Fixed6` always **rounds** (never stores the full float).
This introduces a bounded quantization error of at most ±0.000001 in the stored value.

Because:

- all concepts are limited to 4 decimal places, and
- `Fixed6` resolution is 6 decimal places,

this quantization error is strictly smaller than the smallest concept precision step.
However, over many turns or repeated multiplications, this rounding may still introduce a small drift from the
mathematically “ideal” result. The drift is not systematically downward (as with flooring),
but it still exists and should be kept in mind when tuning mechanics.

### 3. “Concept precision” is not enforced by the type system

The rule that each concept may have at most 4 decimal places (or concept-specific limits like 2 decimals for skill)
is currently a **documentation-level constraint**. TypeScript cannot prevent a developer from accidentally writing:

```ts
const suppressionDecay = 0.00005; // illegal by policy
```

Such mistakes silently work but violate the design.
This may lead to tuning inconsistencies or accidental use of higher-precision constants than intended.

### 4. Overloaded meanings of `number`

Although the design intends that plain `number` represents either integers or transient floating-point intermediates,
TypeScript does not distinguish these two forms.
As a result, it is possible to:

- Pass a non-integer `number` where an integer was expected,
- Convert arbitrary `number` values into `Fixed6`,
- Accidentally mix incompatible numeric concepts.

This requires developer discipline, since the compiler cannot enforce the separation.

### 5. Formatting rules are separate from storage rules

A concept may have a certain precision (e.g. 2 decimals) but be formatted as an integer in most places.
This separation is flexible but also increases the chance of inconsistent presentation if formatting helpers are
misused or omitted.

### 7. All fractional concepts share the same storage precision

Every fractional value is stored as `Fixed6`, even if its concept precision is only 2 or 3 decimals.
This is convenient, but it also means:

- The system does not communicate the *intended* conceptual precision,
- Some concepts may accumulate more noise than expected during intermediate float computations.

[`number` type]: https://www.typescriptlang.org/docs/handbook/basic-types.html#number
