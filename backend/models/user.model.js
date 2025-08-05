import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    fullName:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 6,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            red: "User",
            default: []

        }
    ],
    following: [
        {
            type:mongoose.Schema.Types.ObjectId,
            red: "User",
            default: []

        }
    ],
    profileImg:{
        type:String,
        deafult: "",
    },
    coverImg:{
        type: String,
        deafult:"",
    },
    bio:{
        type: String,
        deafult:"",
    },
    link:{
        type: String,
        deafult:"",
    },
    likedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
},
{timestamps: true})

const User = mongoose.model("User", userSchema)

export default User