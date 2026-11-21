
import type { UILayoutMode } from "../types/ui-schema";

type AdaptationInput = {
  autoAdaptationEnabled: boolean;
  isHighFriction: boolean;
};

export function getRecommendedLayout({
  autoAdaptationEnabled,
  isHighFriction,
}: AdaptationInput): UILayoutMode {
  if (!autoAdaptationEnabled) {
    return "standard";
  }

  if (isHighFriction) {
    return "simplified";
  }

  return "standard";
}
