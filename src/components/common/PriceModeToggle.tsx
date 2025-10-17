import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { PriceMode } from '../../types/models';

export default function PriceModeToggle({
  value,
  onChange,
  disabled,
}: {
  value: PriceMode;
  onChange: (mode: PriceMode) => void;
  disabled?: boolean;
}) {
  const handle = (e: RadioChangeEvent) => onChange(e.target.value);
  return (
    <Radio.Group value={value} onChange={handle} disabled={disabled}>
      <Radio.Button value="PREORDER">Đặt trước 3 ngày</Radio.Button>
      <Radio.Button value="INSTANT">Đặt ngay</Radio.Button>
      <Radio.Button value="CUSTOM">Tùy chỉnh</Radio.Button>
    </Radio.Group>
  );
}
