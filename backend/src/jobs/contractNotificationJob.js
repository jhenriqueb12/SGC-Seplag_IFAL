import cron from "node-cron";
import {
    sendDueContractNotifications
} from "../services/notificationService.js";

export function startContractNotificationJob() {
    if (process.env.NOTIFICATIONS_ENABLED !== "true") {
        console.log("Agendamento de notificações desabilitado.");
        return null;
    }

    const timezone =
        process.env.NOTIFICATIONS_TIMEZONE || "America/Maceio";

    const schedule =
        process.env.NOTIFICATIONS_CRON || "0 8 * * *";

    return cron.schedule(
        schedule,
        async () => {
            try {
                const sent = await sendDueContractNotifications();
                console.log(`E-mails enviados: ${sent}.`);
            } catch (error) {
                console.error(
                    "Erro na rotina de notificações:",
                    error
                );
            }
        },
        { timezone }
    );
}