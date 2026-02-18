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

export const addUser = async (data: {
    name: string;
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

export const editUser = async (id: any, data: {
    name: string;
    email: string;
    isActive: boolean;
}) => {
    const response = await axiosInstance.patch(`/users`, { userId: id, ...data });
    return response.data;
};

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