import AdminMediaManager from '@/components/AdminMediaManager';
import AdminImageMigrator from '@/components/AdminImageMigrator';

export const metadata = { title: 'Admin - Media' };

export default function AdminMediaPage() {
  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Media Manager</h1>
      <div className="mb-6">
        <AdminImageMigrator />
      </div>
      <AdminMediaManager />
    </div>
  );
}
