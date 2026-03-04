import { Stack, Button } from "@mantine/core";
import { useEffect, useState } from "react";
import { getTables } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [tables, setTables] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const res = await getTables();
    setTables(res.data);
  };

  return (
    <Stack p="md">
      <Button variant="light" onClick={() => navigate("/settings")}>
        Settings
      </Button>

      {tables.map((t) => (
        <Button
          key={t.tableName}
          variant="subtle"
          onClick={() => navigate(`/table/${t.tableName}`)}
        >
          {t.tableName}
        </Button>
      ))}
    </Stack>
  );
}
