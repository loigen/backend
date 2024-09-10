const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController"); // Adjust the path as needed

const { uploadQRCode } = require("../middlewares/multer");

// Create a new appointment
router.post("/appointments", appointmentController.createAppointment);

// Get all appointments
router.get("/appointments", appointmentController.getAppointments);

// Get appointment by ID
router.get(
  "/myAppointment/:userId",
  appointmentController.getAppointmentsByUserId
);

// Update appointment
router.put("/appointments/:id", appointmentController.updateAppointment);

// Delete appointment
router.delete("/appointments/:id", appointmentController.deleteAppointment);

// Accept an appointment
router.patch("/accept/:id", appointmentController.acceptAppointment);

// Reject an appointment
router.patch("/reject/:id", appointmentController.rejectAppointment);

// Fetch pending appointments
router.get("/pending", appointmentController.getPendingAppointments);

// Fetch today's appointments
router.get("/today", appointmentController.getTodaysAppointments);

// Fetch weekly's highest appointments
router.get("/highest-weekly", appointmentController.getCurrentWeekAppointments);

// Fetch entire rate of cancellation appointments
router.get("/cancellation-rate", appointmentController.getCancellationRate);

router.get("/completion-rate", appointmentController.getCompletionRate);

// Fetch patient's data appointments
router.get("/data", appointmentController.getAppointmentData);

// Fetch for the chart appointments
router.get("/daily", appointmentController.getDailyAppointmentsForCurrentWeek);

// Fetch for the chart appointments
router.get(
  "/dailyCancel",
  appointmentController.getDailyCancelledAppointmentsForCurrentWeek
);

// Fetch for the chart monthly appointments
router.get(
  "/dailyforMonth",
  appointmentController.getDailyAppointmentsForCurrentMonth
);
router.get("/check-time", appointmentController.checkTimeConflict);
router.get("/get-appointments", appointmentController.getAppointmentsForDate);

// Fetch for the chart yearly appointments
router.get("/yearly", appointmentController.getYearlyAppointments);

// update the qr

router.post(
  "/appointments/update-with-bank-account",
  appointmentController.updateAppointmentWithBankAccount
);

//for QR
router.post("/refund", appointmentController.returnRefund);

module.exports = router;
