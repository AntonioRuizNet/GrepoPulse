import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const admin = cookies().get("gp_admin")?.value;
  const user = cookies().get("gp_user")?.value;

  if (!admin && !user) redirect("/dashboard/login?next=/dashboard");
  else redirect("/dashboard/monitor");

  return (
    <div className="card">
      <h1>Dashboard</h1>
      <p>Zona privada</p>
    </div>
  );
}
