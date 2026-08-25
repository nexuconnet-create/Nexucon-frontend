import { redirect } from "next/navigation";

export default function ComplianceIndexPage() {
  redirect("/government/dashboard/compliance/non-conformances");
}
