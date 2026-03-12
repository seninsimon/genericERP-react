import { TextInput } from "@mantine/core";

export default function TextField({ column, value, isView, onChange }: any) {
  return (
    <TextInput
      label={column.label}
      value={value || ""}
      disabled={isView}
      onChange={(e) => onChange(column.name, e.target.value)}
    />
  );
}