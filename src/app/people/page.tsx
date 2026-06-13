import { DashboardHeader } from "@/components/dashboard-header";
import { UsersTable } from "@/components/users-table";
import { homelessUsers } from "@/data/homeless-users";

export default function PeoplePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        subtitle="ค้นหาและกรองข้อมูลตามพื้นที่ ความต้องการหลัก ระดับความเร่งด่วน และสถานะการติดตาม"
        title="ผู้ใช้บริการ"
      />
      <div className="mt-6">
        <UsersTable users={homelessUsers} />
      </div>
    </main>
  );
}
