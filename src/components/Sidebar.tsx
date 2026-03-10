import { Stack, Button } from "@mantine/core";
import { useEffect, useState } from "react";
import { getTables } from "../api/api";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [tables, setTables] = useState<any[]>([]);
  const navigate = useNavigate();

  const { table } = useParams();
  const location = useLocation();

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const res = await getTables();
    setTables(res.data);
  };

  const isSettingsActive = location.pathname.startsWith("/settings");

  return (
    <Stack p="md">

      {/* SETTINGS */}
      <Button
        variant={isSettingsActive ? "filled" : "subtle"}
        onClick={() => navigate("/settings")}
      >
        Settings
      </Button>

      {/* DYNAMIC TABLES */}
      {tables.map((t) => {
        const isActive = table === t.tableName;

        return (
          <Button
            key={t.tableName}
            variant={isActive ? "filled" : "subtle"}
            onClick={() => navigate(`/table/${t.tableName}`)}
          >
            {t.tableName}
          </Button>
        );
      })}
    </Stack>
  );
}