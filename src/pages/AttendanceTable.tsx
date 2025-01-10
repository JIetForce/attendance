import React, { useEffect, useRef, useCallback, useState } from "react";
import { useStudents } from "../hooks/useStudents";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { getFirstLastName } from "../utils/common";
import { CLASS_KEY } from "../../constants/students";

const AttendanceTable: React.FC = () => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    studentId: number | null;
    columnId: number | null;
    isAbsent: boolean;
  }>({
    open: false,
    studentId: null,
    columnId: null,
    isAbsent: false,
  });

  const {
    students,
    columns,
    isLoading,
    isError,
    addAbsence,
    removeAbsence,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStudents(CLASS_KEY);

  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastStudentRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  const handleCellClick = (
    studentId: number,
    columnId: number,
    isAbsent: boolean
  ) => {
    setConfirmDialog({
      open: true,
      studentId,
      columnId,
      isAbsent,
    });
  };

  const handleConfirm = () => {
    const { studentId, columnId, isAbsent } = confirmDialog;
    if (studentId && columnId) {
      if (isAbsent) {
        removeAbsence({ SchoolboyId: studentId, ColumnId: columnId });
      } else {
        addAbsence({ SchoolboyId: studentId, ColumnId: columnId });
      }
    }
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const handleNameClick = (studentId: number) => {
    navigate(`/student/${studentId}`);
  };

  if (isLoading) return <CircularProgress />;
  if (isError)
    return (
      <Alert severity="error">
        Error loading data. Please try again later.
      </Alert>
    );

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell
                sx={{
                  fontWeight: "bold",
                }}
                align="center"
                className="border-r"
              >
                №
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                }}
                className="border-r"
              >
                Ім’я учня
              </TableCell>
              {columns.map((column, index) => (
                <TableCell
                  sx={{
                    fontWeight: "bold",
                  }}
                  align="center"
                  className={index === columns.length - 1 ? "" : "border-r"}
                  key={column.Id}
                >
                  {column.Title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.Id}>
                <TableCell align="center" className="border-r">
                  {index + 1}
                </TableCell>
                <TableCell
                  onClick={() => handleNameClick(student.Id)}
                  className="border-r cursor-pointer hover:bg-gray-100"
                >
                  {getFirstLastName(student)}
                </TableCell>
                {columns.map((column, colIndex) => {
                  const isAbsent = student.Rates.some(
                    (rate) => rate.ColumnId === column.Id
                  );
                  return (
                    <TableCell
                      align="center"
                      className={`${
                        colIndex === columns.length - 1 ? "" : "border-r"
                      } cursor-pointer hover:bg-gray-100`}
                      key={column.Id}
                      onClick={() =>
                        handleCellClick(student.Id, column.Id, isAbsent)
                      }
                    >
                      {isAbsent ? "Н" : ""}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {hasNextPage && <div ref={lastStudentRef} className="h-5" />}
        {isFetchingNextPage && (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        )}
      </TableContainer>

      <Dialog open={confirmDialog.open} onClose={handleCancel}>
        <DialogTitle>
          {confirmDialog.isAbsent
            ? "Видалити відсутність?"
            : "Додати відсутність?"}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.isAbsent
            ? "Ви впевнені, що хочете видалити відсутність?"
            : "Ви впевнені, що хочете додати відсутність?"}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Відміна</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirmDialog.isAbsent ? "error" : "primary"}
          >
            {confirmDialog.isAbsent ? "Видалити" : "Додати"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AttendanceTable;
