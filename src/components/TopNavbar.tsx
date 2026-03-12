import { Group, Text, Box, Burger } from "@mantine/core";

export default function TopNavbar({ opened, toggle }: any) {
  return (
    <Box
      px="md"
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #E5E7EB",
        background: "#FFFFFF",
      }}
    >
      <Group justify="space-between" w="100%">
        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" />

          <Text fw={700} size="lg">
            Zenin-ERP
          </Text>
        </Group>
      </Group>
    </Box>
  );
}
