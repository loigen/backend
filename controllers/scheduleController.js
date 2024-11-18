const Schedule = require("../schemas/Schedule");
const moment = require("moment");

exports.getFreeTimeSlots = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const freeSlots = await Schedule.find({
      status: "free",
      date: { $gte: startOfDay },
    }).sort({
      date: 1,
      time: 1,
    });

    res.json(freeSlots);
  } catch (error) {
    console.error("Error fetching free time slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addFreeTimeSlot = async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    const existingSlot = await Schedule.findOne({
      date: new Date(date),
      time,
      status: "free",
    });

    if (existingSlot) {
      return res.status(400).json({ message: "Time slot already exists" });
    }

    const freeSlot = new Schedule({
      date: new Date(date),
      time,
      status: "free",
    });

    await freeSlot.save();
    res.status(201).json(freeSlot);
  } catch (error) {
    console.error("Error adding free time slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteFreeTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndDelete(id);
    res.status(200).json({ message: "Time slot deleted" });
  } catch (error) {
    console.error("Error deleting time slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkTimeSlot = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    const slotExists = await Schedule.findOne({
      date: new Date(date),
      time,
      status: "free",
    });

    res.json({ exists: !!slotExists });
  } catch (error) {
    console.error("Error checking time slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Update the Time Slot
exports.updateSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating slot with ID: ${id} to status: ${status}`);

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedSlot = await Schedule.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json(updatedSlot);
  } catch (error) {
    console.error("Error updating slot status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingSlots = async (req, res) => {
  try {
    const pendingSlots = await Schedule.find({ status: "pending" }).sort({
      date: 1,
      time: 1,
    });
    res.json(pendingSlots);
  } catch (error) {
    console.error("Error fetching pending slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptSlot = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Accepting slot with ID: ${id}`);

    const updatedSlot = await Schedule.findByIdAndUpdate(
      id,
      { status: "accepted" },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json(updatedSlot);
  } catch (error) {
    console.error("Error accepting slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.countFreeSlots = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("isoWeek").toDate();
    const endOfWeek = moment().endOf("isoWeek").toDate();

    const freeSlotsCount = await Schedule.countDocuments({
      status: "free",
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    res.json({ count: freeSlotsCount });
  } catch (error) {
    console.error("Error counting free slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.countWeeklySlots = async (req, res) => {
  try {
    // Set the start and end of the week (Monday to Sunday)
    const startOfWeek = moment().startOf("isoWeek").toDate(); // Start of the week (Monday)
    const endOfWeek = moment().endOf("isoWeek").toDate(); // End of the week (Sunday)

    const weeklySlotsCount = await Schedule.countDocuments({
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    res.json({ count: weeklySlotsCount });
  } catch (error) {
    console.error("Error counting weekly slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSlotsByDateTime = async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    const updatedSlots = await Schedule.updateMany(
      { date: new Date(date), time },
      { status: "free" }
    );

    res.json({ message: `${updatedSlots.nModified} slots updated to free` });
  } catch (error) {
    console.error("Error updating slots by date and time:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.rescheduleSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;

    if (!newDate || !newTime) {
      return res
        .status(400)
        .json({ message: "New date and time are required" });
    }

    const existingSlot = await Schedule.findOne({
      date: new Date(newDate),
      time: newTime,
      status: "free",
    });

    if (existingSlot) {
      return res
        .status(400)
        .json({ message: "Time slot already exists at the new date and time" });
    }

    const rescheduledSlot = await Schedule.findByIdAndUpdate(
      id,
      { date: new Date(newDate), time: newTime },
      { new: true }
    );

    if (!rescheduledSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json({ message: "Time slot rescheduled", slot: rescheduledSlot });
  } catch (error) {
    console.error("Error rescheduling slot:", error);
    res.status(500).json({ message: "Server error" });
  }
};
