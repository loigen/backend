const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    TotalPayment: {
      type: Number,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    requestedTime: {
      type: String,
      required: false,
    },
    requestedDate: {
      type: String,
      required: false,
    },
    appointmentType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "canceled",
        "completed",
        "requested",
        "refunded",
        "rescheduled",
        "ReqRescheduled",
      ],
      default: "pending",
      required: true,
    },
    previousStatus: {
      type: String,
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    meetLink: {
      type: String,
      required: false,
    },
    meetPlace: {
      type: String,
      required: false,
    },
    sex: {
      type: String,
      required: true,
    },
    refundReceipt: {
      type: String,
      required: false,
    },
    qrCode: {
      type: String,
      required: false,
    },
    note: {
      type: String,
      default: "",
    },
    primaryComplaint: {
      type: String,
      required: false,
    },
    historyOfIntervention: {
      type: String,
      required: false,
    },
    briefDetails: {
      type: String,
      required: false,
    },
    consultationMethod: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ date: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
