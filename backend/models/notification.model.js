import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
    },
    type:{
        type: String,
        required: true,
        enum: ["follow", "like", "repost", "comment"],
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    read: {
        type:Boolean,
        default: false,
    },
}
,
{ timestamps: true}
);

// Index for faster queries
notificationSchema.index({ to: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;