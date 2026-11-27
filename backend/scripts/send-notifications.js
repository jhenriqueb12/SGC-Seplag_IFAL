// Executa a rotina de notificações uma única vez (sem esperar o cron).
// Uso (a partir da pasta backend/): npm run send-notifications
import "dotenv/config";
import { pool } from "../src/config/database.js";
import { sendDueContractNotifications } from "../src/services/notificationService.js";

try {
  const sent = await sendDueContractNotifications();
  console.log(`E-mails enviados: ${sent}.`);
} catch (error) {
  console.error("Erro na rotina de notificações:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
