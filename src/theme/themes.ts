import { createTheme } from "@mantine/core";

const baseTheme = {
  fontFamily: "Inter, sans-serif",
  defaultRadius: "sm",

  radius: {
    sm: "8px",
    md: "8px",
    lg: "8px",
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
};

export const themes = {
  blue: createTheme({
    ...baseTheme,
    primaryColor: "blue",
  }),

  green: createTheme({
    ...baseTheme,
    primaryColor: "green",
  }),

  gray: createTheme({
    ...baseTheme,
    primaryColor: "dark",
    primaryShade: 8,
  }),

  violet: createTheme({
    ...baseTheme,
    primaryColor: "violet",
  }),
};