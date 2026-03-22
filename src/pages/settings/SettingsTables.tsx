import { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  Select,
  Group,
  Loader,
  Card,
  Title,
  Divider,
  Alert,
  Tabs,
  Grid,
  Switch,
} from "@mantine/core";
import {
  IconTable,
  IconPlus,
  IconDatabase,
  IconSettings,
  IconInfoCircle,
} from "@tabler/icons-react";
import { confirmAction } from "../../utils/confirmModal";

import {
  useTables,
  useSchema,
  useCreateTable,
  useAddColumn,
  useDeleteColumn,
  useUpdateColumn,
  useUpdateTableSettings, // ✅ NEW
} from "../../api/reactQueryHooks/useTables";

import AddColumnForm from "./AddColumnForm";
import SchemaColumnsTable from "./SchemaColumnsTable";

export default function SettingsTables() {
  const [selectedTable, setSelectedTable] = useState("");
  const [columnsData, setColumnsData] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("create");
  const [tableName, setTableName] = useState("");

  const [showInMenu, setShowInMenu] = useState(true);

  const [columnName, setColumnName] = useState("");
  const [columnLabel, setColumnLabel] = useState("");
  const [columnType, setColumnType] = useState("text");
  const [showInTable, setShowInTable] = useState(true);
  const [refTable, setRefTable] = useState("");
  const [multiple, setMultiple] = useState(false);

  const { data: tables = [], isLoading: tablesLoading } = useTables();
  const { data: schema, isLoading: schemaLoading } = useSchema(selectedTable);

  const { mutateAsync: createTableMutate, isPending: creatingTable } = useCreateTable();
  const { mutateAsync: addColumnMutate, isPending: addingColumn } = useAddColumn(selectedTable);
  const { mutateAsync: updateColumnMutate } = useUpdateColumn(selectedTable, editing || "");
  const { mutateAsync: deleteColumnMutate } = useDeleteColumn(selectedTable);

  // ✅ NEW MUTATION
  const { mutateAsync: updateTableSettingsMutate, isPending: updatingMenu } =
    useUpdateTableSettings();

  useEffect(() => {
    if (schema?.columns) {
      setColumnsData(schema.columns);
    }

    if (schema) {
      setShowInMenu(schema.showInMenu ?? true);
    }
  }, [schema]);

  const createNewTable = async () => {
    if (!tableName.trim()) return;
    await createTableMutate({ tableName });
    setTableName("");
    setSelectedTable(tableName);
    setActiveTab("edit");
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

  const updateTableMenu = async () => {
    await updateTableSettingsMutate({
      table: selectedTable,
      data: { showInMenu },
    });
    
  };

  if (tablesLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6 max-w-7xl mx-auto">
      <Title order={2} mb="md">Settings</Title>

      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="create" leftSection={<IconPlus size={16} />}>
            Create New Table
          </Tabs.Tab>
          <Tabs.Tab
            value="edit"
            leftSection={<IconSettings size={16} />}
            disabled={!selectedTable}
          >
            Edit Table Schema
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {activeTab === "create" && (
        <Card withBorder shadow="sm" p="lg" radius="md" mb="xl">
          <Group mb="md">
            <IconDatabase size={24} />
            <Title order={4}>Create a New Table</Title>
          </Group>

          <Divider mb="lg" />

          <Grid>
            <Grid.Col span={8}>
              <TextInput
                label="Table Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value.trim())}
                leftSection={<IconTable size={16} />}
              />
            </Grid.Col>

            <Grid.Col span={4} className="flex items-end">
              <Button
                fullWidth
                loading={creatingTable}
                onClick={() =>
                  confirmAction("Create this table?", createNewTable)
                }
              >
                Create Table
              </Button>
            </Grid.Col>
          </Grid>
        </Card>
      )}

      <Card withBorder shadow="sm" p="lg" radius="md">
        <Group mb="md">
          <IconDatabase size={24} />
          <Title order={4}>Select Table to Configure</Title>
        </Group>

        <Select
          placeholder="Select a table"
          data={tables.map((t: any) => ({
            value: t.tableName,
            label: t.tableName,
          }))}
          value={selectedTable}
          onChange={(v) => {
            setSelectedTable(v || "");
            setActiveTab("edit");
          }}
          mb="lg"
        />

        {selectedTable && (
          <Card withBorder p="sm" mb="md">
            <Group justify="space-between">
              <Switch
                label="Show this table in sidebar menu"
                checked={showInMenu}
                onChange={(e) => setShowInMenu(e.currentTarget.checked)}
              />
              <Button size="xs" onClick={updateTableMenu} loading={updatingMenu}>
                Save
              </Button>
            </Group>
          </Card>
        )}

        {selectedTable && (
          <>
            {schemaLoading ? (
              <Loader />
            ) : (
              <>
                <Alert
                  icon={<IconInfoCircle size={16} />}
                  title="Column Management"
                  color="blue"
                  mb="xs"
                />

                <AddColumnForm
                  columnName={columnName}
                  setColumnName={setColumnName}
                  columnLabel={columnLabel}
                  setColumnLabel={setColumnLabel}
                  columnType={columnType}
                  setColumnType={setColumnType}
                  showInTable={showInTable}
                  setShowInTable={setShowInTable}
                  refTable={refTable}
                  setRefTable={setRefTable}
                  multiple={multiple}
                  setMultiple={setMultiple}
                  tables={tables}
                  selectedTable={selectedTable}
                  onAddColumn={addNewColumn}
                  addingColumn={addingColumn}
                />

                <SchemaColumnsTable
                  columnsData={columnsData}
                  editing={editing}
                  setEditing={setEditing}
                  tables={tables}
                  onSaveColumn={saveColumn}
                  onDeleteColumn={removeColumn}
                  updateLocalColumn={updateLocalColumn}
                />
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}