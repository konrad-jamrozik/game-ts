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

## Concept number precision

// KJA call it `concept number precision` and elaborate it is not only for constants

In the codebase the concept of `constants precision` is used to describe the precision of various constants
that appear in the codebase.

The max allowed constant precision is 4 decimal places.

For example, "suppression decay" constant can be `0.0001`, which is `0.01%`.
But it cannot be `0.00005`, because it would require constant precision of 5 decimal places.

Note that the actual computation can be more precise, e.g:

- Suppression `12.34%` multiplied by constant of `1.0002` results in `12.342468%` represented
  as a intermediate floating point number `0.12342468`.
- This floating point number can be then multiplied by another floating point number,
  resulting in another floating point number having even more decimal places.
- A floating point number may be used to store an updated suppression value in game sate.
  Then it will have to be stored as `Fixed6` by flooring to 6 decimal places,
  resulting in `0.123424` or `12.3424%`.

# Concept number formatting

// KJA to document

Number formatting is independent on the underlying number type and depends on the concept it represents.
Furthermore, given concept may be formatted in various ways, depending on the context.

E.g. the concept of `skill` is often formatted as integer, even though its

While fractional numbers are stored as `Fixed6`, the `constants precision` and formatting
depends on the concept represented by the number.

For example:
- `suppression` constants are never more precise than basis points and presented to the player the same way. That is,
  all actual computations are done with fixed precision of 4, and formatted as a percentage with 2 decimal places,
  e.g. `12.34%`.
- `skill` is

[`number` type]: https://www.typescriptlang.org/docs/handbook/basic-types.html#number
