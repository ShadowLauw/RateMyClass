import axios from "axios";
import { action, mutation } from "./_generated/server";
import { load } from "cheerio";
import { api } from "./_generated/api";
import { v } from "convex/values";
 
export const courseSend = mutation({
    args: { 
        title: v.string(),
        code: v.string(),
        block: v.string(),
        teachers: v.string(),
        language: v.string(),
        semester: v.string(),
        examType: v.string(),
        credits: v.string(), 
    },
    handler: async (ctx, args) => {
      await ctx.db.insert("classes", args);
    },
  });

export const scraper = action({
    args: {},
    handler: async (ctx, args) => {
        const data = (await axios.get("https://edu.epfl.ch/studyplan/en/bachelor/computer-science/")).data;
        const $ = load(data)

        for (const bl of $(".study-plan")) {
            const block = $(bl).find("h4").text();
            if (block !== "Transverse block HSS") {
                for (const cours of $(bl).find(".line")) {
                    const courseSelect = $(cours);
                    const title = courseSelect.find(".cours-name a").text();
                    const code = courseSelect.find(".cours-info").text().split(" ")[0];
                    const teachers = courseSelect.find(".enseignement-name a").map(function() {return $(this).text()}).get().join(",");
                    const language = courseSelect.find(".langue abbr").text();
                    const semester = courseSelect.find(".schedule-text:not(.no-course)").parent().attr("data-title");
                    if (semester === undefined)
                        throw new Error("Semester is undefined for course " + title)
                    const examType = courseSelect.find(".exam-text span").text();
                    const credits = courseSelect.find(".credit-time").text();

                    await ctx.runMutation(api.courseDataScraper.courseSend, {
                        title,
                        code,
                        block,
                        teachers,
                        language,
                        semester,
                        examType,
                        credits,
                    });
                }
            }
        }
    },
  });

