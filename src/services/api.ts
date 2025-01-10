import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://94.131.246.109:5555/v1/",
  headers: {
    "Accept-Language": "en",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

api.interceptors.response.use(
  (response) => {
    if (response.status === 201) {
      console.log("Resource created successfully");
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(error.response);
      switch (error.response.status) {
        case 404:
          console.error("Resource not found");
          toast.error("Resource not found");
          break;
        case 500:
          console.error("Internal server error");
          toast.error("Internal server error");
          break;
        default:
          console.error("An error occurred:", error.message);
          toast.error("Something went wrong");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
