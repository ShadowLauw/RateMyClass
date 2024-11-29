import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    classes: defineTable({
      title: v.string(),
      code: v.string(),
      block: v.string(),
      teachers: v.string(),
      language: v.string(),
      semester: v.string(),
      examType: v.string(),
      credits: v.string(),
    }),
  });