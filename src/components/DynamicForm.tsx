import { useEffect, useState } from "react";
import {
  getSchema,
  insertData,
  updateData,
  getSingleData,
  getTableData,
} from "../api/api";

import {
  Button,
  TextInput,
  NumberInput,
  Checkbox,
  Select,
  MultiSelect,
} from "@mantine/core";

import { useParams, useLocation, useNavigate } from "react-router-dom";

export default function DynamicForm({ table }: any) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [schema, setSchema] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [relations, setRelations] = useState<any>({});

  const isEdit = location.pathname.includes("/edit/");
  const isView = location.pathname.includes("/view/");

  useEffect(() => {
    loadSchema();
  }, [table]);

  useEffect(() => {
    if (id) loadSingle();
  }, [id]);

  useEffect(() => {
    if (schema) loadRelations();
  }, [schema]);

  const loadSchema = async () => {
    const res = await getSchema(table);
    setSchema(res.data);
  };

  const loadSingle = async () => {
    const res = await getSingleData(table, id!);
    setForm(res.data);
  };

  const loadRelations = async () => {
    const rels: any = {};

    for (const col of schema.columns) {
      if (col.type === "relation" && col.ref) {
        const res = await getTableData(col.ref, {
          page: 1,
          limit: 1000,
        });

        rels[col.name] = res.data.data.map((item: any) => ({
          value: item._id,
          label: Object.values(item)[1] || item._id,
        }));
      }
    }

    setRelations(rels);
  };

  const handleChange = (name: string, value: any) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const submit = async () => {
    const { _id, ...data } = form;

    if (isEdit) {
      await updateData(table, id!, data);
      alert("Updated successfully");
    } else {
      await insertData(table, data);
      alert("Saved successfully");
    }

    navigate(`/table/${table}`);
  };

  if (!schema) return null;

  return (
    <div>
      {schema.columns.map((col: any) => {
        const value =
          form[col.name] ??
          (col.type === "relation" && col.multiple ? [] : "");

        // TEXT
        if (col.type === "text") {
          return (
            <TextInput
              key={col.name}
              label={col.label}
              value={value}
              disabled={isView}
              onChange={(e) => handleChange(col.name, e.target.value)}
              mb="sm"
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
              mb="sm"
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
              mb="sm"
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
              mb="sm"
            />
          );
        }

        // RELATION
        if (col.type === "relation") {
          // MULTI RELATION
          if (col.multiple) {
            return (
              <MultiSelect
                key={col.name}
                label={col.label}
                data={relations[col.name] || []}
                value={value}
                disabled={isView}
                searchable
                clearable
                onChange={(v) => handleChange(col.name, v)}
                mb="sm"
              />
            );
          }

          // SINGLE RELATION
          return (
            <Select
              key={col.name}
              label={col.label}
              data={relations[col.name] || []}
              value={value}
              disabled={isView}
              searchable
              clearable
              onChange={(v) => handleChange(col.name, v)}
              mb="sm"
            />
          );
        }

        return null;
      })}

      {!isView && (
        <Button mt="md" onClick={submit}>
          {isEdit ? "Update" : "Save"}
        </Button>
      )}

      <Button
        mt="md"
        variant="light"
        onClick={() => navigate(`/table/${table}`)}
      >
        Back
      </Button>
    </div>
  );
}