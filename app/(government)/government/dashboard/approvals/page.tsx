import { redirect } from "next/navigation";

export default function ApprovalsIndexPage() {
  redirect("/government/dashboard/approvals/pending");
}
