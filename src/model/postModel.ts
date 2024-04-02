import mongoose, { ObjectId }  from 'mongoose';

export type PostType ={
    user: ObjectId,
    title: string,
    description: string,
    photos: string[],
    // _id? : Types.ObjectId | SchemaDefinitionProperty<ObjectId, PostType>,
}
const PostModel = new mongoose.Schema<PostType>({
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    title: {
        type : String,
        required: true
    },
    description: {
        type : String
    },
    photos: {
        type: [String],
        required: true
    }
},
{ timestamps: true, versionKey: false }
);

const PostType = mongoose.model<PostType>("Post", PostModel);
export default PostType