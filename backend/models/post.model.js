import mongoose from "mongoose"

const transcriptSegmentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    },
    speaker: {
        type: String,
        default: "Speaker"
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 1
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    needsReview: {
        type: Boolean,
        default: false
    }
});

const postSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text:{
        type: String,
    },
    img: {
        type: String
    },
    audioUrl: {
        type: String
    },
    transcript: [transcriptSegmentSchema],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            text: {
                type: String,
                required: true
            },
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
        },
    ],
},
{timestamps: true}
);


const Post = mongoose.model("Post", postSchema);
export default Post;