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
import PaymentIcon from "@mui/icons-material/Payment";
import CastleIcon from "@mui/icons-material/Castle";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import IconButton from "@mui/material/IconButton";
import Logout from "@mui/icons-material/Logout";
import { logout } from "../store/authSlice";
export default function Sidebar() {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <aside className="w-60 h-screen sticky top-0 flex flex-col bg-gray-white text-gray-400 p-4 overflow-y-auto">
      <div className="flex items-center mb-3 gap-2">
        <ManageAccountsIcon color="error" />
        <p className="text-gray-700 font-semibold">EMP System</p>
      </div>
      <nav className="space-y-2 flex-1">
        <Link
          href="/dashboard"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/dashboard" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <DashboardIcon
            className={`${pathname === "/dashboard" ? "text-red-500" : ""} inline mr-3`}
          />
          Dashboard
        </Link>
        {user?.role === "admin" && (
          <Link
            href="/users"
            className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/users" ? "bg-gray-300 text-gray-800" : ""}`}
          >
            <PeopleIcon
              className={`${pathname === "/users" ? "text-red-500" : ""} inline mr-3`}
            />
            Users
          </Link>
        )}

        {user?.role === "admin" && (
          <Link
            href="/employees"
            className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/employees" ? "bg-gray-300 text-gray-800" : ""}`}
          >
            <BadgeIcon
              className={`${pathname === "/employees" ? "text-red-500" : ""} inline mr-3`}
            />
            Employees
          </Link>
        )}

        {user?.role === "admin" && (
          <Link
            href="/departments"
            className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/departments" ? "bg-gray-300 text-gray-800" : ""}`}
          >
            <ApartmentIcon
              className={`${pathname === "/departments" ? "text-red-500" : ""} inline mr-3`}
            />
            Department
          </Link>
        )}

        <Link
          href="/projects"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/projects" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <AppsIcon
            className={`${pathname === "/projects" ? "text-red-500" : ""} inline mr-3`}
          />
          Projects
        </Link>

        <Link
          href="/tasks"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/tasks" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <ListIcon
            className={`${pathname === "/tasks" ? "text-red-500" : ""} inline mr-3`}
          />
          Tasks
        </Link>

        <Link
          href="/calendar"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/calendar" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <CalendarMonthIcon
            className={`${pathname === "/calendar" ? "text-red-500" : ""} inline mr-3`}
          />
          Calendar
        </Link>

        <Link
          href="/leaves"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/leaves" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <AccessAlarmIcon
            className={`${pathname === "/leaves" ? "text-red-500" : ""} inline mr-3`}
          />
          Leaves
        </Link>

        {user?.role === "admin" && (
          <Link
            href="/holidays"
            className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/holidays" ? "bg-gray-300 text-gray-800" : ""}`}
          >
            <CastleIcon
              className={`${pathname === "/holidays" ? "text-red-500" : ""} inline mr-3`}
            />
            Holidays
          </Link>
        )}

        <Link
          href="/attendance"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/attendance" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <TouchAppIcon
            className={`${pathname === "/attendance" ? "text-red-500" : ""} inline mr-3`}
          />
          Attendance
        </Link>

        {user?.role === "employee" && (
          <Link
            href="/worksheet"
            className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/worksheet" ? "bg-gray-300 text-gray-800" : ""}`}
          >
            <ListAltIcon
              className={`${pathname === "/worksheet" ? "text-red-500" : ""} inline mr-3`}
            />
            Worksheet
          </Link>
        )}

        {user?.role === "employee" && (
          <Link
            href="/workplan"
            className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/workplan" ? "bg-gray-300 text-gray-800" : ""}`}
          >
            <WorkspacesIcon
              className={`${pathname === "/workplan" ? "text-red-500" : ""} inline mr-3`}
            />
            Work Plan
          </Link>
        )}

        <Link
          href="/cart"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/cart" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <PaymentIcon
            className={`${pathname === "/cart" ? "text-red-500" : ""} inline mr-3`}
          />
          Cart
        </Link>

        <Link
          href="/pdf"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/pdf" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <PictureAsPdfIcon
            className={`${pathname === "/pdf" ? "text-red-500" : ""} inline mr-3`}
          />
          PDF Operations
        </Link>

        <div
          onClick={handleLogout}
          className="flex items-center cursor-pointer hover:bg-gray-300 rounded"
        >
          <IconButton className="flex hover:bg-white">
            <Logout color="error" fontSize="small" />
          </IconButton>
          <p className="text-[16px] text-gray-400">Logout</p>
        </div>

        {/* <Link
          href="/settings"
          className={`block hover:bg-gray-300 p-2 text-sm rounded ${pathname === "/settings" ? "bg-gray-300 text-gray-800" : ""}`}
        >
          <SettingsIcon
            className={`${pathname === "/settings" ? "text-red-500" : ""} inline mr-3`}
          />
          Settings
        </Link> */}
      </nav>
    </aside>
  );
}
