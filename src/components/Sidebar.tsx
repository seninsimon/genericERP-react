import { Stack, Button, Loader, ScrollArea } from "@mantine/core";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTables } from "../api/reactQueryHooks/useTables";

export default function Sidebar() {
  const navigate = useNavigate();
  const { table } = useParams();
  const location = useLocation();

  const { data: tables = [], isLoading } = useTables();

  const isSettingsActive = location.pathname.startsWith("/settings");

  if (isLoading) {
    return (
      <Stack p="md">
        <Loader size="sm" />
      </Stack>
    );
  }

  return (
    <ScrollArea type="scroll">
      <Stack
        p="sm"
        gap="xs"
        style={{
          borderRight: "2px solid #E5E7EB",
        }}
        h="100vh"
      >
        {/* SETTINGS */}
        <Button
          variant={isSettingsActive ? "filled" : "subtle"}
          onClick={() => navigate("/settings")}
        >
          Settings
        </Button>

        {/* DYNAMIC TABLES */}
        {tables.map((t: any) => {
          const isActive = table === t.tableName;

          return (
            <Button
              key={t.tableName}
              variant={isActive ? "filled" : "subtle"}
              onClick={() => navigate(`/table/${t.tableName}`)}
              fullWidth
            >
              {t.tableName}
            </Button>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
