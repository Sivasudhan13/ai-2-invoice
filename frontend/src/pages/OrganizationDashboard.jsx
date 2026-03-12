import OrganizationLayout from '../components/OrganizationLayout';
import OrganizationAdminDashboard from '../components/OrganizationAdminDashboard';

export default function OrganizationDashboard() {
  return (
    <OrganizationLayout>
      <OrganizationAdminDashboard />
    </OrganizationLayout>
  );
}
