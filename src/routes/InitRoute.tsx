import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppRoute, type RouteConfig } from "./AppRoute";
import { RouteName } from "./RouteName";
import { usePos } from "../context/PosContext";

const InitRoute: React.FC = () => {
  const { userProfile } = usePos();
  const isCashier = userProfile?.role === 'Cashier';

  return (
    <Routes>
      {AppRoute.map((route: RouteConfig, index: number) => {
        // Cashiers cannot access Inventory, User Management, or System Settings
        if (
          isCashier &&
          (route.path === RouteName.STOCK_INVENTORY ||
            route.path === RouteName.USER_MANAGEMENT ||
            route.path === RouteName.SYSTEM_SETTINGS)
        ) {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to={RouteName.POS_COUNTER} replace />}
            />
          );
        }
        return <Route key={index} path={route.path} element={<route.element />} />;
      })}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default InitRoute;
