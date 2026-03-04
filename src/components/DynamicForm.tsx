import { useEffect, useState } from "react";
import { getSchema, insertData } from "../api/api";
import { Button, TextInput, NumberInput } from "@mantine/core";

export default function DynamicForm({ table }: any) {

  const [schema, setSchema] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    const res = await getSchema(table);
    setSchema(res.data);
  };

  const handleChange = (name: string, value: any) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  const submit = async () => {
    await insertData(table, form);
    alert("Saved");
  };

  if (!schema) return null;

  return (
    <div>

      {schema.columns.map((col: any) => {

        if (col.type === "text") {
          return (
            <TextInput
              key={col.name}
              label={col.label}
              onChange={(e) =>
                handleChange(col.name, e.target.value)
              }
            />
          );
        }

        if (col.type === "number") {
          return (
            <NumberInput
              key={col.name}
              label={col.label}
              onChange={(v) =>
                handleChange(col.name, v)
              }
            />
          );
        }

        return null;
      })}

      <Button mt="md" onClick={submit}>
        Save
      </Button>

    </div>
  );
}   