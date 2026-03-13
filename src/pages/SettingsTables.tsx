import { useMemo, useState, useEffect } from "react";
import {
  Button,
  TextInput,
  Select,
  Group,
  Checkbox,
  Loader,
  Card,
  Title,
  Text,
  Divider,
  Badge,
  ActionIcon,
  Tooltip,
  Alert,
  Switch,
  Paper,
  Grid,
  Tabs,
} from "@mantine/core";
import {
  IconTable,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDatabase,
  IconSettings,
  IconColumns,
  IconInfoCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
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
import { confirmAction } from "../utils/confirmModal";

export default function SettingsTables() {
  const [selectedTable, setSelectedTable] = useState("");
  const [columnsData, setColumnsData] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("create");

  const [tableName, setTableName] = useState("");

  const [columnName, setColumnName] = useState("");
  const [columnLabel, setColumnLabel] = useState("");
  const [columnType, setColumnType] = useState("text");
  const [showInTable, setShowInTable] = useState(true);
  const [refTable, setRefTable] = useState("");
  const [multiple, setMultiple] = useState(false);

  const { data: tables = [], isLoading: tablesLoading } = useTables();

  const { data: schema, isLoading: schemaLoading } = useSchema(selectedTable);

  const { mutateAsync: createTableMutate, isPending: creatingTable } =
    useCreateTable();

  const { mutateAsync: addColumnMutate, isPending: addingColumn } =
    useAddColumn(selectedTable);

  const { mutateAsync: updateColumnMutate } = useUpdateColumn(
    selectedTable,
    editing || "",
  );

  const { mutateAsync: deleteColumnMutate } = useDeleteColumn(selectedTable);

  useEffect(() => {
    if (schema?.columns) {
      setColumnsData(schema.columns);
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
      prev.map((col) => (col.name === name ? { ...col, [key]: value } : col)),
    );
  };

  /* ------------------ COLUMN TYPES ------------------ */

  const columnTypes = [
    { value: "text", label: "Text", group: "Basic Types" },
    { value: "number", label: "Number", group: "Basic Types" },
    { value: "date", label: "Date", group: "Basic Types" },
    { value: "relation", label: "Relation", group: "Advanced Types" },
    { value: "image", label: "Single Image", group: "Media Types" },
    { value: "images", label: "Multiple Images", group: "Media Types" },
    { value: "file", label: "Single File", group: "Media Types" },
    { value: "files", label: "Multiple Files", group: "Media Types" },
  ];

  const groupedColumnTypes = columnTypes.reduce((acc: any, type) => {
    if (!acc[type.group]) acc[type.group] = [];
    acc[type.group].push(type);
    return acc;
  }, {});

  /* ------------------ TABLE COLUMNS ------------------ */

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Column Name",
        size: 150,
        Cell: ({ row }) => (
          <Text fw={500} size="sm">
            {row.original.name}
          </Text>
        ),
      },
      {
        accessorKey: "label",
        header: "Display Label",
        size: 180,
        Cell: ({ row }) => {
          const col = row.original;

          if (editing === col.name) {
            return (
              <TextInput
                size="xs"
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
        header: "Data Type",
        size: 140,
        Cell: ({ row }) => {
          const col = row.original;

          if (editing === col.name) {
            return (
              <Select
                size="xs"
                data={Object.entries(groupedColumnTypes).map(
                  ([group, types]: [string, any]) => ({
                    group,
                    items: types.map((t: any) => ({
                      value: t.value,
                      label: t.label,
                    })),
                  }),
                )}
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

          return (
            <Badge color={getTypeColor(col.type)} variant="light">
              {col.type}
            </Badge>
          );
        },
      },
      {
        accessorKey: "ref",
        header: "References",
        size: 150,
        Cell: ({ row }) => {
          const col = row.original;

          if (editing === col.name && col.type === "relation") {
            return (
              <Select
                size="xs"
                placeholder="Select table"
                data={tables.map((t: any) => t.tableName)}
                value={col.ref || ""}
                onChange={(v) => updateLocalColumn(col.name, "ref", v)}
              />
            );
          }

          return col.ref ? (
            <Badge color="blue" variant="outline">
              {col.ref}
            </Badge>
          ) : (
            <Text c="dimmed" size="xs">
              -
            </Text>
          );
        },
      },
      {
        accessorKey: "multiple",
        header: "Multiple",
        size: 100,
        Cell: ({ row }) => {
          const col = row.original;

          if (col.type !== "relation")
            return (
              <Text c="dimmed" size="xs">
                -
              </Text>
            );

          if (editing === col.name) {
            return (
              <Switch
                size="xs"
                checked={col.multiple || false}
                onChange={(e) =>
                  updateLocalColumn(
                    col.name,
                    "multiple",
                    e.currentTarget.checked,
                  )
                }
              />
            );
          }

          return col.multiple ? (
            <Badge color="green" size="xs">
              Yes
            </Badge>
          ) : (
            <Badge color="gray" size="xs">
              No
            </Badge>
          );
        },
      },
      {
        accessorKey: "showInTable",
        header: "Show in Table",
        size: 120,
        Cell: ({ row }) => {
          const col = row.original;

          if (editing === col.name) {
            return (
              <Switch
                size="xs"
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

          return col.showInTable ? (
            <IconCheck size={18} color="green" />
          ) : (
            <IconX size={18} color="gray" />
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 120,
        Cell: ({ row }) => {
          const col = row.original;

          return (
            <Group gap={4}>
              {editing === col.name ? (
                <>
                  <Tooltip label="Save changes">
                    <ActionIcon
                      size="sm"
                      color="teal"
                      onClick={() => saveColumn(col)}
                    >
                      <IconCheck size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Cancel">
                    <ActionIcon
                      size="sm"
                      variant="default"
                      onClick={() => setEditing(null)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip label="Edit column">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => setEditing(col.name)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete column">
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="subtle"
                      onClick={() =>
                        confirmAction(
                          "Are you sure you want to delete this column?",
                          () => removeColumn(col.name),
                        )
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
            </Group>
          );
        },
      },
    ],
    [columnsData, editing, tables],
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: "blue",
      number: "green",
      date: "violet",
      boolean: "cyan",
      relation: "orange",
      options: "pink",
      image: "red",
      images: "red",
      file: "grape",
      files: "grape",
    };
    return colors[type] || "gray";
  };

  /* ------------------ UI ------------------ */

  if (tablesLoading)
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );

  return (
    <div className="w-full px-6 py-6 max-w-7xl mx-auto">
      <Title order={2} mb="md">
        Settings{" "}
      </Title>

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
            <div>
              <Title order={4}>Create a New Table</Title>
            </div>
          </Group>

          <Divider mb="lg" />

          <Grid>
            <Grid.Col span={8}>
              <TextInput
                label="Table Name"
                placeholder="e.g., products, customers, orders"
                value={tableName}
                onChange={(e) => setTableName(e.target.value.trim())}
                leftSection={<IconTable size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={4} className="flex items-end">
              <Button
                fullWidth
                loading={creatingTable}
                onClick={()=>
                  confirmAction(
                    "Are you sure you want to create this table?",
                    createNewTable,
                  )}
                leftSection={<IconPlus size={16} />}
                disabled={!tableName.trim()}
              >
                Create Table
              </Button>
            </Grid.Col>
          </Grid>
        </Card>
      )}

      <Card withBorder shadow="sm" p="lg" radius="md">
        <Group mb="md">
          <IconColumns size={24} />
          <div>
            <Title order={4}>Select Table to Configure</Title>
          </div>
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
          leftSection={<IconDatabase size={16} />}
          searchable
          clearable
        />

        {selectedTable && (
          <>
            {schemaLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              <>
                <Alert
                  icon={<IconInfoCircle size={16} />}
                  title="Column Management"
                  color="blue"
                  mb="xs"
                  variant="light"
                ></Alert>

                <Paper withBorder p="md" radius="sm" >
                  <Grid>
                    <Grid.Col span={3}>
                      <TextInput
                        label="Column Name"
                        placeholder="e.g., first_name"
                        value={columnName}
                        onChange={(e) => setColumnName(e.target.value.trim())}
                        disabled={columnType === "relation"}
                        size="xs"
                      />
                    </Grid.Col>

                    <Grid.Col span={3}>
                      <TextInput
                        label="Display Label"
                        placeholder="e.g., First Name"
                        value={columnLabel}
                        onChange={(e) => setColumnLabel(e.target.value)}
                        size="xs"
                      />
                    </Grid.Col>

                    <Grid.Col span={3}>
                      <Select
                        label="Data Type"
                        data={Object.entries(groupedColumnTypes).map(
                          ([group, types]: [string, any]) => ({
                            group,
                            items: types.map((t: any) => ({
                              value: t.value,
                              label: t.label,
                            })),
                          }),
                        )}
                        value={columnType}
                        onChange={(v) => {
                          const type = v || "text";
                          setColumnType(type);
                          if (type !== "relation") {
                            setRefTable("");
                            setMultiple(false);
                          }
                        }}
                        size="xs"
                      />
                    </Grid.Col>

                    <Grid.Col span={3}>
                      <div className="flex items-end h-full">
                        <Tooltip label="Show this column in table views">
                          <Checkbox
                            label="Show in table"
                            checked={showInTable}
                            onChange={(e) =>
                              setShowInTable(e.currentTarget.checked)
                            }
                            size="xs"
                          />
                        </Tooltip>
                      </div>
                    </Grid.Col>
                  </Grid>

                  {columnType === "relation" && (
                    <Grid mt="xs">
                      <Grid.Col span={6}>
                        <Select
                          label="Reference Table"
                          placeholder="Select table to relate to"
                          data={tables
                            .filter((t: any) => t.tableName !== selectedTable)
                            .map((t: any) => t.tableName)}
                          value={refTable}
                          onChange={(v) => {
                            const table = v || "";
                            setRefTable(table);
                            setColumnName(table);
                            setColumnLabel(table);
                          }}
                          size="xs"
                          description="The table this column relates to"
                        />
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <div className="flex items-end h-full">
                          <Checkbox
                            label="Allow multiple selections"
                            description="Enables many-to-many relationship"
                            checked={multiple}
                            onChange={(e) =>
                              setMultiple(e.currentTarget.checked)
                            }
                            size="xs"
                          />
                        </div>
                      </Grid.Col>
                    </Grid>
                  )}

                  <Group justify="flex-end" mt="md">
                    <Button
                      size="sm"
                      loading={addingColumn}
                      onClick={()=>confirmAction(
                        "Are you sure you want to add this column?",
                        addNewColumn,
                      )}
                      leftSection={<IconPlus size={16} />}
                      disabled={!columnName.trim()}
                    >
                      Add Column
                    </Button>
                  </Group>
                </Paper>

                <AppTable columns={columns} data={columnsData} />

              </>
            )}
          </>
        )}

        {!selectedTable && tables.length === 0 && (
          <Alert color="yellow" title="No Tables Found">
            Create your first table to get started.
          </Alert>
        )}
      </Card>
    </div>
  );
}
