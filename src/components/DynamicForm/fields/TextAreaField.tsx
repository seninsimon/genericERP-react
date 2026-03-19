import { Textarea } from "@mantine/core";

export default function TextAreaField({
  column,
  value,
  isView,
  onChange,
}: any) {
  return (
    <Textarea
      label={column.label}
      value={value || ""}
      disabled={isView}
      minRows={4}
      autosize
      onChange={(e) => onChange(column.name, e.target.value)}
    />
  );
}