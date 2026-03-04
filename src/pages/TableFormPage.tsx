import { useParams } from "react-router-dom";
import DynamicForm from "../components/DynamicForm";

export default function TableFormPage() {

  const { table } = useParams();

  return (
    <div>
      <DynamicForm table={table} />
    </div>
  );
}