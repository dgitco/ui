import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./styles.css";
import { Layout } from "~/site/layout";
import { Home } from "~/site/home";
import { Docs } from "~/site/docs";
import { ItemPage } from "~/site/item";
import { NotFound } from "~/site/not-found";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/docs", element: <Docs /> },
      { path: "/components/:name", element: <ItemPage /> },
      { path: "/blocks/:name", element: <ItemPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
