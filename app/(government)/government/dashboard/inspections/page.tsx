import { redirect } from "next/navigation";

export default function InspectionsIndexPage() {
  redirect("/government/dashboard/inspections/requests");
}
