export type Student = {
  Id: number;
  FirstName: string;
  SecondName: string;
  LastName: string;
};

export type Rate = {
  Id: number;
  SchoolboyId: number;
  ColumnId: number;
  Title: string;
};

export type Column = {
  Id: number;
  Title: string;
};

export type StudentWithRates = Student & {
  Rates: Rate[];
};

export type StudentsAndColumns = {
  students: StudentWithRates[];
  columns: Column[];
};

export type InfiniteQueryResponse = {
  Items: Student[] | Rate[] | Column[];
  Quantity: number;
};

export type AbsenceData = {
  SchoolboyId: number;
  ColumnId: number;
};

export type StudentsResponse = {
  Items: Student[];
};
