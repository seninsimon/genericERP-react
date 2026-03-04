import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Table } from "@mantine/core";
import { getTableData } from "../api/api";

export default function TableListPage() {
  const { table } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [table]);

  const loadData = async () => {
    const res = await getTableData(table!);
    setData(res.data);
  };

  if (!data.length) {
    return (
      <div>
        <Button onClick={() => navigate(`/table/${table}/new`)}>
          Add New
        </Button>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div>

      <Button
        mb="md"
        onClick={() => navigate(`/table/${table}/new`)}
      >
        Add New
      </Button>

      <Table>

        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row._id}>
              {columns.map((col) => (
                <td key={col}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>

      </Table>

    </div>
  );
}