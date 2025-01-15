import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Student,
  StudentsResponse,
  StudentsAndColumns,
} from "../types/students";
import { InfiniteData } from "@tanstack/react-query";
import api from "../services/api";

export const useStudent = (classKey: string, id: string | undefined) => {
  const queryClient = useQueryClient();

  return useQuery<StudentsResponse, Error, Student | undefined>({
    queryKey: ["student", classKey, id],
    queryFn: async () => {
      const cachedData = queryClient.getQueryData<
        InfiniteData<StudentsAndColumns>
      >(["studentsAndColumns", classKey]);

      if (cachedData) {
        const student = cachedData.pages
          .flatMap((page) => page.students)
          .find((s) => s.Id === Number(id));

        if (student) {
          return { Items: [student] };
        }
      }

      const { data } = await api.get<StudentsResponse>(
        `${classKey}/Schoolboy?SchoolboyId=${id}`
      );
      return data;
    },
    select: (data) => data.Items.find((s) => s.Id === Number(id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
