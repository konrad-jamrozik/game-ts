import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import * as React from 'react'

export type NumberFieldProps = {
  value: number
  onValueChange: (value: number | null) => void
  min?: number
  disabled?: boolean
  label?: string
  style?: React.CSSProperties
}

export function NumberField({
  value,
  onValueChange,
  min,
  disabled,
  label,
  style,
}: NumberFieldProps): React.JSX.Element {
  const [isFocused, setIsFocused] = React.useState(false)
  const fieldsetRef = React.useRef<HTMLFieldSetElement>(null)

  function handleFocus(): void {
    setIsFocused(true)
  }

  function handleBlur(): void {
    setIsFocused(false)
  }

  const borderColor =
    disabled === true
      ? 'rgba(255, 255, 255, 0.06)'
      : isFocused
        ? 'rgba(255, 255, 255, 0.87)'
        : 'rgba(255, 255, 255, 0.23)'

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <BaseNumberField.Root
        value={value}
        onValueChange={onValueChange}
        {...(min !== undefined && { min })}
        {...(disabled !== undefined && { disabled })}
      >
        <fieldset
          ref={fieldsetRef}
          style={{
            position: 'absolute',
            inset: 0,
            margin: 0,
            padding: 0,
            border: `1px solid ${borderColor}`,
            borderRadius: '4px',
            pointerEvents: 'none',
            transition: 'border-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          }}
        >
          {label !== undefined && label !== '' && (
            <legend
              style={{
                float: 'unset',
                width: 'auto',
                overflow: 'hidden',
                display: 'block',
                padding: 0,
                height: '11px',
                fontSize: '0.75rem',
                visibility: 'visible',
                maxWidth: '100%',
                transition: 'max-width 100ms cubic-bezier(0.0, 0, 0.2, 1) 50ms',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  paddingLeft: '5px',
                  paddingRight: '5px',
                  display: 'inline-block',
                  opacity: disabled === true ? 0.38 : 0.7,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {label}
              </span>
            </legend>
          )}
        </fieldset>
        <BaseNumberField.Group
          style={{
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: 'transparent',
          }}
        >
          <BaseNumberField.Decrement
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '8px 12px',
              cursor: disabled === true ? 'default' : 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              color: disabled === true ? 'rgba(255, 255, 255, 0.26)' : 'rgba(255, 255, 255, 0.87)',
            }}
          >
            −
          </BaseNumberField.Decrement>
          <BaseNumberField.Input
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '12px 8px',
              fontSize: '1rem',
              textAlign: 'center',
              minWidth: 0,
              backgroundColor: 'transparent',
              color: disabled === true ? 'rgba(255, 255, 255, 0.26)' : 'rgba(255, 255, 255, 0.87)',
            }}
          />
          <BaseNumberField.Increment
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '8px 12px',
              cursor: disabled === true ? 'default' : 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              color: disabled === true ? 'rgba(255, 255, 255, 0.26)' : 'rgba(255, 255, 255, 0.87)',
            }}
          >
            +
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    </div>
  )
}
