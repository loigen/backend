const cron = require("node-cron");
const sgMail = require("@sendgrid/mail");
const Appointment = require("../schemas/appointmentSchema");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  const msg = {
    to: appointment.email,
    from: process.env.EMAIL_FROM,
    subject: `Reminder: Your appointment is approaching`,
    text: `Hi ${appointment.firstname},\n\nThis is a reminder that your appointment is scheduled for ${appointment.date} at ${appointment.time}.`,
    html: `<p>Hi ${appointment.firstname},</p><p>This is a reminder that your appointment is scheduled for <strong>${appointment.date}</strong> at <strong>${appointment.time}</strong>.</p>`,
  };

  sgMail
    .send(msg)
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
