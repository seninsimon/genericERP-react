import { Checkbox } from "@mantine/core";

export default function BooleanField({ column, value, isView, onChange }: any) {
  return (
    <Checkbox
      label={column.label}
      checked={value || false}
      disabled={isView}
      onChange={(e) => onChange(column.name, e.currentTarget.checked)}
    />
  );
}