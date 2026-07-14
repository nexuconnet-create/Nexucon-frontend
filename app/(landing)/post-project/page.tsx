import React from "react";
import PostProjectHero from "./components/PostProjectHero";
import PostProjectConfidence from "./components/PostProjectConfidence";
import PostProjectSteps from "./components/PostProjectSteps";
import PostProjectCategories from "./components/PostProjectCategories";
import PostProjectCta from "./components/PostProjectCta";

export const metadata = {
  title: "Post a Project | Nexucon",
  description: "Find the right professionals and contractors for your next build."
};

export default function PostProjectPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <PostProjectHero />
      <PostProjectConfidence />
      <PostProjectSteps />
      <PostProjectCategories />
      <PostProjectCta />
    </div>
  );
}
