import { Button, Group } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import type { MRT_ColumnDef } from "mantine-react-table";
import { confirmAction } from "../../utils/confirmModal";

type RowData = {
  _id: string;
  [key: string]: any;
};

type Props = {
  columns: MRT_ColumnDef<RowData>[];
  data: RowData[];
  isLoading: boolean;
  rowCount: number;

  pageIndex: number;
  pageSize: number;
  sorting: any[];
  globalFilter: string;

  setPageIndex: (v: number) => void;
  setPageSize: (v: number) => void;
  setSorting: (v: any[]) => void;
  setGlobalFilter: (v: string) => void;

  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function CustomTable({
  columns,
  data,
  isLoading,
  rowCount,
  pageIndex,
  pageSize,
  sorting,
  globalFilter,
  setPageIndex,
  setPageSize,
  setGlobalFilter,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <MantineReactTable
      columns={columns}
      data={data}
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
          maxHeight: "28px",
          minHeight: "28px",
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      }}
      mantineTableProps={{
        striped: true,
        highlightOnHover: true,
        withColumnBorders: true,
      }}
      mantineTopToolbarProps={{
        style: {
          background: "lightgray",
          borderBottom: "1px solid #D1D5DB",
          padding: "4px 8px",
          minHeight: "50px",
        },
      }}
      mantineTableContainerProps={{
        style: {
          height: "450px",
          maxHeight: "450px",
          overflowY: "auto",
        },
      }}
      manualPagination
      manualSorting
      manualFiltering
      rowCount={rowCount}
      state={{
        isLoading,
        pagination: { pageIndex, pageSize },
        sorting,
        globalFilter,
        columnPinning: {
          right: ["mrt-row-actions"],
        },
      }}
      onPaginationChange={(updater) => {
        const newState =
          typeof updater === "function"
            ? updater({ pageIndex, pageSize })
            : updater;

        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }}
      onGlobalFilterChange={setGlobalFilter}
      enableRowActions
      positionActionsColumn="last"
      enableColumnOrdering
      enableColumnPinning
      displayColumnDefOptions={{
        "mrt-row-actions": {
          size: 220,
        },
      }}
      renderRowActions={({ row }) => (
        <Group gap={4} wrap="nowrap">
          <Button
            size="xs"
            variant="light"
            px={8}
            onClick={() => onView(row.original._id)}
          >
            View
          </Button>

          <Button
            size="xs"
            variant="light"
            px={8}
            onClick={() => onEdit(row.original._id)}
          >
            Edit
          </Button>

          <Button
            size="xs"
            color="red"
            variant="light"
            px={8}
            onClick={() =>
              confirmAction("Are you sure you want to delete this row?", () =>
                onDelete(row.original._id),
              )
            }
          >
            Delete
          </Button>
        </Group>
      )}
    />
  );
}
