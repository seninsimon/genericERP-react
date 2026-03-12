import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Group, Box, Text } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table";

import {
  useTableData,
  useDeleteData,
} from "../../api/reactQueryHooks/useTables";
import CustomTable from "./MantineTable";

type RowData = {
  _id: string;
  [key: string]: any;
};

export default function TableListPage() {
  const { table } = useParams<{ table: string }>();
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading } = useTableData(table || "", {
    page: pageIndex + 1,
    limit: pageSize,
    search: globalFilter,
    sort: sortField,
    order: sortOrder,
  });

  const deleteMutation = useDeleteData(table || "");

  const rows: RowData[] = data?.data || [];
  const rowCount = data?.total || 0;

  const handleDelete = (id: string) => {
    if (!table) return;

    deleteMutation.mutate(id);
  };

  const columns = useMemo<MRT_ColumnDef<RowData>[]>(() => {
    if (!rows.length) return [];

    const allKeys = Array.from(
      new Set(rows.flatMap((row) => Object.keys(row))),
    );

    return allKeys
      .filter((key) => key !== "_id" && key !== "__v")
      .map((key) => ({
        accessorKey: key,
        header: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        size: 180,

        Cell: ({ cell }) => {
          const value = cell.getValue<any>();

          if (Array.isArray(value)) {
            return <span>{value.join(", ")}</span>;
          }

          if (typeof value === "object" && value !== null) {
            return <span>{JSON.stringify(value)}</span>;
          }

          return <span>{String(value ?? "")}</span>;
        },
      }));
  }, [rows]);

  if (!table) return <Text>Invalid table</Text>;

  return (
    <Box p="md">
      <Group mb="md">
        <Button onClick={() => navigate(`/table/${table}/new`)}>Add New</Button>
      </Group>

      <CustomTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        rowCount={rowCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        sorting={sorting}
        globalFilter={globalFilter}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        setSorting={setSorting}
        setGlobalFilter={setGlobalFilter}
        onView={(id) => navigate(`/table/${table}/view/${id}`)}
        onEdit={(id) => navigate(`/table/${table}/edit/${id}`)}
        onDelete={handleDelete}
      />
    </Box>
  );
}
