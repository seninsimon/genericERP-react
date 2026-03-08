import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Table, Group } from "@mantine/core";
import { getTableData, deleteData } from "../api/api";

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    await deleteData(table!, id);
    loadData();
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

  const columns = Object.keys(data[0]).filter((col) => col !== "_id");

  return (
    <div>

      <Button
        mb="md"
        onClick={() => navigate(`/table/${table}/new`)}
      >
        Add New
      </Button>

      <Table striped highlightOnHover>

        <thead>
          <tr>

            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}

            <th>Actions</th>

          </tr>
        </thead>

        <tbody>

          {data.map((row) => (
            <tr key={row._id}>

              {columns.map((col) => (
                <td key={col}>{String(row[col])}</td>
              ))}

              <td>
                <Group gap="xs">

                  <Button
                    size="xs"
                    variant="light"
                    onClick={() =>
                      navigate(`/table/${table}/view/${row._id}`)
                    }
                  >
                    View
                  </Button>

                  <Button
                    size="xs"
                    variant="light"
                    onClick={() =>
                      navigate(`/table/${table}/edit/${row._id}`)
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => handleDelete(row._id)}
                  >
                    Delete
                  </Button>

                </Group>
              </td>

            </tr>
          ))}

        </tbody>

      </Table>

    </div>
  );
}