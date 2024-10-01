const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { put } = require("./scheduleRoutes");

router.post("/slots", scheduleController.addFreeTimeSlot);

router.get("/slots/check", scheduleController.checkTimeSlot);

router.get("/slots", scheduleController.getFreeTimeSlots);

router.delete("/slots/:id", scheduleController.deleteFreeTimeSlot);

router.patch("/slots/:id", scheduleController.updateSlotStatus);

router.get("/slots/pending", scheduleController.getPendingSlots);

router.patch("accept-slot/:id", scheduleController.acceptSlot);

router.get("/count-free", scheduleController.countFreeSlots);
router.get("/count-pending", scheduleController.countWeeklySlots);

router.patch("/updateByDateTime", scheduleController.updateSlotsByDateTime);

router.put("/slots/:id/reschedule", scheduleController.rescheduleSlot);

module.exports = router;
