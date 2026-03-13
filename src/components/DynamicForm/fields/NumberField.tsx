import { NumberInput } from "@mantine/core";

export default function NumberField({ column, value, isView, onChange }: any) {
  return (
    <NumberInput
      label={column.label}
      value={value}
      disabled={isView}
      onChange={(v) => onChange(column.name, v)}
    />
  );
}