import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";

type Props<T extends Record<string, any>> = {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  loading?: boolean;
};

export default function MantineTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
}: Props<T>) {
  return (
    <MantineReactTable
      columns={columns}
      data={data}
      enableColumnPinning
      enableColumnResizing
      layoutMode="grid"
      initialState={{
        density: "xs",
      }}
      state={{
        isLoading: loading,
        columnPinning: {
          right: ["actions"],
        },
      }}
    />
  );
}