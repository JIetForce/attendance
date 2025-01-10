import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import { getFullName } from "../utils/common";
import { StudentsAndColumns } from "../types/students";
import { CLASS_KEY } from "../constants/students";
import { InfiniteData } from "@tanstack/react-query";

type QueryData = InfiniteData<StudentsAndColumns> | undefined;

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<QueryData>([
    "studentsAndColumns",
    CLASS_KEY,
  ]);

  const students = data?.pages.flatMap((page) => page.students) || [];
  const student = students?.find((s) => s.Id === Number(id));

  return (
    <div className="flex flex-col gap-4 items-center">
      <h1>{!student ? "Student not found" : getFullName(student)}</h1>
      <Button className="w-fit" variant="outlined" onClick={() => navigate(-1)}>
        Назад
      </Button>
    </div>
  );
};

export default StudentDetail;
