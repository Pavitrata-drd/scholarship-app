/**
 * Profile utility functions for education level validation and progression tracking
 */

// Education levels in progressive order (from lowest to highest)
const EDUCATION_PROGRESSION = [
  "10th",
  "12th",
  "undergraduate",
  "postgraduate",
  "phd",
] as const;

export type EducationLevel = typeof EDUCATION_PROGRESSION[number];

/**
 * Get the index of education level in progression
 */
export function getEducationLevelIndex(level: string): number {
  return EDUCATION_PROGRESSION.indexOf(level as EducationLevel);
}

/**
 * Check if user is moving forward in education (progressive)
 * Returns: { isForward: boolean, isBackward: boolean, isSame: boolean }
 */
export function getEducationLevelDirection(
  currentLevel: string | null | undefined,
  newLevel: string
): {
  isForward: boolean;
  isBackward: boolean;
  isSame: boolean;
  oldIndex: number;
  newIndex: number;
} {
  if (!currentLevel) {
    return { isForward: true, isBackward: false, isSame: false, oldIndex: -1, newIndex: getEducationLevelIndex(newLevel) };
  }

  const oldIndex = getEducationLevelIndex(currentLevel);
  const newIndex = getEducationLevelIndex(newLevel);

  return {
    isForward: newIndex > oldIndex,
    isBackward: newIndex < oldIndex,
    isSame: newIndex === oldIndex,
    oldIndex,
    newIndex,
  };
}

/**
 * Get human readable education level names
 */
export function getEducationLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    "10th": "10th Standard",
    "12th": "12th Standard",
    undergraduate: "Undergraduate",
    postgraduate: "Postgraduate",
    phd: "PhD",
  };
  return labels[level] || level;
}

/**
 * Get warning message for backward education level change
 */
export function getBackwardWarningMessage(oldLevel: string, newLevel: string): string {
  const oldLabel = getEducationLevelLabel(oldLevel);
  const newLabel = getEducationLevelLabel(newLevel);

  return `⚠️ You're moving backward in education level from ${oldLabel} to ${newLabel}. This may affect your scholarship recommendations. Are you sure you want to continue?`;
}

/**
 * Validate if education level change is allowed
 * Currently, all changes are allowed but we track direction
 */
export function isEducationLevelChangeAllowed(
  currentLevel: string | null | undefined,
  newLevel: string
): boolean {
  return true; // Allow all changes
}
