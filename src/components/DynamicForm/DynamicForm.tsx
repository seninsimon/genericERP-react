import { useEffect, useState } from "react";
import { Stack, Loader, Group, Button, SimpleGrid } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import {
  useSchema,
  useSingleData,
  useInsertData,
  useUpdateData,
} from "../../api/reactQueryHooks/useTables";

import { uploadFiles } from "../../api/api";
import api from "../../api/api";

import FieldRenderer from "./FieldRenderer";
import { confirmAction } from "../../utils/confirmModal";

const FILE_BASE_URL = "http://localhost:5000";

export default function DynamicForm({ table }: any) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEdit = location.pathname.includes("/edit/");
  const isView = location.pathname.includes("/view/");

  const [form, setForm] = useState<any>({});
  const [relations, setRelations] = useState<any>({});
  const [pendingFiles, setPendingFiles] = useState<any>({});
  const [existingFiles, setExistingFiles] = useState<any>({});

  const { data: schema, isLoading: schemaLoading } = useSchema(table);
  const { data: singleData } = useSingleData(table, id || "");

  const insertMutation = useInsertData(table);
  const updateMutation = useUpdateData(table);

  useEffect(() => {
    if (!singleData || !schema) return;

    const normalized: any = { ...singleData };
    const existing: any = {};

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

      if (["image", "images", "file", "files"].includes(col.type)) {
        existing[col.name] = Array.isArray(normalized[col.name])
          ? normalized[col.name]
          : normalized[col.name]
            ? [normalized[col.name]]
            : [];
      }
    });

    setForm(normalized);
    setExistingFiles(existing);
  }, [singleData, schema]);

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
            label: item.name || item.title || item.label || item._id,
          }));
        }
      }

      setRelations(rels);
    };

    loadRelations();
  }, [schema]);

  const handleChange = (name: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (name: string, files: File[] | File) => {
    const arr = Array.isArray(files) ? files : [files];

    setPendingFiles((prev: any) => ({
      ...prev,
      [name]: [...(prev[name] || []), ...arr],
    }));
  };

  const removeExisting = (field: string, url: string) => {
    setExistingFiles((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((f: string) => f !== url),
    }));
  };

  const removePending = (field: string, index: number) => {
    setPendingFiles((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const submit = async () => {
    try {
      let payload = { ...form };

      for (const col of schema.columns) {
        if (["image", "images", "file", "files"].includes(col.type)) {
          const field = col.name;

          let finalFiles = [...(existingFiles[field] || [])];

          if (pendingFiles[field]) {
            const res = await uploadFiles(pendingFiles[field]);
            const urls = res.data.map((f: any) => f.url);
            finalFiles = [...finalFiles, ...urls];
          }

          if (col.type === "image" || col.type === "file") {
            payload[field] = finalFiles[0] || "";
          } else {
            payload[field] = finalFiles;
          }
        }
      }

      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, data: payload });
      } else {
        await insertMutation.mutateAsync(payload);
      }

      navigate(`/table/${table}`);
    } catch {
      notifications.show({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  if (schemaLoading) {
    return (
      <Group justify="center" mt="xl">
        <Loader />
      </Group>
    );
  }

  if (!schema) return null;

  return (
    <Stack maw={1200} mx="auto" mt="lg">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {schema.columns.map((col: any) => {
          const value =
            form[col.name] ??
            (col.type === "relation" ? (col.multiple ? [] : null) : "");

          return (
            <FieldRenderer
              key={col.name}
              column={col}
              value={value}
              relations={relations}
              isView={isView}
              FILE_BASE_URL={FILE_BASE_URL}
              onChange={handleChange}
              onFileSelect={handleFileSelect}
              existingFiles={existingFiles}
              pendingFiles={pendingFiles}
              removeExisting={removeExisting}
              removePending={removePending}
            />
          );
        })}
      </SimpleGrid>

      <Group
        style={{
          position: "fixed",
          bottom: 20,
          right: 30,
          zIndex: 1000,
        }}
      >
        <Button
          size="sm"
          variant="light"
          onClick={() => navigate(`/table/${table}`)}
        >
          Back
        </Button>

        {!isView && (
          <Button
            size="sm"
            loading={insertMutation.isPending || updateMutation.isPending}
            onClick={() =>
              confirmAction(
                `Are you sure you want to ${isEdit ? "update" : "save"} this row?`,
                submit,
              )
            }
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        )}
      </Group>
    </Stack>
  );
}
