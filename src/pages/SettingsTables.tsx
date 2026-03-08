import { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Select,
  Table,
  Group,
  Checkbox,
} from "@mantine/core";

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
  const [columns, setColumns] = useState<any[]>([]);
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
    setColumns(res.data.columns);
    setEditing(null);
  };

  const createNewTable = async () => {
    if (!tableName.trim()) return;

    await createTable({ tableName: tableName.trim() });

    setTableName("");
    loadTables();
  };

  const addNewColumn = async () => {
    if (!selectedTable || !columnName.trim()) return;

    await addColumn(selectedTable, {
      name: columnName.trim(),
      label: columnLabel.trim() || columnName.trim(),
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
    if (!window.confirm(`Delete column "${name}"?`)) return;

    await deleteColumn(selectedTable, name);
    loadSchema(selectedTable);
  };

  const saveColumn = async (col: any) => {
    await updateColumn(selectedTable, col.name, {
      label: col.label,
      type: col.type,
      showInTable: col.showInTable,
      ref: col.type === "relation" ? col.ref : null,
    });

    setEditing(null);
    loadSchema(selectedTable);
  };

  const cancelEdit = () => {
    setEditing(null);
    loadSchema(selectedTable);
  };

  const updateLocalColumn = (name: string, key: string, value: any) => {
    setColumns((prev) =>
      prev.map((col) => (col.name === name ? { ...col, [key]: value } : col)),
    );
  };

  const columnTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Boolean" },
    { value: "relation", label: "Relation" },
  ];

  return (
    <div className="w-full px-8 py-10">
      {/* Create Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Create Table</h2>

        <Group align="flex-end" gap="md" style={{ maxWidth: 520 }}>
          <TextInput
            placeholder="Table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            style={{ flex: 1 }}
          />

          <Button onClick={createNewTable}>Create</Button>
        </Group>
      </div>

      {/* Columns */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Table Columns</h2>

        <Select
          placeholder="Select table"
          data={tables.map((t) => ({
            value: t.tableName,
            label: t.tableName,
          }))}
          value={selectedTable}
          onChange={(value) => {
            setSelectedTable(value || "");
            if (value) loadSchema(value);
          }}
          style={{ maxWidth: 420, marginBottom: "2rem" }}
        />

        {selectedTable && (
          <>
            {/* Add Column */}
            <div className="mb-10">
              <h3 className="text-lg font-medium mb-4">Add New Column</h3>

              <Group align="flex-end" gap="md" wrap="wrap">
                <TextInput
                  placeholder="Column Name"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  style={{ width: 220 }}
                />

                <TextInput
                  placeholder="Column Label"
                  value={columnLabel}
                  onChange={(e) => setColumnLabel(e.target.value)}
                  style={{ width: 240 }}
                />

                <Select
                  value={columnType}
                  data={columnTypes}
                  onChange={(v) => setColumnType(v || "text")}
                  style={{ width: 180 }}
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
                    style={{ width: 200 }}
                  />
                )}

                <Checkbox
                  label="Show in Table"
                  checked={showInTable}
                  onChange={(e) => setShowInTable(e.currentTarget.checked)}
                />

                <Button onClick={addNewColumn}>Add Column</Button>
              </Group>
            </div>

            {/* Column List */}
            <Table striped withColumnBorders highlightOnHover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Ref</th>
                  <th>Show</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {columns.map((col) => {
                  const isEditing = editing === col.name;

                  return (
                    <tr key={col.name}>
                      <td>
                        <b>{col.name}</b>
                      </td>

                      <td>
                        {isEditing ? (
                          <TextInput
                            value={col.label || ""}
                            onChange={(e) =>
                              updateLocalColumn(
                                col.name,
                                "label",
                                e.target.value,
                              )
                            }
                          />
                        ) : (
                          col.label
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <Select
                            value={col.type}
                            data={columnTypes}
                            onChange={(v) =>
                              updateLocalColumn(col.name, "type", v)
                            }
                          />
                        ) : (
                          col.type
                        )}
                      </td>

                      <td>
                        {isEditing && col.type === "relation" ? (
                          <Select
                            value={col.ref}
                            data={tables.map((t) => ({
                              value: t.tableName,
                              label: t.tableName,
                            }))}
                            onChange={(v) =>
                              updateLocalColumn(col.name, "ref", v)
                            }
                          />
                        ) : (
                          col.ref || "-"
                        )}
                      </td>

                      <td>
                        {isEditing ? (
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
                        ) : col.showInTable ? (
                          "Yes"
                        ) : (
                          "No"
                        )}
                      </td>

                      <td>
                        <Group gap="xs">
                          {isEditing ? (
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
                                onClick={cancelEdit}
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </>
        )}
      </div>
    </div>
  );
}
