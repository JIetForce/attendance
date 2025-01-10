import { Student } from "../types/students";

export const getFirstLastName = (student: Student): string => {
  return `${student.LastName || "-"} ${student.FirstName || "-"}`;
};

export const getFullName = (student: Student): string => {
  return `${student.FirstName || "-"} ${student.LastName || "-"} ${
    student.SecondName || "-"
  }`;
};
