const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    TotalPayment: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
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
      required: false, // Optional field
    },
    meetLink: {
      type: String,
      required: false, // Optional field
    },
    meetPlace: {
      type: String,
      required: false, // Optional field
    },
    sex: {
      type: String,
      required: true,
    },
    refundReceipt: {
      type: String,
      required: false, // Optional field
    },
    qrCode: {
      type: String,
      required: false, // Optional field
    },
    note: {
      type: String,
      default: "",
    },
    primaryComplaint: {
      type: String,
      required: false, // Optional field
    },
    historyOfIntervention: {
      type: String,
      required: false, // Optional field
    },
    briefDetails: {
      type: String,
      required: false, // Optional field
    },
    consultationMethod: {
      type: String,
      required: false, // Optional field
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ date: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
