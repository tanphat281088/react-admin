import { InputNumber } from 'antd';

export default function MoneyInput({
  value, onChange, min = 0, disabled,
}: {
  value?: number;
  onChange?: (v: number) => void;
  min?: number;
  disabled?: boolean;
}) {
  return (
    <InputNumber
      style={{ width: '100%' }}
      min={min}
      value={value}
      disabled={disabled}
      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(val) => Number((val || '0').replace(/[^\d]/g, ''))}
      onChange={(v) => onChange?.(Number(v || 0))}
    />
  );
}
