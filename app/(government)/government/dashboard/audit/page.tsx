import { redirect } from "next/navigation";

export default function AuditIndexPage() {
  redirect("/government/dashboard/audit/activity");
}
