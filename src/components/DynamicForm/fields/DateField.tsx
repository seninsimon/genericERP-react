import { DatePickerInput } from '@mantine/dates';

export default function DateField({ column, value, isView, onChange }: any) {
  return (
    <DatePickerInput
      label={column.label}
      value={value || ""}
      disabled={isView}
      onChange={(e) => onChange(column.name, e)}
    />
  );
}