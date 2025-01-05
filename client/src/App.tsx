import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

// const socket = io(import.meta.env.VITE_CORS_ORIGIN);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
