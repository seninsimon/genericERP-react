import { useMemo, useState, useEffect } from "react";
import {
  Button,
  TextInput,
  Select,
  Group,
  Checkbox,
  Loader,
} from "@mantine/core";
import type { MRT_ColumnDef } from "mantine-react-table";
import AppTable from "../components/MantineTable";

import {
  useTables,
  useSchema,
  useCreateTable,
  useAddColumn,
  useDeleteColumn,
  useUpdateColumn,
} from "../api/reactQueryHooks/useTables";

export default function SettingsTables() {
  const [selectedTable, setSelectedTable] = useState("");
  const [columnsData, setColumnsData] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);

  const [tableName, setTableName] = useState("");

  const [columnName, setColumnName] = useState("");
  const [columnLabel, setColumnLabel] = useState("");
  const [columnType, setColumnType] = useState("text");
  const [showInTable, setShowInTable] = useState(true);
  const [refTable, setRefTable] = useState("");
  const [multiple, setMultiple] = useState(false);

  /* ------------------ QUERIES ------------------ */

  const { data: tables = [], isLoading: tablesLoading } = useTables();

  const { data: schema, isLoading: schemaLoading } = useSchema(selectedTable);

  /* ------------------ MUTATIONS ------------------ */

  const { mutateAsync: createTableMutate, isPending: creatingTable } =
    useCreateTable();

  const { mutateAsync: addColumnMutate, isPending: addingColumn } =
    useAddColumn(selectedTable);

  const { mutateAsync: updateColumnMutate } = useUpdateColumn(
    selectedTable,
    editing || ""
  );

  const { mutateAsync: deleteColumnMutate } =
    useDeleteColumn(selectedTable);

  /* ------------------ EFFECT ------------------ */

  useEffect(() => {
    if (schema?.columns) {
      setColumnsData(schema.columns);
    }
  }, [schema]);

  /* ------------------ ACTIONS ------------------ */

  const createNewTable = async () => {
    if (!tableName.trim()) return;

    await createTableMutate({ tableName });
    setTableName("");
  };

  const addNewColumn = async () => {
    if (!columnName.trim()) return;

    await addColumnMutate({
      name: columnName,
      label: columnLabel || columnName,
      type: columnType,
      showInTable,
      ref: columnType === "relation" ? refTable : null,
      multiple: columnType === "relation" ? multiple : false,
    });

    setColumnName("");
    setColumnLabel("");
    setColumnType("text");
    setShowInTable(true);
    setRefTable("");
    setMultiple(false);
  };

  const removeColumn = async (name: string) => {
    await deleteColumnMutate(name);
  };

  const saveColumn = async (col: any) => {
    await updateColumnMutate(col);
    setEditing(null);
  };

  const updateLocalColumn = (name: string, key: string, value: any) => {
    setColumnsData((prev) =>
      prev.map((col) => (col.name === name ? { ...col, [key]: value } : col))
    );
  };

  /* ------------------ COLUMN TYPES ------------------ */

  const columnTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Boolean" },
    { value: "relation", label: "Relation" },
    { value: "options", label: "Options" },

    // NEW TYPES
    { value: "image", label: "Image" },
    { value: "images", label: "Multiple Images" },
    { value: "file", label: "File / PDF" },
    { value: "files", label: "Multiple Files" },
  ];

  /* ------------------ TABLE COLUMNS ------------------ */

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
                    updateLocalColumn(col.name, "multiple", false);
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
                data={tables.map((t: any) => ({
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
        accessorKey: "multiple",
        header: "Multi",
        size: 120,
        Cell: ({ row }) => {
          const col = row.original;

          if (col.type !== "relation") return "-";

          if (editing === col.name) {
            return (
              <Checkbox
                checked={col.multiple || false}
                onChange={(e) =>
                  updateLocalColumn(
                    col.name,
                    "multiple",
                    e.currentTarget.checked
                  )
                }
              />
            );
          }

          return col.multiple ? "Yes" : "No";
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
                    e.currentTarget.checked
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
                  <Button size="xs" color="teal" onClick={() => saveColumn(col)}>
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
    [columnsData, editing, tables]
  );

  /* ------------------ UI ------------------ */

  if (tablesLoading) return <Loader />;

  return (
    <div className="w-full px-8 py-10">
      <h2 className="text-2xl font-semibold mb-6">Create Table</h2>

      <Group mb="lg">
        <TextInput
          placeholder="Table name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />

        <Button loading={creatingTable} onClick={createNewTable}>
          Create
        </Button>
      </Group>

      <Select
        placeholder="Select table"
        data={tables.map((t: any) => ({
          value: t.tableName,
          label: t.tableName,
        }))}
        value={selectedTable}
        onChange={(v) => setSelectedTable(v || "")}
      />

      {selectedTable && (
        <>
          {schemaLoading ? (
            <Loader mt="lg" />
          ) : (
            <AppTable columns={columns} data={columnsData} />
          )}

          <Group mt="lg">
            <TextInput
              placeholder="Column Name"
              value={columnName}
              disabled={columnType === "relation"}
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
              onChange={(v) => {
                const type = v || "text";
                setColumnType(type);

                if (type !== "relation") {
                  setRefTable("");
                  setMultiple(false);
                }
              }}
            />

            {columnType === "relation" && (
              <>
                <Select
                  placeholder="Reference Table"
                  data={tables.map((t: any) => ({
                    value: t.tableName,
                    label: t.tableName,
                  }))}
                  value={refTable}
                  onChange={(v) => {
                    const table = v || "";

                    setRefTable(table);
                    setColumnName(table);
                    setColumnLabel(table);
                  }}
                />

                <Checkbox
                  label="Multiple"
                  checked={multiple}
                  onChange={(e) => setMultiple(e.currentTarget.checked)}
                />
              </>
            )}

            <Checkbox
              label="Show"
              checked={showInTable}
              onChange={(e) => setShowInTable(e.currentTarget.checked)}
            />

            <Button loading={addingColumn} onClick={addNewColumn}>
              Add Column
            </Button>
          </Group>
        </>
      )}
    </div>
  );
}