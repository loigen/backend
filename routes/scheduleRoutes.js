const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { patch } = require("./scheduleRoutes");

router.post("/slots", scheduleController.addFreeTimeSlot);

router.get("/slots/check", scheduleController.checkTimeSlot);

router.get("/slots", scheduleController.getFreeTimeSlots);

router.delete("/slots/:id", scheduleController.deleteFreeTimeSlot);

router.patch("/slots/:id", scheduleController.updateSlotStatus);

router.get("/slots/pending", scheduleController.getPendingSlots); // Add this line

router.patch("accept-slot/:id", scheduleController.acceptSlot);

router.get("/count-free", scheduleController.countFreeSlots);
router.get("/count-pending", scheduleController.countPendingSlots);

router.patch("/updateByDateTime", scheduleController.updateSlotsByDateTime);
module.exports = router;
