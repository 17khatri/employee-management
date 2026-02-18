import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-58 flex flex-col bg-gray-800 text-white p-4">
      <nav className="space-y-1 flex-1">
        <Link
          href="/dashboard"
          className="block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded"
        >
          Dashboard
        </Link>

        <Link
          href="/users"
          className="block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded"
        >
          Users
        </Link>

        <Link
          href="/employees"
          className="block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded"
        >
          Employees
        </Link>

        <Link
          href="/departments"
          className="block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded"
        >
          Department
        </Link>

        <Link
          href="/projects"
          className="block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded"
        >
          Projects
        </Link>

        <Link
          href="/tasks"
          className="block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded"
        >
          Tasks
        </Link>

        <Link
          href="/settings"
          className="block hover:bg-gray-700 border-b border-gray-700 p-1 text-sm rounded"
        >
          Settings
        </Link>
      </nav>
      <div className="mt-6">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
          className="w-full bg-red-500 text-white py-2 text-sm rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
