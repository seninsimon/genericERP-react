import React from "react";
import { Button, Stack, Text, Paper } from "@mantine/core";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Global Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Stack align="center" mt={120} px="md">
          <Text size="xl" fw={600}>
            Something went wrong
          </Text>

          {this.state.error && (
            <Paper
              p="sm"
              withBorder
              style={{
                maxWidth: 600,
                width: "100%",
                background: "#FFF5F5",
              }}
            >
              <Text c="red" size="sm">
                {this.state.error.message}
              </Text>
            </Paper>
          )}

          <Button onClick={this.handleReload}>
            Reload Page
          </Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}