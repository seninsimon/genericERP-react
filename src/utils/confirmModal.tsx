import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";

export function confirmAction(
  message: string,
  onConfirm: () => void,
  title = "Confirm Action"
) {
  modals.openConfirmModal({
    title,
    children: <Text size="sm">{message}</Text>,
    labels: { confirm: "Confirm", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onConfirm,
  });
}