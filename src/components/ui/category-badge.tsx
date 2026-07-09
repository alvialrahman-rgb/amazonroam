import { clsx } from "clsx";
import type { PlaceCategory } from "@/types";

const categoryConfig: Record<
  PlaceCategory,
  { label: string; emoji: string; color: string }
> = {
  FOOD: { label: "Food", emoji: "🍽️", color: "bg-category-food/10 text-category-food" },
  CULTURE: { label: "Culture", emoji: "🏛️", color: "bg-category-culture/10 text-category-culture" },
  OUTDOORS: { label: "Outdoors", emoji: "🌿", color: "bg-category-outdoors/10 text-category-outdoors" },
  NIGHTLIFE: { label: "Nightlife", emoji: "🍸", color: "bg-category-nightlife/10 text-category-nightlife" },
  WELLNESS: { label: "Wellness", emoji: "🧘", color: "bg-category-wellness/10 text-category-wellness" },
  SHOPPING: { label: "Shopping", emoji: "🛍️", color: "bg-category-shopping/10 text-category-shopping" },
  ENTERTAINMENT: { label: "Entertainment", emoji: "🎭", color: "bg-category-entertainment/10 text-category-entertainment" },
};

export function CategoryBadge({ category }: { category: PlaceCategory }) {
  const config = categoryConfig[category] || categoryConfig.FOOD;

  return (
    <span className={clsx("badge text-[10px]", config.color)}>
      <span className="mr-0.5">{config.emoji}</span>
      {config.label}
    </span>
  );
}
