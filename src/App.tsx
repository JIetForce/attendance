import "./App.css";
import { Routes, Route } from "react-router-dom";

import AttendanceTable from "./pages/AttendanceTable";
import StudentDetail from "./pages/StudentDetail";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AttendanceTable />} />
        <Route path="/student/:id" element={<StudentDetail />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
