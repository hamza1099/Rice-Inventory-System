import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppRoute, type RouteConfig } from "./AppRoute";

const InitRoute: React.FC = () => {
  return (
    <Routes>
      {AppRoute.map((route: RouteConfig, index: number) => (
        <Route key={index} path={route.path} element={<route.element />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default InitRoute;
