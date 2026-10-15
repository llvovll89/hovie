import { useId } from 'react'
import * as Select from '@radix-ui/react-select'
import { Check } from '@phosphor-icons/react/dist/csr/Check'
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown'
import { CaretUp } from '@phosphor-icons/react/dist/csr/CaretUp'
import './filter-select.css'

interface Props {
  label: string
  value: string | number
  options: { value: string | number; label: string }[]
  onChange: (value: string) => void
  disabled?: boolean
}
// Radix reserves an empty value for placeholders. Keep the public filter API empty-string based.
const ALL = '__all__'
export default function FilterSelect({ label, value, options, onChange, disabled }: Props) {
  const id = useId()
  return <div className="field filter-select">
    <label id={id + '-label'} htmlFor={id}>{label}</label>
    <Select.Root value={String(value) || ALL} onValueChange={v => onChange(v === ALL ? '' : v)} disabled={disabled}>
      <Select.Trigger id={id} aria-labelledby={id + '-label'} className="filter-select-trigger">
        <Select.Value /><Select.Icon className="filter-select-chevron"><CaretDown size={16} /></Select.Icon>
      </Select.Trigger>
      <Select.Content aria-label={label} className="filter-select-content" position="popper" sideOffset={7} collisionPadding={16} onEscapeKeyDown={e => e.stopPropagation()}>
        <Select.ScrollUpButton className="filter-select-scroll"><CaretUp size={16} /></Select.ScrollUpButton>
        <Select.Viewport className="filter-select-viewport">
          {options.map(option => <Select.Item key={String(option.value)} value={String(option.value) || ALL} className="filter-select-option">
            <Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator><Check size={17} weight="bold" /></Select.ItemIndicator>
          </Select.Item>)}
        </Select.Viewport>
        <Select.ScrollDownButton className="filter-select-scroll"><CaretDown size={16} /></Select.ScrollDownButton>
      </Select.Content>
    </Select.Root>
  </div>
}
