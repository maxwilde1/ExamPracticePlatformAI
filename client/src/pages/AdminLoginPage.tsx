import { useLocation } from "wouter";
import AdminLogin from "@/components/AdminLogin";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();

  const handleLogin = (email: string, password: string) => {
    console.log("Admin logged in:", email);
    setLocation("/admin/dashboard");
  };

  return <AdminLogin onLogin={handleLogin} />;
}
