import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-react-table/styles.css";
import "./index.css";

import App from "./App.tsx";
import { themes } from "./theme/themes.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Root() {
  const [themeName, setThemeName] = useState("gray");

  return (
    <MantineProvider
      defaultColorScheme="light"
      theme={themes[themeName as keyof typeof themes]}
    >
      <QueryClientProvider client={queryClient}>
        <App themeName={themeName} setThemeName={setThemeName} />
      </QueryClientProvider>
    </MantineProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);