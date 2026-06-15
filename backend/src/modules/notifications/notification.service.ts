import { prisma } from "../../lib/prisma.js";
import type {
  NotificationSeverity,
  NotificationType,
  VehicleNotification,
} from "./notification.types.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getDaysRemaining(dueDate: Date, today: Date) {
  return Math.round((startOfUtcDay(dueDate) - startOfUtcDay(today)) / DAY_IN_MS);
}

function getSeverity(daysRemaining: number): NotificationSeverity | null {
  if (daysRemaining <= 0) return "URGENT";
  if (daysRemaining <= 15) return "WARNING";
  if (daysRemaining <= 30) return "INFO";
  return null;
}

function createNotification(
  vehicle: {
    id: string;
    plate: string;
    make: string;
    model: string;
  },
  type: NotificationType,
  dueDate: Date,
  today: Date,
): VehicleNotification | null {
  const daysRemaining = getDaysRemaining(dueDate, today);
  const severity = getSeverity(daysRemaining);
  if (!severity) return null;

  const subject = type === "INSPECTION" ? "Inspeção" : "Seguro";
  const subjectLower = subject.toLowerCase();
  let title: string;
  let message: string;

  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    title = `${subject} vencido`;
    message = `A viatura ${vehicle.plate} está com ${subjectLower} vencido há ${overdueDays} ${overdueDays === 1 ? "dia" : "dias"}.`;
  } else if (daysRemaining === 0) {
    title = `${subject} vence hoje`;
    message = `A viatura ${vehicle.plate} tem ${subjectLower} a vencer hoje.`;
  } else {
    title = `${subject} próxima`;
    message = `A viatura ${vehicle.plate} tem ${subjectLower} a vencer em ${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"}.`;
  }

  return {
    id: `${type.toLowerCase()}-${vehicle.id}`,
    type,
    severity,
    title,
    message,
    vehicleId: vehicle.id,
    plate: vehicle.plate,
    make: vehicle.make,
    model: vehicle.model,
    dueDate: dueDate.toISOString().slice(0, 10),
    daysRemaining,
  };
}

export class NotificationService {
  async listByClub(clubId: string, today = new Date()) {
    const limitDate = new Date(startOfUtcDay(today) + 30 * DAY_IN_MS);
    const vehicles = await prisma.vehicle.findMany({
      where: {
        clubId,
        OR: [
          { inspectionDate: { lte: limitDate } },
          { insuranceDate: { lte: limitDate } },
        ],
      },
      select: {
        id: true,
        plate: true,
        make: true,
        model: true,
        inspectionDate: true,
        insuranceDate: true,
      },
    });

    const notifications = vehicles.flatMap((vehicle) => {
      const items: VehicleNotification[] = [];
      if (vehicle.inspectionDate) {
        const notification = createNotification(
          vehicle,
          "INSPECTION",
          vehicle.inspectionDate,
          today,
        );
        if (notification) items.push(notification);
      }
      if (vehicle.insuranceDate) {
        const notification = createNotification(
          vehicle,
          "INSURANCE",
          vehicle.insuranceDate,
          today,
        );
        if (notification) items.push(notification);
      }
      return items;
    });

    const severityOrder: Record<NotificationSeverity, number> = {
      URGENT: 0,
      WARNING: 1,
      INFO: 2,
    };

    return notifications.sort(
      (left, right) =>
        severityOrder[left.severity] - severityOrder[right.severity] ||
        left.daysRemaining - right.daysRemaining ||
        left.plate.localeCompare(right.plate),
    );
  }
}

export const notificationService = new NotificationService();
