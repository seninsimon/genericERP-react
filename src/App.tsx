import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Notifications } from "@mantine/notifications";

import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./layout/MainLayout";

import TableListPage from "./pages/TableListPage";
import TableFormPage from "./pages/TableFormPage";
import SettingsTables from "./pages/SettingsTables";

function App() {
  return (
    <BrowserRouter>

      {/* GLOBAL NOTIFICATIONS */}
      <Notifications position="top-right" />

      {/* GLOBAL ERROR BOUNDARY */}
      <ErrorBoundary>

        <Routes>

          <Route element={<MainLayout />}>

            <Route path="/settings" element={<SettingsTables />} />

            <Route path="/table/:table" element={<TableListPage />} />

            <Route path="/table/:table/new" element={<TableFormPage />} />

            <Route path="/table/:table/view/:id" element={<TableFormPage />} />

            <Route path="/table/:table/edit/:id" element={<TableFormPage />} />

          </Route>

        </Routes>

      </ErrorBoundary>

    </BrowserRouter>
  );
}

export default App;