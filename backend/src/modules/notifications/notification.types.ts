export type NotificationType =
  | "INSPECTION"
  | "INSURANCE"
  | "REVISION_DATE"
  | "REVISION_MILEAGE";
export type NotificationSeverity = "INFO" | "WARNING" | "URGENT";

export type VehicleNotification = {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  vehicleId: string;
  plate: string;
  make: string;
  model: string;
  dueDate: string | null;
  daysRemaining: number | null;
  dueMileage: number | null;
  currentMileage: number | null;
  kilometersRemaining: number | null;
};
