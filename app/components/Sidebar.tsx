import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  Apartment as ApartmentIcon,
  Apps as AppsIcon,
  List as ListIcon,
  CalendarMonth as CalendarMonthIcon,
  Settings as SettingsIcon,
  AccessAlarm as AccessAlarmIcon,
} from "@mui/icons-material";
import CastleIcon from "@mui/icons-material/Castle";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
export default function Sidebar() {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

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
        {user?.role === "admin" && (
          <Link
            href="/users"
            className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/users" ? "bg-gray-700" : ""}`}
          >
            <PeopleIcon className="inline mr-3" />
            Users
          </Link>
        )}

        {user?.role === "admin" && (
          <Link
            href="/employees"
            className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/employees" ? "bg-gray-700" : ""}`}
          >
            <BadgeIcon className="inline mr-3" />
            Employees
          </Link>
        )}

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
          href="/leaves"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/leaves" ? "bg-gray-700" : ""}`}
        >
          <AccessAlarmIcon className="inline mr-3" />
          Leaves
        </Link>

        {user?.role === "admin" && (
          <Link
            href="/holidays"
            className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/holidays" ? "bg-gray-700" : ""}`}
          >
            <CastleIcon className="inline mr-3" />
            Holidays
          </Link>
        )}

        <Link
          href="/attendance"
          className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/attendance" ? "bg-gray-700" : ""}`}
        >
          <TouchAppIcon className="inline mr-3" />
          Attendance
        </Link>

        {user?.role === "employee" && (
          <Link
            href="/worksheet"
            className={`block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded ${pathname === "/worksheet" ? "bg-gray-700" : ""}`}
          >
            <ListAltIcon className="inline mr-3" />
            Worksheet
          </Link>
        )}

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
