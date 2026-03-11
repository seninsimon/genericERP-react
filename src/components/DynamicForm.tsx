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
  FileInput,
  Image,
  ActionIcon,
  Text,
  Anchor,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconEye } from "@tabler/icons-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  useSchema,
  useSingleData,
  useInsertData,
  useUpdateData,
} from "../api/reactQueryHooks/useTables";
import { uploadFiles } from "../api/api";
import api from "../api/api";
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
  /* ---------------- NORMALIZE EDIT DATA ---------------- */ useEffect(() => {
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
  /* ---------------- LOAD RELATIONS ---------------- */ useEffect(() => {
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
  label: item.name || item.title || item.label || item._id
}));
        }
      }
      setRelations(rels);
    };
    loadRelations();
  }, [schema]);
  /* ---------------- FORM CHANGE ---------------- */ const handleChange = (
    name: string,
    value: any,
  ) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };
  /* ---------------- FILE SELECT ---------------- */ const handleFileSelect = (
    name: string,
    files: File[] | File,
  ) => {
    const arr = Array.isArray(files) ? files : [files];
    setPendingFiles((prev: any) => ({
      ...prev,
      [name]: [...(prev[name] || []), ...arr],
    }));
  };
  /* ---------------- REMOVE EXISTING FILE ---------------- */ const removeExisting =
    (field: string, url: string) => {
      setExistingFiles((prev: any) => ({
        ...prev,
        [field]: prev[field].filter((f: string) => f !== url),
      }));
    };
  /* ---------------- REMOVE NEW FILE ---------------- */ const removePending =
    (field: string, index: number) => {
      setPendingFiles((prev: any) => ({
        ...prev,
        [field]: prev[field].filter((_: any, i: number) => i !== index),
      }));
    };
  /* ---------------- SUBMIT ---------------- */ const submit = async () => {
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
    } catch (error) {
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
        {" "}
        <Loader />{" "}
      </Group>
    );
  }
  if (!schema) return null;
  return (
    <Stack maw={600} mx="auto" mt="lg">
      {" "}
      {schema.columns.map((col: any) => {
const value =
  form[col.name] ??
  (col.type === "relation"
    ? col.multiple
      ? []
      : null
    : "");        /* TEXT */ if (col.type === "text") {
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
        /* NUMBER */ if (col.type === "number") {
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
        /* BOOLEAN */ if (col.type === "boolean") {
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
        /* DATE */ if (col.type === "date") {
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
        /* RELATION */ /* RELATION */

if (col.type === "relation") {

  const options = relations[col.name] || [];

  if (col.multiple) {

    return (
      <MultiSelect
        key={col.name}
        label={col.label}
        data={options}
        value={Array.isArray(value) ? value.map(String) : []}
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
      data={options}
      value={value || null}
      disabled={isView}
      searchable
      clearable
      onChange={(v) => handleChange(col.name, v)}
    />
  );

}
        /* FILE / IMAGE */ if (
          ["image", "images", "file", "files"].includes(col.type)
        ) {
          const existing = existingFiles[col.name] || [];
          const pending = pendingFiles[col.name] || [];
          const isImage = col.type === "image" || col.type === "images";
          return (
            <Stack key={col.name}>
              {" "}
              {!isView && (
                <FileInput
                  label={col.label}
                  multiple={col.type === "images" || col.type === "files"}
                  accept={isImage ? "image/*" : "*"}
                  onChange={(files) =>
                    files && handleFileSelect(col.name, files)
                  }
                />
              )}{" "}
              {/* EXISTING FILES */}{" "}
              <Group>
                {" "}
                {existing.map((url: string) => {
                  const fullUrl = `${FILE_BASE_URL}${encodeURI(url)}`;
                  return (
                    <Stack key={url} align="center">
                      {" "}
                      {isImage ? (
                        <Image src={fullUrl} w={120} />
                      ) : (
                        <Group>
                          {" "}
                          <Anchor href={fullUrl} target="_blank" size="sm">
                            {" "}
                            {url.split("/").pop()}{" "}
                          </Anchor>{" "}
                          <ActionIcon
                            component="a"
                            href={fullUrl}
                            target="_blank"
                            variant="light"
                          >
                            {" "}
                            <IconEye size={16} />{" "}
                          </ActionIcon>{" "}
                        </Group>
                      )}{" "}
                      {!isView && (
                        <ActionIcon
                          color="red"
                          onClick={() => removeExisting(col.name, url)}
                        >
                          {" "}
                          <IconTrash size={16} />{" "}
                        </ActionIcon>
                      )}{" "}
                    </Stack>
                  );
                })}{" "}
              </Group>{" "}
              {/* NEW FILES */}{" "}
              <Group>
                {" "}
                {pending.map((file: File, i: number) => (
                  <Stack key={i} align="center">
                    {" "}
                    {isImage ? (
                      <Image src={URL.createObjectURL(file)} w={120} />
                    ) : (
                      <Text size="sm">{file.name}</Text>
                    )}{" "}
                    {!isView && (
                      <ActionIcon
                        color="red"
                        onClick={() => removePending(col.name, i)}
                      >
                        {" "}
                        <IconTrash size={16} />{" "}
                      </ActionIcon>
                    )}{" "}
                  </Stack>
                ))}{" "}
              </Group>{" "}
            </Stack>
          );
        }
        return null;
      })}{" "}
      {!isView && (
        <Button
          loading={insertMutation.isPending || updateMutation.isPending}
          onClick={submit}
        >
          {" "}
          {isEdit ? "Update" : "Save"}{" "}
        </Button>
      )}{" "}
      <Button variant="light" onClick={() => navigate(`/table/${table}`)}>
        {" "}
        Back{" "}
      </Button>{" "}
    </Stack>
  );
}
