import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import TableListPage from "./pages/TableListPage";
import TableFormPage from "./pages/TableFormPage";
import SettingsTables from "./pages/SettingsTables";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route element={<MainLayout />}>

          <Route path="/settings" element={<SettingsTables />} />

          <Route path="/table/:table" element={<TableListPage />} />

          <Route
            path="/table/:table/new"
            element={<TableFormPage />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;