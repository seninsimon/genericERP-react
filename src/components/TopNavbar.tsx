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
} from "@mantine/core";
import { IconMoon, IconSun, IconSettings } from "@tabler/icons-react";
import { useState } from "react";

export default function TopNavbar({
  opened,
  toggle,
  themeName,
  setThemeName,
}: any) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [openedSettings, setOpenedSettings] = useState(false);

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

          <Text fw={700} size="lg">
            Zenin-ERP
          </Text>
        </Group>

        <Group>
          <Popover
            opened={openedSettings}
            onChange={setOpenedSettings}
            position="bottom-end"
            shadow="md"
            width={220}
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

                <Select
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
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
    </Box>
  );
}