import { useEffect, useState } from "react";
import { Button, TextInput, Select, Table, Group } from "@mantine/core";

import {
  createTable,
  getTables,
  getSchema,
  addColumn,
  deleteColumn,
} from "../api/api";

export default function SettingsTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState("");

  const [columns, setColumns] = useState<any[]>([]);

  const [tableName, setTableName] = useState("");

  const [columnName, setColumnName] = useState("");
  const [columnLabel, setColumnLabel] = useState("");
  const [columnType, setColumnType] = useState("text");

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
  };

  const createNewTable = async () => {
    if (!tableName) return;

    await createTable({ tableName });

    setTableName("");

    loadTables();
  };

  const addNewColumn = async () => {
    if (!selectedTable) return;

    await addColumn(selectedTable, {
      name: columnName,
      label: columnLabel,
      type: columnType,
    });

    setColumnName("");
    setColumnLabel("");

    loadSchema(selectedTable);
  };

  const removeColumn = async (name: string) => {
    await deleteColumn(selectedTable, name);
    loadSchema(selectedTable);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Create Table</h2>

      <Group>
        <TextInput
          placeholder="Table name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />

        <Button onClick={createNewTable}>Create</Button>
      </Group>

      <br />

      <h2>Table Columns</h2>

      <Select
        placeholder="Select table"
        data={tables.map((t) => ({
          value: t.tableName,
          label: t.tableName,
        }))}
        value={selectedTable}
        onChange={(value) => {
          setSelectedTable(value || "");
          loadSchema(value || "");
        }}
      />

      {selectedTable && (
        <>
          <br />

          <Group>
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
              value={columnType}
              data={[
                { value: "text", label: "Text" },
                { value: "number", label: "Number" },
                { value: "date", label: "Date" },
                { value: "boolean", label: "Boolean" },
              ]}
              onChange={(v) => setColumnType(v || "text")}
            />

            <Button onClick={addNewColumn}>Add Column</Button>
          </Group>

          <br />

          <Table striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Label</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {columns.map((col) => (
                <tr key={col.name}>
                  <td>{col.name}</td>
                  <td>{col.label}</td>
                  <td>{col.type}</td>

                  <td>
                    <Button
                      color="red"
                      size="xs"
                      onClick={() => removeColumn(col.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}
