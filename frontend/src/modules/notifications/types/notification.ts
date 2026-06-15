export type NotificationType = "INSPECTION" | "INSURANCE";
export type NotificationSeverity = "INFO" | "WARNING" | "URGENT";

export type Notification = {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  vehicleId: string;
  plate: string;
  make: string;
  model: string;
  dueDate: string;
  daysRemaining: number;
};
