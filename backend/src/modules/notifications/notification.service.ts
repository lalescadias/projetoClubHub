import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
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
  if (daysRemaining < 0) return "URGENT";
  if (daysRemaining <= 15) return "WARNING";
  if (daysRemaining <= 30) return "INFO";
  return null;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
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

  const subject =
    type === "INSPECTION"
      ? "Inspeção"
      : type === "INSURANCE"
        ? "Seguro"
        : "Revisão";
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
    id: `${type.toLowerCase()}-${vehicle.id}-${dateKey(dueDate)}`,
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
    dueMileage: null,
    currentMileage: null,
    kilometersRemaining: null,
  };
}

function createRevisionMileageNotification(
  vehicle: {
    id: string;
    plate: string;
    make: string;
    model: string;
    currentMileage: number;
  },
  dueMileage: number,
): VehicleNotification | null {
  const kilometersRemaining = dueMileage - vehicle.currentMileage;
  if (kilometersRemaining > 500) return null;

  const overdue = kilometersRemaining < 0;
  const exceededBy = Math.abs(kilometersRemaining);

  return {
    id: `revision-mileage-${vehicle.id}-${dueMileage}`,
    type: "REVISION_MILEAGE",
    severity: overdue ? "URGENT" : "WARNING",
    title: overdue
      ? "Revisão por quilometragem vencida"
      : "Revisão por quilometragem próxima",
    message: overdue
      ? `A viatura ${vehicle.plate} ultrapassou a revisão prevista por ${exceededBy} km.`
      : kilometersRemaining === 0
        ? `A viatura ${vehicle.plate} atingiu a quilometragem prevista para a revisão.`
        : `A viatura ${vehicle.plate} tem revisão prevista dentro de ${kilometersRemaining} km.`,
    vehicleId: vehicle.id,
    plate: vehicle.plate,
    make: vehicle.make,
    model: vehicle.model,
    dueDate: null,
    daysRemaining: null,
    dueMileage,
    currentMileage: vehicle.currentMileage,
    kilometersRemaining,
  };
}

export class NotificationService {
  async listByClub(
    clubId: string,
    userId: string,
    today = new Date(),
  ) {
    const notifications = await this.calculateByClub(clubId, today);
    if (notifications.length === 0) return notifications;

    const dismissed = await prisma.notificationDismissal.findMany({
      where: {
        userId,
        clubId,
        notificationId: { in: notifications.map((item) => item.id) },
      },
      select: { notificationId: true },
    });
    const dismissedIds = new Set(dismissed.map((item) => item.notificationId));
    return notifications.filter((item) => !dismissedIds.has(item.id));
  }

  async dismiss(
    clubId: string,
    userId: string,
    notificationId: string,
  ) {
    const notifications = await this.calculateByClub(clubId, new Date());
    if (!notifications.some((item) => item.id === notificationId)) {
      throw new AppError("Notificação não encontrada.", 404);
    }

    await prisma.notificationDismissal.upsert({
      where: {
        userId_clubId_notificationId: { userId, clubId, notificationId },
      },
      create: { userId, clubId, notificationId },
      update: {},
    });
  }

  private async calculateByClub(clubId: string, today: Date) {
    const vehicles = await prisma.vehicle.findMany({
      where: { clubId },
      select: {
        id: true,
        plate: true,
        make: true,
        model: true,
        inspectionDate: true,
        insuranceDate: true,
        currentMileage: true,
        revisions: {
          orderBy: [{ revisionDate: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: {
            id: true,
            nextRevisionDate: true,
            nextRevisionMileage: true,
          },
        },
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
      const latestRevision = vehicle.revisions[0];
      if (latestRevision?.nextRevisionDate) {
        const notification = createNotification(
          vehicle,
          "REVISION_DATE",
          latestRevision.nextRevisionDate,
          today,
        );
        if (notification) {
          notification.id = `revision-date-${vehicle.id}-${latestRevision.id}-${dateKey(latestRevision.nextRevisionDate)}`;
          notification.title =
            notification.daysRemaining! < 0
              ? "Revisão vencida"
              : notification.daysRemaining === 0
                ? "Revisão prevista para hoje"
                : "Revisão próxima";
          notification.message = buildRevisionDateMessage(
            vehicle.plate,
            notification.daysRemaining!,
          );
          items.push(notification);
        }
      }
      if (latestRevision?.nextRevisionMileage !== null &&
          latestRevision?.nextRevisionMileage !== undefined) {
        const notification = createRevisionMileageNotification(
          vehicle,
          latestRevision.nextRevisionMileage,
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
        (left.daysRemaining ?? left.kilometersRemaining ?? 0) -
          (right.daysRemaining ?? right.kilometersRemaining ?? 0) ||
        left.plate.localeCompare(right.plate),
    );
  }
}

function buildRevisionDateMessage(plate: string, daysRemaining: number) {
  if (daysRemaining < 0) {
    const days = Math.abs(daysRemaining);
    return `A viatura ${plate} está com a revisão vencida há ${days} ${days === 1 ? "dia" : "dias"}.`;
  }
  if (daysRemaining === 0) {
    return `A viatura ${plate} tem revisão prevista para hoje.`;
  }
  return `A viatura ${plate} tem revisão prevista dentro de ${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"}.`;
}

export const notificationService = new NotificationService();
