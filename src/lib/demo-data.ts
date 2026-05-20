import { dateDaysAgo, estimatedOneRepMax, generateDailyTasks, todayISO } from "@/lib/fitness";
import {
  Badge,
  DailyLifestyleLog,
  Encouragement,
  FitQuestState,
  PartnerConnection,
  Profile,
  Reward,
  StrengthExercise,
  StrengthWorkout,
  UserBadge,
  XpTransaction,
} from "@/lib/types";

export const advancedUserId = "11111111-1111-4111-8111-111111111111";
export const fatherUserId = "22222222-2222-4222-8222-222222222222";

const createdAt = "2026-05-01T08:00:00.000Z";

const profiles: Profile[] = [
  {
    id: advancedUserId,
    email: "max@example.com",
    name: "Max",
    nickname: "Advanced",
    gym_level: "advanced",
    running_level: "can run 5K slowly",
    main_goal: "both",
    age: 24,
    body_weight_kg: 75,
    five_k_goal: "Run a controlled sub-30 minute 5K",
    calorie_target: 2700,
    protein_target: 180,
    water_target: 3,
    alcohol_goal: true,
    workout_split: ["Chest + triceps", "Back + biceps", "Legs"],
    xp: 0,
    level: 1,
    coins: 0,
    current_streak: 0,
    created_at: createdAt,
  },
  {
    id: fatherUserId,
    email: "father@example.com",
    name: "Peter",
    nickname: "Beginner",
    gym_level: "beginner",
    running_level: "cannot run 5K yet",
    main_goal: "build muscle",
    age: 60,
    body_weight_kg: 85,
    five_k_goal: "Complete a relaxed 5K without stopping",
    calorie_target: 2300,
    protein_target: 130,
    water_target: 2.2,
    alcohol_goal: true,
    workout_split: ["Chest + triceps", "Back + biceps", "Legs"],
    xp: 0,
    level: 1,
    coins: 0,
    current_streak: 0,
    created_at: createdAt,
  },
];

const partnerConnections: PartnerConnection[] = [
  {
    id: "partner_001",
    requester_id: advancedUserId,
    receiver_id: fatherUserId,
    status: "accepted",
    invite_code: "FIT-DAD-2026",
    created_at: "2026-05-02T08:00:00.000Z",
  },
];

const strengthWorkouts: StrengthWorkout[] = [
  {
    id: "sw_001",
    user_id: advancedUserId,
    workout_date: dateDaysAgo(6),
    split_type: "Chest + triceps",
    notes: "Solid pressing day.",
    total_volume: 8450,
    created_at: `${dateDaysAgo(6)}T18:00:00.000Z`,
  },
  {
    id: "sw_002",
    user_id: advancedUserId,
    workout_date: dateDaysAgo(4),
    split_type: "Back + biceps",
    notes: "Rows felt strong.",
    total_volume: 9120,
    created_at: `${dateDaysAgo(4)}T18:00:00.000Z`,
  },
  {
    id: "sw_003",
    user_id: advancedUserId,
    workout_date: dateDaysAgo(2),
    split_type: "Legs",
    notes: "Conservative top sets.",
    total_volume: 10440,
    created_at: `${dateDaysAgo(2)}T18:00:00.000Z`,
  },
  {
    id: "sw_004",
    user_id: fatherUserId,
    workout_date: dateDaysAgo(5),
    split_type: "Chest + triceps",
    notes: "Technique focus.",
    total_volume: 1380,
    created_at: `${dateDaysAgo(5)}T10:00:00.000Z`,
  },
  {
    id: "sw_005",
    user_id: fatherUserId,
    workout_date: dateDaysAgo(2),
    split_type: "Back + biceps",
    notes: "Kept it easy.",
    total_volume: 1660,
    created_at: `${dateDaysAgo(2)}T10:00:00.000Z`,
  },
];

const strengthExercises: StrengthExercise[] = [
  exercise("se_001", "sw_001", "Bench press", 4, 6, 85, false, "Last set smooth."),
  exercise("se_002", "sw_001", "Incline dumbbell press", 3, 10, 30, false, ""),
  exercise("se_003", "sw_001", "Dips", 3, 10, 0, true, "Bodyweight."),
  exercise("se_004", "sw_002", "Barbell row", 4, 8, 80, false, ""),
  exercise("se_005", "sw_002", "Lat pulldown", 4, 10, 72, false, ""),
  exercise("se_006", "sw_002", "Dumbbell curl", 3, 12, 16, false, ""),
  exercise("se_007", "sw_003", "Back squat", 4, 6, 105, false, ""),
  exercise("se_008", "sw_003", "Romanian deadlift", 3, 8, 95, false, ""),
  exercise("se_009", "sw_003", "Leg press", 3, 12, 170, false, ""),
  exercise("se_010", "sw_004", "Machine chest press", 3, 10, 25, false, "Easy pace."),
  exercise("se_011", "sw_004", "Cable triceps pressdown", 3, 12, 15, false, ""),
  exercise("se_012", "sw_005", "Seated row", 3, 10, 30, false, ""),
  exercise("se_013", "sw_005", "Lat pulldown", 3, 10, 28, false, ""),
  exercise("se_014", "sw_005", "Assisted chin-up", 3, 6, 0, true, "Slow reps."),
];

const runningWorkouts = [
  {
    id: "run_001",
    user_id: advancedUserId,
    run_date: dateDaysAgo(8),
    distance_km: 5,
    time_minutes: 34,
    pace_per_km: 6.8,
    notes: "Easy 5K.",
    created_at: `${dateDaysAgo(8)}T17:00:00.000Z`,
  },
  {
    id: "run_002",
    user_id: advancedUserId,
    run_date: dateDaysAgo(3),
    distance_km: 5.2,
    time_minutes: 34.2,
    pace_per_km: 6.58,
    notes: "Slightly faster finish.",
    created_at: `${dateDaysAgo(3)}T17:00:00.000Z`,
  },
  {
    id: "run_003",
    user_id: fatherUserId,
    run_date: dateDaysAgo(7),
    distance_km: 1.8,
    time_minutes: 18,
    pace_per_km: 10,
    notes: "Run/walk intervals.",
    created_at: `${dateDaysAgo(7)}T09:00:00.000Z`,
  },
  {
    id: "run_004",
    user_id: fatherUserId,
    run_date: dateDaysAgo(3),
    distance_km: 2.2,
    time_minutes: 21,
    pace_per_km: 9.55,
    notes: "More continuous jogging.",
    created_at: `${dateDaysAgo(3)}T09:00:00.000Z`,
  },
];

const dailyLifestyleLogs: DailyLifestyleLog[] = [
  lifestyle("life_001", advancedUserId, 6, 2680, 182, 3.1, true),
  lifestyle("life_002", advancedUserId, 5, 2750, 175, 2.8, true),
  lifestyle("life_003", advancedUserId, 4, 2635, 188, 3.3, true),
  lifestyle("life_004", advancedUserId, 3, 2710, 181, 3, true),
  lifestyle("life_005", advancedUserId, 2, 2840, 179, 2.6, false),
  lifestyle("life_006", advancedUserId, 1, 2705, 185, 3.2, true),
  lifestyle("life_007", fatherUserId, 6, 2260, 118, 2, true),
  lifestyle("life_008", fatherUserId, 5, 2320, 136, 2.3, true),
  lifestyle("life_009", fatherUserId, 4, 2400, 126, 1.9, false),
  lifestyle("life_010", fatherUserId, 3, 2290, 132, 2.4, true),
  lifestyle("life_011", fatherUserId, 2, 2215, 137, 2.2, true),
  lifestyle("life_012", fatherUserId, 1, 2310, 128, 2.5, true),
];

export const badges: Badge[] = [
  badge("badge_001", "First workout logged", "Logged the first strength session.", "Dumbbell", "first_workout"),
  badge("badge_002", "First run logged", "Logged the first run.", "Footprints", "first_run"),
  badge("badge_003", "First 5K completed", "Completed a 5K run.", "Flag", "first_5k"),
  badge("badge_004", "7-day streak", "Kept a seven day consistency streak.", "Flame", "streak_7"),
  badge("badge_005", "30-day streak", "Kept a 30 day consistency streak.", "Flame", "streak_30"),
  badge("badge_006", "First strength PR", "Set the first strength personal record.", "Trophy", "first_strength_pr"),
  badge("badge_007", "Protein goal 7 days", "Hit protein seven days in a row.", "BadgeCheck", "protein_7"),
  badge("badge_008", "Alcohol-free week", "Logged seven alcohol-free days.", "ShieldCheck", "alcohol_free_week"),
  badge("badge_009", "Level 5 reached", "Reached level 5.", "Sparkles", "level_5"),
  badge("badge_010", "Level 10 reached", "Reached level 10.", "Sparkles", "level_10"),
  badge("badge_011", "Father-son weekly challenge", "Completed a shared weekly consistency challenge.", "Users", "family_challenge"),
  badge("badge_012", "Consistency champion", "Completed all daily tasks multiple days in a row.", "Medal", "consistency_champion"),
];

const userBadges: UserBadge[] = [];

const rewards: Reward[] = [
  reward("reward_001", advancedUserId, "New gym item", "Put coins toward a useful training accessory.", 160),
  reward("reward_002", advancedUserId, "Coffee together", "Plan a coffee after a strong week.", 80),
  reward("reward_003", advancedUserId, "Healthy dinner together", "Cook or go out for a high-protein dinner.", 140),
  reward("reward_004", fatherUserId, "Movie night", "Pick a movie after completing the weekly challenge.", 90),
  reward("reward_005", fatherUserId, "Rest day treat", "A recovery day with no guilt.", 70),
];

const xpTransactions: XpTransaction[] = [];

const encouragements: Encouragement[] = [
  {
    id: "enc_001",
    sender_id: advancedUserId,
    receiver_id: fatherUserId,
    message: "Proud of you!",
    created_at: `${dateDaysAgo(2)}T20:00:00.000Z`,
  },
  {
    id: "enc_002",
    sender_id: fatherUserId,
    receiver_id: advancedUserId,
    message: "Strong week!",
    created_at: `${dateDaysAgo(1)}T20:00:00.000Z`,
  },
];

export function getDemoState(): FitQuestState {
  const baseState: FitQuestState = {
    currentUserId: advancedUserId,
    profiles,
    partnerConnections,
    strengthWorkouts,
    strengthExercises,
    runningWorkouts,
    dailyLifestyleLogs,
    tasks: [],
    badges,
    userBadges,
    rewards,
    rewardPurchases: [],
    xpTransactions,
    encouragements,
  };

  return {
    ...baseState,
    tasks: [
      ...generateDailyTasks(profiles[0], baseState, todayISO()).map((task, index) => ({
        ...task,
        id: `task_max_${index}`,
        completed: false,
      })),
      ...generateDailyTasks(profiles[1], baseState, todayISO()).map((task, index) => ({
        ...task,
        id: `task_dad_${index}`,
        completed: false,
      })),
    ],
  };
}

function exercise(
  id: string,
  workoutId: string,
  name: string,
  sets: number,
  reps: number,
  weight: number,
  isBodyweight: boolean,
  notes: string,
): StrengthExercise {
  return {
    id,
    workout_id: workoutId,
    exercise_name: name,
    sets,
    reps,
    weight,
    is_bodyweight: isBodyweight,
    estimated_1rm: isBodyweight ? 0 : estimatedOneRepMax(weight, reps),
    notes,
  };
}

function lifestyle(
  id: string,
  userId: string,
  daysAgo: number,
  calories: number,
  protein: number,
  waterLiters: number,
  alcoholFree: boolean,
): DailyLifestyleLog {
  return {
    id,
    user_id: userId,
    log_date: dateDaysAgo(daysAgo),
    calories,
    protein,
    water_liters: waterLiters,
    alcohol_free: alcoholFree,
    created_at: `${dateDaysAgo(daysAgo)}T21:00:00.000Z`,
  };
}

function badge(id: string, name: string, description: string, icon: string, conditionType: string): Badge {
  return {
    id,
    name,
    description,
    icon,
    condition_type: conditionType,
  };
}

function reward(id: string, userId: string, title: string, description: string, coinCost: number): Reward {
  return {
    id,
    user_id: userId,
    title,
    description,
    coin_cost: coinCost,
    created_at: createdAt,
  };
}
