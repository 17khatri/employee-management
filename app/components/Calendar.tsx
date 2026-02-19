"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  addMeeting,
  getMeetings,
  updateMeeting,
} from "../services/auth.service";
import { useEffect, useState } from "react";
import { getUsers } from "../services/auth.service";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { Controller } from "react-hook-form";

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

interface UserOption {
  value: string;
  label: string;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<Users[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
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
        events={calendarEvents}
        dateClick={(info) => {
          reset();
          setEditingId(null);
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
                <label className="block text-sm mb-1">Title</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  type="text"
                  className="w-full border p-2 rounded"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Description</label>
                <input
                  {...register("description", {
                    required: "Description is required",
                  })}
                  type="text"
                  className="w-full border p-2 rounded"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Attendees</label>
                <Controller
                  name="attendees"
                  control={control}
                  rules={{ required: "Select at least one attendee" }}
                  render={({ field }) => (
                    <Select<UserOption, true>
                      isMulti
                      options={users.map((user) => ({
                        value: user._id,
                        label: user.name,
                      }))}
                      onChange={(selected) =>
                        field.onChange(selected.map((option) => option.value))
                      }
                      value={users
                        .filter((user) => field.value?.includes(user._id))
                        .map((user) => ({
                          value: user._id,
                          label: user.name,
                        }))}
                    />
                  )}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Date</label>
                <input
                  {...register("date", { required: "Date is required" })}
                  type="date"
                  //   value={selectedDate || ""}
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
