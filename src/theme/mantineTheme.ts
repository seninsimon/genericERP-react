import { createTheme } from "@mantine/core";

export const mantineTheme = createTheme({
  primaryColor: "dark",
  primaryShade: 8,

  fontFamily: "Inter, sans-serif",

  defaultRadius: "sm",

  radius: {
    sm: "8px",
    md: "8px",
    lg: "8px",
  },

  colors: {
    dark: [
      "#F9FAFB",
      "#F3F4F6",
      "#E5E7EB",
      "#D1D5DB",
      "#9CA3AF",
      "#6B7280",
      "#4B5563",
      "#374151",
      "#1F2937",
      "#111827",
    ],
  },

  components: {
    TextInput: {
      defaultProps: {
        size: "sm",
      },
      styles: {
        input: {
          border: "1px solid #D1D5DB",
        },
      },
    },

    Select: {
      defaultProps: {
        size: "sm",
      },
    },

    Button: {
      defaultProps: {
        size: "sm",
      },
    },
  },
});