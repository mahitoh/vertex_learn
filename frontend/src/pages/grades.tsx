import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Grades() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Grades</h1>
        <div className="bg-card-bg rounded-xl p-8 shadow-sm border border-gray-100">
          <p className="text-text-secondary text-lg">Grade management functionality will be implemented here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}