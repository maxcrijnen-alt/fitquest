export const workoutSplits = [
  "Chest + triceps",
  "Back + biceps",
  "Legs",
] as const;

export const runningLevels = [
  "cannot run 5K yet",
  "can run 5K slowly",
  "can run 5K comfortably",
  "can run 5K fast",
] as const;

export const gymLevels = ["beginner", "intermediate", "advanced"] as const;

export const mainGoals = [
  "build muscle",
  "improve running endurance",
  "both",
] as const;

export type WorkoutSplit = (typeof workoutSplits)[number];
export type RunningLevel = (typeof runningLevels)[number];
export type GymLevel = (typeof gymLevels)[number];
export type MainGoal = (typeof mainGoals)[number];

export type Profile = {
  id: string;
  email: string;
  name: string;
  nickname: string;
  gym_level: GymLevel;
  running_level: RunningLevel;
  main_goal: MainGoal;
  age: number;
  body_weight_kg: number;
  five_k_goal: string;
  calorie_target: number;
  protein_target: number;
  water_target: number;
  alcohol_goal: boolean;
  workout_split: WorkoutSplit[];
  xp: number;
  level: number;
  coins: number;
  current_streak: number;
  created_at: string;
};

export type PartnerConnection = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "declined";
  invite_code: string;
  created_at: string;
};

export type StrengthWorkout = {
  id: string;
  user_id: string;
  workout_date: string;
  split_type: WorkoutSplit;
  notes: string;
  total_volume: number;
  created_at: string;
};

export type StrengthExercise = {
  id: string;
  workout_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  is_bodyweight: boolean;
  estimated_1rm: number;
  notes: string;
};

export type RunningWorkout = {
  id: string;
  user_id: string;
  run_date: string;
  distance_km: number;
  time_minutes: number;
  pace_per_km: number;
  notes: string;
  created_at: string;
};

export type DailyLifestyleLog = {
  id: string;
  user_id: string;
  log_date: string;
  calories: number;
  protein: number;
  water_liters: number;
  alcohol_free: boolean;
  created_at: string;
};

export type TaskCategory =
  | "strength"
  | "running"
  | "protein"
  | "water"
  | "calories"
  | "alcohol"
  | "mobility";

export type Task = {
  id: string;
  user_id: string;
  task_date: string;
  title: string;
  description: string;
  category: TaskCategory;
  target_value: number | null;
  difficulty: "easy" | "steady" | "hard";
  xp_reward: number;
  coin_reward: number;
  completed: boolean;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type Reward = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  coin_cost: number;
  created_at: string;
};

export type RewardPurchase = {
  id: string;
  user_id: string;
  reward_id: string;
  purchased_at: string;
};

export type XpTransaction = {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
};

export type Encouragement = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
};

export type FitQuestState = {
  currentUserId: string;
  profiles: Profile[];
  partnerConnections: PartnerConnection[];
  strengthWorkouts: StrengthWorkout[];
  strengthExercises: StrengthExercise[];
  runningWorkouts: RunningWorkout[];
  dailyLifestyleLogs: DailyLifestyleLog[];
  tasks: Task[];
  badges: Badge[];
  userBadges: UserBadge[];
  rewards: Reward[];
  rewardPurchases: RewardPurchase[];
  xpTransactions: XpTransaction[];
  encouragements: Encouragement[];
};

export type ExerciseRecord = {
  exerciseName: string;
  highestWeight: number;
  highestEstimatedOneRepMax: number;
  mostBodyweightReps: number;
};

export type PersonalRecords = {
  exercises: ExerciseRecord[];
  highestWorkoutVolume: number;
  bestFiveKTime: number | null;
};

export type PartnerSummary = {
  profile: Profile;
  xp: number;
  level: number;
  badges: Badge[];
  streak: number;
  weeklyCompletion: number;
  weeklyXp: number;
  encouragements: string[];
  milestones: string[];
};

export type RelativeStrengthScore = {
  userId: string;
  name: string;
  age: number;
  bodyWeightKg: number;
  weightClass: string;
  relativeStrength: number;
  ageAdjustedStrength: number;
  ageMultiplier: number;
  liftCount: number;
};

export type CoachingSummary = {
  weeklyFeedback: string[];
  strengthSuggestion: string;
  runningSuggestion: string;
  habitSuggestion: string;
  goalAdjustment: string;
};
