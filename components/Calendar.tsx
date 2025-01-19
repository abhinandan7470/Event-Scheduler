"use client";

import React, { useState, useEffect } from "react";
import {
  formatDate,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [editedEventTitle, setEditedEventTitle] = useState<string>("");

  useEffect(() => {
    // Load events from local storage when the component mounts
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("events");
      if (savedEvents) {
        setCurrentEvents(JSON.parse(savedEvents));
      }
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever they change
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(currentEvents));
    }
  }, [currentEvents]);

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected: EventClickArg) => {
    setSelectedEvent(selected.event);
    setEditedEventTitle(selected.event.title);
    setIsEditDialogOpen(true); // Open the Edit Dialog
  };
  const handleEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      selectedEvent.setProp("title", editedEventTitle); // Update the event title
      setIsEditDialogOpen(false); // Close the dialog
      setSelectedEvent(null); // Clear the selected event
      setEditedEventTitle(""); // Clear the title input
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle && selectedDate) {
      const calendarApi = selectedDate.view.calendar; // Get the calendar API instance.
      calendarApi.unselect(); // Unselect the date range.

      const newEvent = {
        id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
        title: newEventTitle,
        start: selectedDate.start,
        end: selectedDate.end,
        allDay: selectedDate.allDay,
      };

      calendarApi.addEvent(newEvent);
      handleCloseDialog();
    }
  };

  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7">
            Calendar Events
          </div>
          <ul className="space-y-4">
            {currentEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                No Events Present
              </div>
            )}

            {currentEvents.length > 0 &&
              currentEvents.map((event: EventApi) => (
                <li
                  className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                  key={event.id}
                >
                  <span className="font-bold">{event.title}</span>
                  <br />
                  <label className="text-slate-950">
                    {formatDate(event.start!, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true, // Display AM/PM
                    })}
                  </label>
                </li>
              ))}
          </ul>
        </div>

        <div className="w-9/12 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            initialEvents={
              typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("events") || "[]")
                : []
            }
            eventContent={(eventInfo) => {
              // Custom rendering for event - Only show event name
              return (
                <div>
                  <b>{eventInfo.event.title}</b>
                </div>
              );
            }}
          />
        </div>
      </div>
      {/* Dialog for adding new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleAddEvent}
            className="flex items-center space-x-4"
          >
            {/* Input Box */}
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg flex-grow" // Input takes remaining space
            />

            {/* Add Button */}
            <button
              className="bg-green-500 text-white p-3 rounded-md ml-auto"
              type="submit"
            >
              Add
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditEvent} className="space-y-6">
            {/* Input Box */}
            <input
              type="text"
              placeholder="Event Title"
              value={editedEventTitle}
              onChange={(e) => setEditedEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg w-full"
            />

            {/* Buttons Container */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              {/* Save Changes Button */}
              <button
                className="bg-blue-500 text-white p-3 rounded-md"
                type="submit"
              >
                Save
              </button>

              {/* Delete Event Button */}
              <button
                className="bg-red-500 text-white p-3 rounded-md"
                type="button"
                onClick={() => {
                  if (selectedEvent) {
                    if (
                      window.confirm(
                        `Are you sure you want to delete this event?`
                      )
                    ) {
                      selectedEvent.remove();
                      setIsEditDialogOpen(false);
                      setSelectedEvent(null);
                    }
                  }
                }}
              >
                Delete
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      ;
    </div>
  );
};

export default Calendar;
