import { useEffect, useMemo, useState } from "react";
import { Button, TextInput, Select, Group, Checkbox } from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table";
import AppTable from "../components/MantineTable";

import {
  createTable,
  getTables,
  getSchema,
  addColumn,
  deleteColumn,
  updateColumn,
} from "../api/api";

export default function SettingsTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columnsData, setColumnsData] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);

  const [tableName, setTableName] = useState("");

  const [columnName, setColumnName] = useState("");
  const [columnLabel, setColumnLabel] = useState("");
  const [columnType, setColumnType] = useState("text");
  const [showInTable, setShowInTable] = useState(true);
  const [refTable, setRefTable] = useState("");

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const res = await getTables();
    setTables(res.data);
  };

  const loadSchema = async (table: string) => {
    const res = await getSchema(table);
    setColumnsData(res.data.columns);
  };

  const createNewTable = async () => {
    if (!tableName.trim()) return;

    await createTable({ tableName });

    setTableName("");
    loadTables();
  };

  const addNewColumn = async () => {
    if (!columnName.trim()) return;

    await addColumn(selectedTable, {
      name: columnName,
      label: columnLabel || columnName,
      type: columnType,
      showInTable,
      ref: columnType === "relation" ? refTable : null,
    });

    setColumnName("");
    setColumnLabel("");
    setColumnType("text");
    setShowInTable(true);
    setRefTable("");

    loadSchema(selectedTable);
  };

  const removeColumn = async (name: string) => {
    await deleteColumn(selectedTable, name);
    loadSchema(selectedTable);
  };

  const saveColumn = async (col: any) => {
    await updateColumn(selectedTable, col.name, col);
    setEditing(null);
    loadSchema(selectedTable);
  };

  const updateLocalColumn = (name: string, key: string, value: any) => {
    setColumnsData((prev) =>
      prev.map((col) => (col.name === name ? { ...col, [key]: value } : col)),
    );
  };

  const columnTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Boolean" },
    { value: "relation", label: "Relation" },
    { value: "options", label: "Options" },
  ];

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 180,
      },

      {
        accessorKey: "label",
        header: "Label",
        size: 200,
        Cell: ({ row }) => {
          const col = row.original;

          if (editing === col.name) {
            return (
              <TextInput
                value={col.label}
                onChange={(e) =>
                  updateLocalColumn(col.name, "label", e.target.value)
                }
              />
            );
          }

          return col.label;
        },
      },

      {
        accessorKey: "type",
        header: "Type",
        size: 160,
        Cell: ({ row }) => {
          const col = row.original;

          if (editing === col.name) {
            return (
              <Select
                data={columnTypes}
                value={col.type}
                onChange={(v) => {
                  updateLocalColumn(col.name, "type", v);
                  if (v !== "relation") {
                    updateLocalColumn(col.name, "ref", null);
                  }
                }}
              />
            );
          }

          return col.type;
        },
      },

      {
        accessorKey: "ref",
        header: "Ref",
        size: 180,
        Cell: ({ row }) => {
          const col = row.original;

          if (editing === col.name && col.type === "relation") {
            return (
              <Select
                placeholder="Reference Table"
                data={tables.map((t) => ({
                  value: t.tableName,
                  label: t.tableName,
                }))}
                value={col.ref || ""}
                onChange={(v) => updateLocalColumn(col.name, "ref", v)}
              />
            );
          }

          return col.ref || "-";
        },
      },

      {
        accessorKey: "showInTable",
        header: "Show",
        size: 120,
        Cell: ({ row }) => {
          const col = row.original;

          if (editing === col.name) {
            return (
              <Checkbox
                checked={col.showInTable}
                onChange={(e) =>
                  updateLocalColumn(
                    col.name,
                    "showInTable",
                    e.currentTarget.checked,
                  )
                }
              />
            );
          }

          return col.showInTable ? "Yes" : "No";
        },
      },

      {
        id: "actions",
        header: "Actions",
        size: 220,
        Cell: ({ row }) => {
          const col = row.original;

          return (
            <Group gap="xs" wrap="nowrap">
              {editing === col.name ? (
                <>
                  <Button
                    size="xs"
                    color="teal"
                    onClick={() => saveColumn(col)}
                  >
                    Save
                  </Button>

                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => setEditing(col.name)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="xs"
                    color="red"
                    variant="default"
                    onClick={() => removeColumn(col.name)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Group>
          );
        },
      },
    ],
    [columnsData, editing, tables],
  );

  return (
    <div className="w-full px-8 py-10">
      <h2 className="text-2xl font-semibold mb-6">Create Table</h2>

      <Group mb="lg">
        <TextInput
          placeholder="Table name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />

        <Button onClick={createNewTable}>Create</Button>
      </Group>

      <Select
        placeholder="Select table"
        data={tables.map((t) => ({
          value: t.tableName,
          label: t.tableName,
        }))}
        value={selectedTable}
        onChange={(v) => {
          setSelectedTable(v || "");
          if (v) loadSchema(v);
        }}
      />

      {selectedTable && (
        <>
          <AppTable columns={columns} data={columnsData} />

          <Group mt="lg">
            <TextInput
              placeholder="Column Name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />

            <TextInput
              placeholder="Column Label"
              value={columnLabel}
              onChange={(e) => setColumnLabel(e.target.value)}
            />

            <Select
              data={columnTypes}
              value={columnType}
              onChange={(v) => setColumnType(v || "text")}
            />

            {columnType === "relation" && (
              <Select
                placeholder="Reference Table"
                data={tables.map((t) => ({
                  value: t.tableName,
                  label: t.tableName,
                }))}
                value={refTable}
                onChange={(v) => setRefTable(v || "")}
              />
            )}

            <Checkbox
              label="Show"
              checked={showInTable}
              onChange={(e) => setShowInTable(e.currentTarget.checked)}
            />

            <Button onClick={addNewColumn}>Add Column</Button>
          </Group>
        </>
      )}
    </div>
  );
}
