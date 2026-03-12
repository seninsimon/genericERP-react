import { Select, MultiSelect } from "@mantine/core";

export default function RelationField({
  column,
  value,
  relations,
  isView,
  onChange,
}: any) {
  const options = relations[column.name] || [];

  if (column.multiple) {
    return (
      <MultiSelect
        label={column.label}
        data={options}
        value={Array.isArray(value) ? value.map(String) : []}
        disabled={isView}
        searchable
        clearable
        onChange={(v) => onChange(column.name, v)}
      />
    );
  }

  return (
    <Select
      label={column.label}
      data={options}
      value={value || null}
      disabled={isView}
      searchable
      clearable
      onChange={(v) => onChange(column.name, v)}
    />
  );
}