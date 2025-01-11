import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Video from "./pages/Video";
import Public from "./pages/Public";

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
  {
    path: "/video",
    element: <Video />,
  },
  {
    path: "/public",
    element: <Public />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
