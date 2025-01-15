import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { getFullName } from "../utils/common";
import { CLASS_KEY } from "../constants/students";
import { useStudent } from "../hooks/useStudent";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(CLASS_KEY, id);

  if (isLoading) {
    return <div className="flex justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <h1>{!student ? "Student not found" : getFullName(student)}</h1>
      <Button
        className="w-fit"
        variant="outlined"
        onClick={() => navigate("/")}
      >
        Назад
      </Button>
    </div>
  );
};

export default StudentDetail;
