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
      mantineTableHeadCellProps={{
        style: {
          fontWeight: 600,
          fontSize: "14px",
          padding: "10px 12px",
          borderBottom: "1px solid #E5E7EB",
        },
      }}
      mantineTableBodyCellProps={{
        style: {
          padding: "8px 12px",
          fontSize: "14px",
          borderBottom: "1px solid #F3F4F6",
        },
      }}
      mantineTableProps={{
        striped: true,
        highlightOnHover: true,
        withColumnBorders: false,
      }}
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
