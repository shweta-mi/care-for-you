import { createId } from "./storageService";

export const emptyAppointmentForm = {
  doctorName: "",
  hospital: "",
  department: "",
  reason: "",
  date: "",
  time: "",
  notes: "",
};

export const AppointmentService = {
  forCarePair(appointments, caregiverId, receiverId) {
    return appointments
      .filter(
        (item) =>
          item.caregiverId === caregiverId && item.receiverId === receiverId,
      )
      .sort((a, b) =>
        `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
      );
  },

  upcoming(appointments, today) {
    return appointments.filter((item) => !item.completed && item.date >= today);
  },

  completed(appointments, today) {
    return appointments.filter((item) => item.completed || item.date < today);
  },

  addAppointment(items, form, caregiverId, receiverId) {
    return [
      ...items,
      {
        id: createId(),
        caregiverId,
        receiverId,
        ...form,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];
  },

  updateAppointment(items, appointmentId, form) {
    return items.map((item) =>
      item.id === appointmentId ? { ...item, ...form } : item,
    );
  },

  deleteAppointment(items, appointmentId) {
    return items.filter((item) => item.id !== appointmentId);
  },

  completeAppointment(items, appointmentId) {
    return items.map((item) =>
      item.id === appointmentId
        ? { ...item, completed: true, completedAt: new Date().toISOString() }
        : item,
    );
  },
};
