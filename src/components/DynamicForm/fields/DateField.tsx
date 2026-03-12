import { TextInput } from "@mantine/core";

export default function DateField({ column, value, isView, onChange }: any) {
  return (
    <TextInput
      type="date"
      label={column.label}
      value={value || ""}
      disabled={isView}
      onChange={(e) => onChange(column.name, e.target.value)}
    />
  );
}