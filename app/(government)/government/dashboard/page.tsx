import { redirect } from 'next/navigation';

export default function GovernmentDashboardRedirect() {
  redirect('/government/dashboard/command-center');
}
