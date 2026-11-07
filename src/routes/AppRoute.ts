import type { ComponentType } from "react";
import { RouteName } from "./RouteName";
import { PosCounterScreen } from "../screens/PosCounterScreen";
import { DailyMemoScreen } from "../screens/DailyMemoScreen";
import { StockInventoryScreen } from "../screens/StockInventoryScreen";
import { DayEndClosingScreen } from "../screens/DayEndClosingScreen";
import { UserManagementScreen } from "../screens/UserManagementScreen";
import { SystemSettingsScreen } from "../screens/SystemSettingsScreen";

export interface RouteConfig {
  path: string;
  element: ComponentType<any>;
}

export const AppRoute: RouteConfig[] = [
  {
    path: RouteName.HOME,
    element: PosCounterScreen,
  },
  {
    path: RouteName.DAILY_MEMO,
    element: DailyMemoScreen,
  },
  {
    path: RouteName.STOCK_INVENTORY,
    element: StockInventoryScreen,
  },
  {
    path: RouteName.DAY_END,
    element: DayEndClosingScreen,
  },
  {
    path: RouteName.USER_MANAGEMENT,
    element: UserManagementScreen,
  },
  {
    path: RouteName.SYSTEM_SETTINGS,
    element: SystemSettingsScreen,
  },
];
