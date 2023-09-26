import { createBrowserRouter, RouteObject } from "react-router-dom";
import { PRODUCT } from "../constants/page-paths.constants";
import BasicLayout from "../layouts/basic.layout";
import ProductList from "../pages/product/list";

const router = createBrowserRouter([
  {
    path: '/',
    element: <BasicLayout />,
    children: [{
      // it renders this element
      element: <ProductList />,

      // when the URL matches this segment
      path: '/' + PRODUCT.LIST,
    }
    ]
  },

]);

export default router;
