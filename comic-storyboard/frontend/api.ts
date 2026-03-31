/**
 * API 配置
 */
import { Platform } from "react-native";

const LOCAL_IP = "192.168.1.7";

export const API_BASE =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : `http://${LOCAL_IP}:8000`;
