const cron = require("node-cron");
const Appointment = require("../schemas/appointmentSchema");
const { sendAppointmentReminder } = require("../nodemailer");

const checkAppointments = async () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour later

  try {
    // Find appointments scheduled between now and one hour from now
    const appointments = await Appointment.find({
      date: {
        $lte: oneHourLater,
        $gt: now,
      },
      status: "accepted",
    });

    // Send a reminder email for each appointment found
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

// Schedule the job to run every 30 minutes
const startAppointmentCheck = () => {
  cron.schedule("*/30 * * * *", () => {
    console.log("Checking for appointments approaching within 1 hour...");
    checkAppointments();
  });
};

module.exports = { startAppointmentCheck };
