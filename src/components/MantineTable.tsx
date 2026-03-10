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
          background: "lightblue",
          color: "black",
          fontWeight: 600,
          fontSize: "15px",
          padding: "8px",
        },
      }}
      mantineTableBodyCellProps={{
        style: {
          padding: "4px 8px",
          fontSize: "15px",
          height: "28px",
        },
      }}
      mantineTableProps={{
        striped: true,
        highlightOnHover: true,
        withColumnBorders: true,
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
