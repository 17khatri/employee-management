import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AppsIcon from "@mui/icons-material/Apps";
import ListIcon from "@mui/icons-material/List";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-58 flex flex-col bg-gray-800 text-white p-4">
      <nav className="space-y-1 flex-1">
        <Link
          href="/dashboard"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/dashboard" ? "bg-gray-700" : ""}`}
        >
          <DashboardIcon className="inline mr-3" />
          Dashboard
        </Link>

        <Link
          href="/users"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/users" ? "bg-gray-700" : ""}`}
        >
          <PeopleIcon className="inline mr-3" />
          Users
        </Link>

        <Link
          href="/employees"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/employees" ? "bg-gray-700" : ""}`}
        >
          <BadgeIcon className="inline mr-3" />
          Employees
        </Link>

        <Link
          href="/departments"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/departments" ? "bg-gray-700" : ""}`}
        >
          <ApartmentIcon className="inline mr-3" />
          Department
        </Link>

        <Link
          href="/projects"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/projects" ? "bg-gray-700" : ""}`}
        >
          <AppsIcon className="inline mr-3" />
          Projects
        </Link>

        <Link
          href="/tasks"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/tasks" ? "bg-gray-700" : ""}`}
        >
          <ListIcon className="inline mr-3" />
          Tasks
        </Link>

        <Link
          href="/calendar"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/calendar" ? "bg-gray-700" : ""}`}
        >
          <CalendarMonthIcon className="inline mr-3" />
          Calendar
        </Link>

        <Link
          href="/settings"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/settings" ? "bg-gray-700" : ""}`}
        >
          <SettingsIcon className="inline mr-3" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
