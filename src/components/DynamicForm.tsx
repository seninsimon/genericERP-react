import { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  NumberInput,
  Checkbox,
  Select,
  MultiSelect,
  Stack,
  Loader,
  Group,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { useParams, useLocation, useNavigate } from "react-router-dom";

import {
  useSchema,
  useSingleData,
  useInsertData,
  useUpdateData,
} from "../api/reactQueryHooks/useTables";

import api from "../api/api";

export default function DynamicForm({ table }: any) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEdit = location.pathname.includes("/edit/");
  const isView = location.pathname.includes("/view/");

  const [form, setForm] = useState<any>({});
  const [relations, setRelations] = useState<any>({});

  // =========================
  // QUERIES
  // =========================

  const { data: schema, isLoading: schemaLoading } = useSchema(table);

  const { data: singleData } = useSingleData(table, id || "");

  const insertMutation = useInsertData(table);
  const updateMutation = useUpdateData(table);

  // =========================
  // NORMALIZE SINGLE DATA
  // =========================

  useEffect(() => {
    if (!singleData || !schema) return;

    const normalized: any = { ...singleData };

    schema.columns.forEach((col: any) => {
      if (col.type === "relation") {
        if (col.multiple && Array.isArray(normalized[col.name])) {
          normalized[col.name] = normalized[col.name].map((v: any) =>
            typeof v === "object" ? v._id : v,
          );
        }

        if (!col.multiple && normalized[col.name]) {
          normalized[col.name] =
            typeof normalized[col.name] === "object"
              ? normalized[col.name]._id
              : normalized[col.name];
        }
      }
    });

    setForm(normalized);
  }, [singleData, schema]);

  // =========================
  // LOAD RELATION OPTIONS
  // =========================

  useEffect(() => {
    if (!schema) return;

    const loadRelations = async () => {
      const rels: any = {};

      for (const col of schema.columns) {
        if (col.type === "relation" && col.ref) {
          const res = await api.get(`/table/${col.ref}`, {
            params: { page: 1, limit: 1000 },
          });

          const rows = res.data?.data || [];

          rels[col.name] = rows.map((item: any) => ({
            value: String(item._id),
            label: Object.values(item)[1] || item._id,
          }));
        }
      }

      setRelations(rels);
    };

    loadRelations();
  }, [schema]);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (name: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const submit = async () => {
    try {
      const { _id, ...data } = form;

      if (isEdit) {
        await updateMutation.mutateAsync({
          id: id!,
          data,
        });

        notifications.show({
          title: "Success",
          message: "Record updated successfully",
          color: "green",
        });
      } else {
        await insertMutation.mutateAsync(data);

        notifications.show({
          title: "Success",
          message: "Record created successfully",
          color: "green",
        });
      }

      navigate(`/table/${table}`);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  // =========================
  // LOADING
  // =========================

  if (schemaLoading) {
    return (
      <Group justify="center" mt="xl">
        <Loader />
      </Group>
    );
  }

  if (!schema) return null;

  // =========================
  // RENDER
  // =========================

  return (
    <Stack maw={600} mx="auto" mt="lg">
      {schema.columns.map((col: any) => {
        const value =
          form[col.name] ?? (col.type === "relation" && col.multiple ? [] : "");

        // TEXT
        if (col.type === "text") {
          return (
            <TextInput
              key={col.name}
              label={col.label}
              value={value}
              disabled={isView}
              onChange={(e) => handleChange(col.name, e.target.value)}
            />
          );
        }

        // NUMBER
        if (col.type === "number") {
          return (
            <NumberInput
              key={col.name}
              label={col.label}
              value={value}
              disabled={isView}
              onChange={(v) => handleChange(col.name, v)}
            />
          );
        }

        // BOOLEAN
        if (col.type === "boolean") {
          return (
            <Checkbox
              key={col.name}
              label={col.label}
              checked={value || false}
              disabled={isView}
              onChange={(e) => handleChange(col.name, e.currentTarget.checked)}
            />
          );
        }

        // DATE
        if (col.type === "date") {
          return (
            <TextInput
              key={col.name}
              type="date"
              label={col.label}
              value={value}
              disabled={isView}
              onChange={(e) => handleChange(col.name, e.target.value)}
            />
          );
        }

        // RELATION
        if (col.type === "relation") {
          if (col.multiple) {
            return (
              <MultiSelect
                key={col.name}
                label={col.label}
                data={relations[col.name] || []}
                value={Array.isArray(value) ? value : []}
                disabled={isView}
                searchable
                clearable
                onChange={(v) => handleChange(col.name, v)}
              />
            );
          }

          return (
            <Select
              key={col.name}
              label={col.label}
              data={relations[col.name] || []}
              value={value || null}
              disabled={isView}
              searchable
              clearable
              onChange={(v) => handleChange(col.name, v)}
            />
          );
        }

        return null;
      })}

      {!isView && (
        <Button
          loading={insertMutation.isPending || updateMutation.isPending}
          onClick={submit}
        >
          {isEdit ? "Update" : "Save"}
        </Button>
      )}

      <Button variant="light" onClick={() => navigate(`/table/${table}`)}>
        Back
      </Button>
    </Stack>
  );
}
