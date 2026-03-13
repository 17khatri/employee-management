import { Dayjs } from "dayjs";
import { StudyFormValues } from "../(protected)/employees/page";
import axiosInstance from "./axiosInstance";

export const loginUser = async (data: {
    email: string;
    password: string;
}) => {
    const response = await axiosInstance.post("/login", data);
    return response.data;
};

export const getUsers = async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
}

export const getLoggedInUser = async () => {
    const response = await axiosInstance.get("/profile")
    return response.data
}

export const updateLoggedInUser = async (data: {
    firstName: string;
    lastName: string;
    email: string
}) => {
    const response = await axiosInstance.patch("/profile/admin", data)
    return response.data
}

export const updateEmployeeProfile = async (formData: FormData) => {
    const response = await axiosInstance.patch(
        "/profile/employee",
        formData
    );
    return response.data;
};

export const addUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
}) => {
    const response = await axiosInstance.post("/users", data);
    return response.data;
};

export const editUser = async (id: any, data: {
    firstName: string;
    lastName: string;
    email: string;
}) => {
    const response = await axiosInstance.patch(`/users`, { id: id, ...data });
    return response.data;
};

export const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
}) => {
    const response = await axiosInstance.patch("/change-password", data);
    return response.data;
};

export const updatePassword = async (data: {
    token: any
    password: any
}) => {
    const response = await axiosInstance.post("/reset-password", data)
    return response.data
}

export const getEmployees = async () => {
    const response = await axiosInstance.get("/employees");
    return response.data;
}

export const deleteEmployee = async (id: any) => {
    const response = await axiosInstance.delete(`/employees`, { data: { id: id } });
    return response.data;
};

export const getDepartments = async () => {
    const response = await axiosInstance.get("/departments");
    return response.data;
}

export const viewEmployee = async (id: any) => {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data;
};

export const getTasks = async () => {
    const response = await axiosInstance.get("/tasks");
    return response.data;
}

export const getEmployeesTask = async () => {
    const response = await axiosInstance.get("/tasks/employee")
    return response.data
}

export const viewTask = async (id: any) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
};

export const deleteTask = async (id: any) => {
    const response = await axiosInstance.delete(`/tasks`, { data: { id: id } });
    return response.data;
};

export const addTask = async (data: {
    title: string;
    description?: string;
    status: string;
    assignedTo: string;
    projectId: string;
}) => {
    const response = await axiosInstance.post("/tasks", data);
    return response.data;
};

export const editTask = async (id: any, data: {
    title?: string;
    description?: string;
    status?: string;
}) => {
    const response = await axiosInstance.patch(`/tasks`, { id: id, ...data });
    return response.data;
};

export const getProjects = async () => {
    const response = await axiosInstance.get("/projects");
    return response.data;
}

export const getEmployeesProject = async () => {
    const response = await axiosInstance.get("/projects/employee")
    return response.data
}

export const deleteProject = async (id: any) => {
    const response = await axiosInstance.delete(`/projects`, { data: { id: id } });
    return response.data;
};

export const addProject = async (data: {
    name: string;
    description?: string;
}) => {
    const response = await axiosInstance.post("/projects", data);
    return response.data;
};

export const editProject = async (id: any, data: {
    name: string;
    description?: string;
}) => {
    const response = await axiosInstance.patch(`/projects`, { id: id, ...data });
    return response.data;
};


export const getMeetings = async () => {
    const response = await axiosInstance.get("/meetings");
    return response.data;
}

export const addMeeting = async (data: {
    createdBy: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    attendees: string[];
}) => {
    const response = await axiosInstance.post("/meetings", data);
    return response.data;
};

export const updateMeeting = async (id: string, data: {
    title?: string;
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    attendees?: string[];
}) => {
    const response = await axiosInstance.patch(`/meetings`, { id: id, ...data });
    return response.data;
};

export const getEmployeesStudies = async (id: any) => {
    const response = await axiosInstance.get(`/studies/${id}`)
    return response.data
}

export const addEmployeeStudies = async (data: StudyFormValues, employeeId: string | undefined) => {
    const response = await axiosInstance.post("/studies", { ...data, employeeId: employeeId })
    return response.data;
}

export const deleteStudies = async (id: any) => {
    const response = await axiosInstance.delete("/studies", { data: { id } })
    return response.data
}


export const getAdminLeaves = async () => {
    const response = await axiosInstance.get("/leaves")
    return response.data
}

export const getEmployeeLeaves = async () => {
    const response = await axiosInstance.get("/leaves/employees")
    return response.data
}

export const getTodayLeaveEmployee = async () => {
    const response = await axiosInstance.get("leaves/today")
    return response.data
}

export const updateLeavesForAdmin = async (id: string, data: {
    leaveStatus: string
}) => {
    const response = await axiosInstance.patch("/leaves", { id: id, ...data })
    return response.data
}

export const updateLeaves = async (id: string, data: {
    date: Dayjs | null;
    leaveType: string;
    reason: string;
}) => {
    const response = await axiosInstance.patch("/leaves/employees", { id: id, ...data })
    return response.data
}

export const deleteLeaves = async (id: any) => {
    const response = await axiosInstance.delete("/leaves/employees", { data: { id } })
    return response.data
}

export const addLeaves = async (data: {
    date: Dayjs | null;
    leaveType: string
    reason: string
}) => {
    const response = await axiosInstance.post("/leaves/employees", data)
    return response.data
}

export const getHolidays = async () => {
    const response = await axiosInstance.get("/holidays")
    return response.data
}

export const addHolidays = async (data: {
    name: string
    date: Date;
}) => {
    const response = await axiosInstance.post("/holidays", data)
    return response.data
}

export const deleteHolidays = async (id: any) => {
    const response = await axiosInstance.delete("/holidays", { data: { id } })
    return response.data
}

export const updateHoliday = async (id: string, data: {
    name: string;
    date: Date
}) => {
    const response = await axiosInstance.patch("/holidays", { id: id, ...data })
}

export const bdayEmployee = async () => {
    const response = await axiosInstance.get("/upcoming-bday")
    return response.data
}

export const postAttendance = async (data: {
    inTime: string;
    outTime: string;
}) => {
    const response = await axiosInstance.post("/attendance", data)
    return response.data
}

export const updateAttendance = async (id: string, data: {
    inTime: string;
    outTime: string;
}) => {
    const response = await axiosInstance.patch("attendance", { id: id, ...data })
    return response.data
}

export const getTodaysAttendance = async () => {
    const response = await axiosInstance.get("/attendance/employee/today")
    return response.data
}

export const getEmployeesAttendance = async () => {
    const response = await axiosInstance.get("/attendance/employee")
    return response.data
}

export const getAttendance = async () => {
    const response = await axiosInstance.get("/attendance")
    return response.data
}

export const getWorksheetData = async (month: number, year: number) => {
    const response = await axiosInstance.get(`/worksheet?month=${month}&year=${year}`)
    return response.data
}

export const getWorkPlans = async () => {
    const response = await axiosInstance.get("/workplan")
    return response.data
}

export const addWorkPlan = async (data: {
    projectId: string;
    title: string;
    estimationHours: string;
    status: string;
    description?: string;
    date: Date
}) => {
    const response = await axiosInstance.post("/workplan", data)
    return response.data
}

export const addWorkPlanByIds = async (data: {
    ids: {
        id: string;
        estimationHours: number;
    }[];
    date?: Date;
}) => {
    const response = await axiosInstance.post("/workplan/byIds", data)
    return response.data
}