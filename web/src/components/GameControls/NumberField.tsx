import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import * as React from 'react'

export type NumberFieldProps = {
  value: number
  onValueChange: (value: number | null) => void
  min?: number
  disabled?: boolean
  style?: React.CSSProperties
}

export function NumberField({ value, onValueChange, min, disabled, style }: NumberFieldProps): React.JSX.Element {
  return (
    <BaseNumberField.Root
      value={value}
      onValueChange={onValueChange}
      {...(min !== undefined && { min })}
      {...(disabled !== undefined && { disabled })}
      {...(style !== undefined && { style })}
    >
      <BaseNumberField.Group
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <BaseNumberField.Decrement
          style={{
            border: 'none',
            background: 'transparent',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
          }}
        >
          −
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: '12px 8px',
            fontSize: '1rem',
            textAlign: 'center',
            minWidth: 0,
          }}
        />
        <BaseNumberField.Increment
          style={{
            border: 'none',
            background: 'transparent',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
          }}
        >
          +
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  )
}
