import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import GoalDetail from "./pages/GoalDetail";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/goal/:id", element: <GoalDetail /> },
]);


