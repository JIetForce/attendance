import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import api from "../services/api";

import {
  AbsenceData,
  Column,
  InfiniteQueryResponse,
  Rate,
  Student,
  StudentsAndColumns,
} from "../types/students";
import { CLASS_KEY } from "../constants/students";

const fetchStudentsAndColumns = async ({
  pageParam = 1,
}): Promise<StudentsAndColumns> => {
  const [studentsResponse, ratesResponse, columnsResponse] = await Promise.all([
    api.get<InfiniteQueryResponse>(
      `${CLASS_KEY}/Schoolboy?page=${pageParam}&limit=10`
    ),
    api.get<InfiniteQueryResponse>(`${CLASS_KEY}/Rate`),
    api.get<InfiniteQueryResponse>(`${CLASS_KEY}/Column`),
  ]);

  const students = studentsResponse.data.Items as Student[];
  const rates = ratesResponse.data.Items as Rate[];
  const columns = columnsResponse.data.Items as Column[];

  const studentsWithRates = students.map((student) => ({
    ...student,
    Rates: rates.filter((rate) => rate.SchoolboyId === student.Id),
  }));

  return { students: studentsWithRates, columns };
};

export const useStudents = (classKey: string) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["studentsAndColumns", classKey],
    queryFn: fetchStudentsAndColumns,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.students.length < 10) return undefined;
      return pages.length + 1;
    },
    staleTime: 5 * 60 * 1000,
  });

  const addAbsenceMutation = useMutation({
    mutationFn: (data: AbsenceData) =>
      api.post(`${classKey}/Rate`, {
        ...data,
        Title: "Н",
      }),
    onMutate: async (newAbsence) => {
      await queryClient.cancelQueries({
        queryKey: ["studentsAndColumns", classKey],
      });

      const previousData = queryClient.getQueryData<
        InfiniteData<StudentsAndColumns>
      >(["studentsAndColumns", classKey]);

      queryClient.setQueryData<InfiniteData<StudentsAndColumns>>(
        ["studentsAndColumns", classKey],
        (old) => {
          if (!old) return previousData;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              students: page.students.map((student) => {
                if (student.Id === newAbsence.SchoolboyId) {
                  return {
                    ...student,
                    Rates: [
                      ...student.Rates,
                      { ...newAbsence, Title: "Н", Id: Date.now() },
                    ],
                  };
                }
                return student;
              }),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _newAbsence, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["studentsAndColumns", classKey],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["studentsAndColumns", classKey],
      });
    },
  });

  const removeAbsenceMutation = useMutation({
    mutationFn: (data: AbsenceData) => api.post(`${classKey}/UnRate`, data),
    onMutate: async (absenceToRemove) => {
      await queryClient.cancelQueries({
        queryKey: ["studentsAndColumns", classKey],
      });

      const previousData = queryClient.getQueryData<
        InfiniteData<StudentsAndColumns>
      >(["studentsAndColumns", classKey]);

      queryClient.setQueryData<InfiniteData<StudentsAndColumns>>(
        ["studentsAndColumns", classKey],
        (old) => {
          if (!old) return previousData;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              students: page.students.map((student) => {
                if (student.Id === absenceToRemove.SchoolboyId) {
                  return {
                    ...student,
                    Rates: student.Rates.filter(
                      (rate) => !(rate.ColumnId === absenceToRemove.ColumnId)
                    ),
                  };
                }
                return student;
              }),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _absenceToRemove, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["studentsAndColumns", classKey],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["studentsAndColumns", classKey],
      });
    },
  });

  return {
    students: data?.pages.flatMap((page) => page.students) || [],
    columns: data?.pages[0]?.columns || [],
    isLoading,
    isError,
    addAbsence: addAbsenceMutation.mutate,
    removeAbsence: removeAbsenceMutation.mutate,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
