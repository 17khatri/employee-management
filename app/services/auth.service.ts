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

export const addUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
}) => {
    const response = await axiosInstance.post("/users", data);
    return response.data;
};

export const deleteUser = async (id: any) => {
    const response = await axiosInstance.delete(`/users`, { data: { userId: id } });
    return response.data;
};

export const editAdminUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
}) => {
    const response = await axiosInstance.patch(`/users`, data);
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
    const response = await axiosInstance.delete(`/employees`, { data: { employeeId: id } });
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
    description: string;
    status: string;
    assignedTo: string;
    projectId: string;
}) => {
    const response = await axiosInstance.post("/tasks", data);
    return response.data;
};

export const editTask = async (id: any, data: {
    title: string;
    description: string;
    status: string;
    assignedTo: string;
}) => {
    const response = await axiosInstance.patch(`/tasks`, { id: id, ...data });
    return response.data;
};


export const getProjects = async () => {
    const response = await axiosInstance.get("/projects");
    return response.data;
}

export const deleteProject = async (id: any) => {
    const response = await axiosInstance.delete(`/projects`, { data: { id: id } });
    return response.data;
};

export const addProject = async (data: {
    name: string;
    description: string;
}) => {
    const response = await axiosInstance.post("/projects", data);
    return response.data;
};

export const editProject = async (id: any, data: {
    name: string;
    description: string;
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
    description: string;
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

export const updateLeaves = async (id: string, data: {
    leaveStatus: string
}) => {
    const response = await axiosInstance.patch("/leaves", { id: id, ...data })
    return response.data
}

export const addLeaves = async (data: {
    date: Date;
    leaveType: string
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

export const bdayEmployee = async () => {
    const response = await axiosInstance.get("/upcoming-bday")
    return response.data
}