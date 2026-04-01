import DashboardClient from '@/components/app/dashboard/DashboardClient';

export const metadata = {
  title: 'Dashboard - EcoWeave',
  description: 'EcoWeave Compliance Dashboard - Monitor wastewater treatment compliance in real-time',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
