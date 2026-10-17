// Donne le rôle « photographe » (ou « admin ») à un compte existant.
// Usage : GOOGLE_APPLICATION_CREDENTIALS=compte-service.json node scripts/set-staff.js email@forlife.com [photographe|admin]
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [email, role = "photographe"] = process.argv.slice(2);
if (!email || !["photographe", "admin"].includes(role)) {
  console.error("Usage : node scripts/set-staff.js <email> [photographe|admin]");
  process.exit(1);
}
initializeApp();
const user = await getAuth().getUserByEmail(email);
await getAuth().setCustomUserClaims(user.uid, { role });
console.log(`${email} : rôle « ${role} » attribué (reconnexion nécessaire).`);
