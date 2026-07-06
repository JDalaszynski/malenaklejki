import { NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/blog";

export async function GET() {
  try {
    const posts = await getBlogPosts();
    // Return only necessary fields for the latest 6 posts
    const latestPosts = posts.slice(0, 6).map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      readingTime: post.readingTime,
      image: post.image,
      tags: post.tags,
    }));
    
    return NextResponse.json(latestPosts);
  } catch (error) {
    console.error("Error fetching latest blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}
