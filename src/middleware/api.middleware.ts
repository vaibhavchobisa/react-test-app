import axios from "axios";
import { FC } from "react";
import AppConfig from "../config/config";

export const requestApiMiddleware = () => {
  axios.interceptors.request.use((config: any) => {
    let token = AppConfig.BACKEND_TOKEN;
    if (token) {
      config["headers"]["Authorization"] = "Token " + token;
    }
    return config;
  });
};
