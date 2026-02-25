"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  addMeeting,
  getHolidays,
  getMeetings,
  updateMeeting,
} from "../services/auth.service";
import { useEffect, useState } from "react";
import { getUsers } from "../services/auth.service";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import Select from "@mui/material/Select";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";

export interface CalendarEvent {
  _id: string;
  createdBy: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}

interface MeetingFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}

interface Users {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Holidays {
  _id: string;
  name: string;
  date: Date;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [holidays, setHolidays] = useState<Holidays[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<Users[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<MeetingFormData>({
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      attendees: [],
    },
  });

  useEffect(() => {
    const fetchMeetings = async () => {
      const meetings = await getMeetings();
      setEvents(meetings);
    };
    fetchMeetings();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getUsers();
      setUsers(users);
    };
    fetchUsers();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await getHolidays();
      setHolidays(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const calendarEvents = events.map((event) => {
    const dateOnly = new Date(event.date).toLocaleDateString("en-CA");

    const start = new Date(`${dateOnly}T${event.startTime}:00`);
    const end = new Date(`${dateOnly}T${event.endTime}:00`);

    return {
      id: event._id,
      title: event.title,
      start: start,
      end: end,
      date: event.date,
      extendedProps: event,
    };
  });

  const holidayEvents = holidays.map((holiday) => {
    const holidayDate = new Date(holiday.date);

    return {
      id: holiday._id,
      title: `🎉 ${holiday.name}`,
      start: holidayDate,
      allDay: true,
      display: "background",
      color: "#937bff", // optional styling
    };
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        const response = await updateMeeting(editingId, data);
        toast.success(response.message || "Meeting updated successfully");
      } else {
        const response = await addMeeting(data);
        toast.success(response.message || "Meeting added successfully");
      }
      const updatedMeetings = await getMeetings();
      setEvents(updatedMeetings);
    } catch (error: any) {
      console.error("Error adding meeting:", error);
      toast.error(error.response?.data?.message || "Failed to add meeting");
    }
    getMeetings();
    setIsModalOpen(false);
    reset();
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        selectable={true}
        timeZone="local"
        editable={true}
        nowIndicator={true}
        events={[...calendarEvents, ...holidayEvents]}
        dayHeaderDidMount={(arg) => {
          arg.el.style.cursor = "pointer";
          arg.el.onclick = () => {
            alert(arg.date);
          };
        }}
        dateClick={(info) => {
          reset();
          setEditingId(null);
          const clickedDate = new Date(info.date);
          const endDate = new Date(clickedDate);
          endDate.setHours(endDate.getHours() + 1);
          const hours = info.date.getHours().toString().padStart(2, "0");
          const time = info.date.getMinutes().toString().padStart(2, "0");
          const endHours = endDate.getHours().toString().padStart(2, "0");
          const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
          const formattedStartTime = `${hours}:${time}`;
          const formattedEndTime = `${endHours}:${endMinutes}`;
          const formattedDate = clickedDate.toISOString().split("T")[0];
          setValue("date", formattedDate);
          setValue("startTime", formattedStartTime);
          setValue("endTime", formattedEndTime);
          setIsModalOpen(true);
        }}
        eventClick={(info) => {
          const meeting = info.event.extendedProps as CalendarEvent;
          setEditingId(meeting._id);
          setValue("title", meeting.title);
          setValue("description", meeting.description);
          setValue("date", meeting.date.split("T")[0]);
          setValue("startTime", meeting.startTime);
          setValue("endTime", meeting.endTime);
          setValue("attendees", meeting.attendees);
          setIsModalOpen(true);
        }}
        eventDrop={async (info) => {
          const formatTime = (date: any) => {
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
          };
          try {
            const event = info.event;
            const updatedData = {
              date: event.start?.toLocaleDateString("en-CA"),
              startTime: formatTime(event.start),
              endTime: formatTime(event.end),
            };
            await updateMeeting(event.id, updatedData);
          } catch (error) {
            console.error(error);
            info.revert();
          }
        }}
        eventResize={async (info) => {
          try {
            const event = info.event;
            const formatTime = (date: any) => {
              const hours = date.getHours().toString().padStart(2, "0");
              const minutes = date.getMinutes().toString().padStart(2, "0");
              return `${hours}:${minutes}`;
            };
            const updatedData = {
              date: event.start?.toLocaleDateString("en-CA"),
              startTime: formatTime(event.start),
              endTime: formatTime(event.end),
            };
            await updateMeeting(event.id, updatedData);
          } catch (error) {}
        }}
      />
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Meeting" : "Schedule Meeting"}
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              //   className="grid grid-cols-3 gap-8"
            >
              <div className="mb-3">
                <TextField
                  size="small"
                  {...register("title", { required: "Title is required" })}
                  type="text"
                  className="w-full border p-2 rounded"
                  label="Title"
                  error={!!errors.title}
                  helperText={errors.title ? errors.title.message : ""}
                />
              </div>

              <div className="mb-3">
                <TextField
                  size="small"
                  {...register("description", {
                    required: "Description is required",
                  })}
                  type="text"
                  className="w-full border p-2 rounded"
                  label="Description"
                  error={!!errors.description}
                  helperText={
                    errors.description ? errors.description.message : ""
                  }
                />
              </div>

              <div className="mb-3">
                <FormControl
                  fullWidth
                  margin="dense"
                  error={!!errors.attendees}
                >
                  <InputLabel size="small" id="attendees-label">
                    Attendees
                  </InputLabel>

                  <Controller
                    name="attendees"
                    control={control}
                    defaultValue={[]}
                    rules={{ required: "Select at least one attendee" }}
                    render={({ field }) => (
                      <Select
                        multiple
                        labelId="attendees-label"
                        label="attendees"
                        {...field}
                        size="small"
                      >
                        {users.map((user) => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />

                  <FormHelperText>{errors.attendees?.message}</FormHelperText>
                </FormControl>
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Date</label>
                <input
                  {...register("date", { required: "Date is required" })}
                  type="date"
                  className="w-full border p-2 rounded"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-3">
                  <label className="block text-sm mb-1">Start Time</label>
                  <input
                    {...register("startTime", {
                      required: "Start Time is required",
                    })}
                    type="time"
                    className="w-full border p-2 rounded"
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1">End Time</label>
                  <input
                    {...register("endTime", {
                      required: "End Time is required",
                    })}
                    type="time"
                    className="w-full border p-2 rounded"
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-start gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
