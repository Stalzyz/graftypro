
import { prisma } from "@/lib/db";

export class AppointmentService {
    /**
     * Get available slots for a workspace and date
     */
    static async getAvailableSlots(workspaceId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await prisma.appointmentSlot.findMany({
            where: {
                workspace_id: workspaceId,
                start_time: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                is_booked: false
            },
            orderBy: {
                start_time: 'asc'
            }
        });
    }

    /**
     * Book a slot
     */
    static async bookSlot(workspaceId: string, contactId: string, slotId: string, notes?: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Check if slot is still available
            const slot = await tx.appointmentSlot.findUnique({
                where: { id: slotId }
            });

            if (!slot || slot.is_booked) {
                throw new Error("Slot not available");
            }

            // 2. Mark slot as booked
            await tx.appointmentSlot.update({
                where: { id: slotId },
                data: { is_booked: true }
            });

            // 3. Create appointment
            const appointment = await tx.appointment.create({
                data: {
                    workspace_id: workspaceId,
                    contact_id: contactId,
                    slot_id: slotId,
                    status: "CONFIRMED",
                    notes
                }
            });

            return appointment;
        });
    }

    /**
     * Cancel an appointment
     */
    static async cancelAppointment(appointmentId: string) {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!appointment) return null;

        return await prisma.$transaction(async (tx) => {
            await tx.appointmentSlot.update({
                where: { id: appointment.slot_id },
                data: { is_booked: false }
            });

            return await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: "CANCELLED" }
            });
        });
    }

    /**
     * Create default slots for a workspace (09:00 - 18:00, 30min each)
     */
    static async createDefaultSlots(workspaceId: string, date: Date) {
        const slots = [];
        const start = new Date(date);
        start.setHours(9, 0, 0, 0);

        for (let i = 0; i < 18; i++) {
            const slotStart = new Date(start);
            slotStart.setMinutes(start.getMinutes() + i * 30);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotStart.getMinutes() + 30);

            slots.push({
                workspace_id: workspaceId,
                start_time: slotStart,
                end_time: slotEnd
            });
        }

        return await prisma.appointmentSlot.createMany({
            data: slots
        });
    }
}
