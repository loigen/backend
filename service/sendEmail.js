const cron = require("node-cron");
const Appointment = require("../schemas/appointmentSchema");
const { sendAppointmentReminder } = require("../nodemailer");

const checkAppointments = async () => {
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  try {
    const appointments = await Appointment.find({
      date: {
        $lte: twoHoursLater,
        $gt: now,
      },
      status: "accepted",
    });

    appointments.forEach((appointment) => {
      sendReminderEmail(appointment);
    });
  } catch (error) {
    console.error("Error checking appointments:", error);
  }
};

const sendReminderEmail = (appointment) => {
  sendAppointmentReminder(
    appointment.email,
    appointment.firstname,
    appointment.date,
    appointment.time
  )
    .then(() => {
      console.log(`Reminder email sent to ${appointment.email}`);
    })
    .catch((error) => {
      console.error(`Error sending email to ${appointment.email}:`, error);
    });
};

const startAppointmentCheck = () => {
  cron.schedule("*/30 * * * *", () => {
    console.log("Checking for appointments approaching within 2 hours...");
    checkAppointments();
  });
};

module.exports = { startAppointmentCheck };
