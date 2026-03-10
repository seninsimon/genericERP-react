import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-react-table/styles.css";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <MantineProvider defaultColorScheme="light">
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </MantineProvider>,
);
