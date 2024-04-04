// import connectDB from "./db";
import { ObjectId, Types } from "mongoose";
import Post from "../model/postModel";
import { PostType } from "../model/postModel";

// Define helper functions to interact with the database
const postHelper = {
  // Data find
  find: async (
    query?: PostType,
    select?: string,
    sort: string = "createdAt"
  ) => {
    try {
      let queryBuilder = Post.find(query);

      if (select) {
        queryBuilder = queryBuilder.select(select);
      }
      if (sort) {
        queryBuilder = queryBuilder.sort(sort);
      }

      const post = await queryBuilder.exec();
      return post;
    } catch (error) {
      console.error("Error retrieving post:", error);
      throw error;
    }
  },

  // FindOne
  findOne: async (query?: { _id: Types.ObjectId }, select?: string) => {
    try {
      let queryBuilder = Post.findOne(query);

      if (select) {
        queryBuilder = queryBuilder.select(select);
      }

      const post = await queryBuilder.exec();

      return post;
    } catch (error) {
      console.error("Error retrieving post:", error);
      throw error;
    }
  },

  insertOne: async (data: {
    title?: string;
    description?: string;
    photos: { url: string; type: string }[];
    mention: string[];
  }) => {
    try {
      const result = await Post.create(data);
      return result;
    } catch (error) {
      console.error("Error adding post:", error);
      throw error;
    }
  },

  updateMany: async (
    query: { _id?: ObjectId; userId?: ObjectId },
    data: {
      title?: string;
      description?: string;
      photos?: { url: string; type: string }[];
    },
    option: object
  ) => {
    try {
      const result = await Post.updateMany(query, data, option);
      // const result = await mongoose.connection.collection(collectionName).updateMany(query, data, option);
      return result;
    } catch (error) {
      console.error("Error updates post:", error);
      throw error;
    }
  },

  updateOne: async (
    query: { _id?: string },
    data: {
      title?: string;
      description?: string;
      photos?: { url: string; type: string }[];
    }
  ) => {
    try {
      const result = await Post.updateOne(query, data, { new: true });
      return result;
    } catch (error) {
      console.error("Error update post:", error);
      throw error;
    }
  },

  delete: async (query: object) => {
    try {
      const result = await Post.deleteOne(query, { new: true });
      return result;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  getAllPost: async () => {
    try {
      const post = await Post.aggregate([
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "postId",
            as: "like",
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "postId",
            as: "comment",
          },
        },
        {
          $addFields: {
            like: {
              $size: "$like",
            },
            comment: {
              $size: "$comment",
            },
          },
        },
      ]);
      return post;
    } catch (error) {
      console.log("Error retrieving post:", error);
    }
  },
};

export default postHelper;