import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import { Outlet } from "react-router-dom";

export default function MainLayout({ themeName, setThemeName }: any) {
  const [opened, { toggle }] = useDisclosure(true);

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: {
          mobile: !opened,
          desktop: !opened,
        },
      }}
    >
      <AppShell.Header>
        <TopNavbar
          opened={opened}
          toggle={toggle}
          themeName={themeName}
          setThemeName={setThemeName}
        />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
