import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";

const AttendanceTable = lazy(() => import("./pages/AttendanceTable"));
const StudentDetail = lazy(() => import("./pages/StudentDetail"));

const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<AttendanceTable />} />
          <Route path="/student/:id" element={<StudentDetail />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
