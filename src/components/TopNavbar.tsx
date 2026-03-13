import {
  Group,
  Text,
  Box,
  Burger,
  useMantineColorScheme,
  ActionIcon,
  Select,
  Popover,
  Stack,
  Divider,
  Progress,
  Loader,
} from "@mantine/core";
import { IconMoon, IconSun, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { useSystemHealth } from "../api/reactQueryHooks/useHealth";
import { useNavigate } from "react-router-dom";

export default function TopNavbar({
  opened,
  toggle,
  themeName,
  setThemeName,
}: any) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [openedSettings, setOpenedSettings] = useState(false);

  const { data: health, isLoading } = useSystemHealth();
  const navigate = useNavigate();

  return (
    <Box
      px="md"
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #E5E7EB",
        background: colorScheme === "dark" ? "#111827" : "#FFFFFF",
      }}
    >
      <Group justify="space-between" w="100%">
        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" />

          <Text
            fw={700}
            size="lg"
            style={{
              cursor: "pointer",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "4px",
            }}
            onClick={() => navigate("/settings")}
          >
            ERP - Zenin
          </Text>
        </Group>

        <Group>
          <Popover
            opened={openedSettings}
            onChange={setOpenedSettings}
            position="bottom-end"
            shadow="md"
            width={240}
          >
            <Popover.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setOpenedSettings((o) => !o)}
              >
                <IconSettings size={18} />
              </ActionIcon>
            </Popover.Target>

            <Popover.Dropdown>
              <Stack gap="sm">
                {/* Dark / Light Mode */}
                <Group justify="space-between">
                  <Text size="sm">Mode</Text>

                  <ActionIcon
                    variant="light"
                    onClick={() => toggleColorScheme()}
                  >
                    {colorScheme === "dark" ? (
                      <IconSun size={16} />
                    ) : (
                      <IconMoon size={16} />
                    )}
                  </ActionIcon>
                </Group>

                {/* Theme Selector */}
                <Select
                  label="Theme"
                  value={themeName}
                  onChange={setThemeName}
                  data={[
                    { value: "blue", label: "Blue Theme" },
                    { value: "green", label: "Green Theme" },
                    { value: "gray", label: "Gray Theme" },
                    { value: "violet", label: "Violet Theme" },
                    { value: "", label: "Default" },
                  ]}
                />

                <Divider />

                {/* System Health */}
                <Text fw={600} size="sm">
                  System Health
                </Text>

                {isLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <Stack gap={4}>
                      <Text size="xs">CPU {health?.cpu}%</Text>
                      <Progress value={health?.cpu} color="orange" size="sm" />
                    </Stack>

                    <Stack gap={4}>
                      <Text size="xs">
                        RAM {health?.ram}% ({health?.ramUsed} /{" "}
                        {health?.ramTotal} GB)
                      </Text>
                      <Progress value={health?.ram} color="blue" size="sm" />
                    </Stack>

                    <Stack gap={4}>
                      <Text size="xs">
                        Disk {health?.disk}% ({health?.diskUsed} /{" "}
                        {health?.diskTotal} GB)
                      </Text>
                      <Progress value={health?.disk} color="green" size="sm" />
                    </Stack>
                  </>
                )}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
    </Box>
  );
}
