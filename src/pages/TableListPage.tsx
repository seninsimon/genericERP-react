import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Group, Box, Text } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import type { MRT_ColumnDef } from "mantine-react-table";

import { getTableData, deleteData } from "../api/api";

type RowData = {
  _id: string;
  [key: string]: any;
};

export default function TableListPage() {
  const { table } = useParams<{ table: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<RowData[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [sorting, setSorting] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [table, pageIndex, pageSize, sorting, globalFilter]);

  const fetchData = async () => {
    if (!table) return;

    try {
      setLoading(true);

      const sortField = sorting[0]?.id;
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      const res = await getTableData(table, {
        page: pageIndex + 1,
        limit: pageSize,
        search: globalFilter,
        sort: sortField,
        order: sortOrder,
      });

      setData(res.data.data);
      setRowCount(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!table) return;

    const confirmDelete = window.confirm("Delete this record?");
    if (!confirmDelete) return;

    await deleteData(table, id);
    fetchData();
  };

  const columns = useMemo<MRT_ColumnDef<RowData>[]>(() => {
    if (!data.length) return [];

    return Object.keys(data[0])
      .filter((key) => key !== "_id" && key !== "__v")
      .map((key) => ({
        accessorKey: key,
        header: key.toUpperCase(),
        size: 180,
      }));
  }, [data]);

  if (!table) return <Text>Invalid table</Text>;

  return (
    <Box p="md">
      <Group mb="md">
        <Button onClick={() => navigate(`/table/${table}/new`)}>Add New</Button>
      </Group>

      <MantineReactTable
        columns={columns}
        data={data}
        manualPagination
        manualSorting
        manualFiltering
        rowCount={rowCount}
        state={{
          isLoading: loading,
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
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        enableRowActions
        positionActionsColumn="last"
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
              onClick={() =>
                navigate(`/table/${table}/view/${row.original._id}`)
              }
            >
              View
            </Button>

            <Button
              size="xs"
              variant="light"
              px={8}
              onClick={() =>
                navigate(`/table/${table}/edit/${row.original._id}`)
              }
            >
              Edit
            </Button>

            <Button
              size="xs"
              color="red"
              variant="light"
              px={8}
              onClick={() => handleDelete(row.original._id)}
            >
              Delete
            </Button>
          </Group>
        )}
      />
    </Box>
  );
}
