// Category and subcategory options for classes
export const CATEGORY_OPTIONS = {
  workout: {
    label: 'Workout',
    subcategories: ['Upper Body', 'Lower Body', 'Back', 'Legs', 'Full Body', 'Core', 'Chest', 'Shoulders', 'Arms', 'Glutes'],
  },
  cardio: {
    label: 'Cardio',
    subcategories: ['Running', 'Cycling', 'Jump Rope', 'HIIT', 'Dance', 'Swimming', 'Rowing', 'Elliptical'],
  },
  stretching: {
    label: 'Stretching',
    subcategories: ['Flexibility', 'Mobility', 'Dynamic Stretch', 'Static Stretch', 'Yoga Stretches', 'Recovery'],
  },
  nutrition: {
    label: 'Nutrition',
    subcategories: ['Meal Prep', 'Recipes', 'Nutrition Tips', 'Supplements', 'Diet Plans', 'Hydration'],
  },
  yoga: {
    label: 'Yoga',
    subcategories: ['Hatha Yoga', 'Vinyasa Yoga', 'Power Yoga', 'Yin Yoga', 'Ashtanga Yoga', 'Beginner Yoga'],
  },
  other: {
    label: 'Other',
    subcategories: ['General', 'Tips', 'Motivation', 'Education'],
  },
};

export const getSubcategories = (category) => {
  return CATEGORY_OPTIONS[category]?.subcategories || [];
};
