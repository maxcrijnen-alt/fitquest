import {
  Badge,
  CoachingSummary,
  DailyLifestyleLog,
  ExerciseRecord,
  FitQuestState,
  PartnerSummary,
  PersonalRecords,
  Profile,
  RelativeStrengthScore,
  RunningWorkout,
  StrengthExercise,
  StrengthWorkout,
  Task,
  WorkoutSplit,
} from "@/lib/types";

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function timestampNow() {
  return new Date().toISOString();
}

export function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 500) + 1);
}

export function xpIntoCurrentLevel(xp: number) {
  return xp % 500;
}

export function estimatedOneRepMax(weight: number, reps: number) {
  return Number((weight * (1 + reps / 30)).toFixed(1));
}

export function calculateWorkoutVolume(exercises: StrengthExercise[]) {
  return exercises.reduce((total, exercise) => {
    if (exercise.is_bodyweight) return total;
    return total + exercise.sets * exercise.reps * exercise.weight;
  }, 0);
}

export function calculatePace(distanceKm: number, timeMinutes: number) {
  if (!distanceKm || !timeMinutes) return 0;
  return Number((timeMinutes / distanceKm).toFixed(2));
}

export function formatPace(pace: number) {
  if (!pace) return "0:00";
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
}

export function formatDuration(minutes: number) {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function isWithinLastDays(dateString: string, days: number) {
  const then = new Date(`${dateString}T00:00:00`);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return then >= cutoff;
}

export function getProfile(state: FitQuestState, userId = state.currentUserId) {
  return state.profiles.find((profile) => profile.id === userId) ?? state.profiles[0];
}

export function getStrengthWorkouts(state: FitQuestState, userId: string) {
  return state.strengthWorkouts
    .filter((workout) => workout.user_id === userId)
    .sort((a, b) => a.workout_date.localeCompare(b.workout_date));
}

export function getWorkoutExercises(state: FitQuestState, workoutId: string) {
  return state.strengthExercises.filter((exercise) => exercise.workout_id === workoutId);
}

export function getRuns(state: FitQuestState, userId: string) {
  return state.runningWorkouts
    .filter((run) => run.user_id === userId)
    .sort((a, b) => a.run_date.localeCompare(b.run_date));
}

export function getLifestyleLogs(state: FitQuestState, userId: string) {
  return state.dailyLifestyleLogs
    .filter((log) => log.user_id === userId)
    .sort((a, b) => a.log_date.localeCompare(b.log_date));
}

export function calculatePersonalRecords(
  workouts: StrengthWorkout[],
  exercises: StrengthExercise[],
  runs: RunningWorkout[],
): PersonalRecords {
  const exerciseMap = new Map<string, ExerciseRecord>();

  exercises.forEach((exercise) => {
    const key = exercise.exercise_name.trim().toLowerCase();
    const existing =
      exerciseMap.get(key) ??
      ({
        exerciseName: exercise.exercise_name,
        highestWeight: 0,
        highestEstimatedOneRepMax: 0,
        mostBodyweightReps: 0,
      } satisfies ExerciseRecord);

    existing.highestWeight = Math.max(existing.highestWeight, exercise.weight);
    existing.highestEstimatedOneRepMax = Math.max(
      existing.highestEstimatedOneRepMax,
      exercise.estimated_1rm,
    );
    if (exercise.is_bodyweight) {
      existing.mostBodyweightReps = Math.max(existing.mostBodyweightReps, exercise.reps);
    }
    exerciseMap.set(key, existing);
  });

  const bestFiveKTime =
    runs
      .filter((run) => run.distance_km >= 5)
      .map((run) => (run.time_minutes / run.distance_km) * 5)
      .sort((a, b) => a - b)[0] ?? null;

  return {
    exercises: Array.from(exerciseMap.values()).sort(
      (a, b) => b.highestEstimatedOneRepMax - a.highestEstimatedOneRepMax,
    ),
    highestWorkoutVolume: Math.max(0, ...workouts.map((workout) => workout.total_volume)),
    bestFiveKTime: bestFiveKTime ? Number(bestFiveKTime.toFixed(1)) : null,
  };
}

export function weeklyCompletion(tasks: Task[], userId: string) {
  const recentTasks = tasks.filter(
    (task) => task.user_id === userId && isWithinLastDays(task.task_date, 6),
  );
  if (!recentTasks.length) return 0;
  const completed = recentTasks.filter((task) => task.completed).length;
  return Math.round((completed / recentTasks.length) * 100);
}

export function weeklyXp(state: FitQuestState, userId: string) {
  return state.xpTransactions
    .filter((transaction) => transaction.user_id === userId && isWithinLastDays(transaction.created_at, 6))
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function generateInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const parts = Array.from({ length: 2 }, () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(""),
  );
  return `FIT-${parts.join("-")}`;
}

export function getEarnedBadges(state: FitQuestState, userId: string) {
  const earnedIds = new Set(
    state.userBadges.filter((badge) => badge.user_id === userId).map((badge) => badge.badge_id),
  );
  return state.badges.filter((badge) => earnedIds.has(badge.id));
}

export function generateDailyTasks(profile: Profile, state: FitQuestState, date = todayISO()) {
  const runs = getRuns(state, profile.id);
  const workouts = getStrengthWorkouts(state, profile.id);
  const recentRun = runs.at(-1);
  const recentWorkout = workouts.at(-1);
  const lastMonthWorkouts = workouts.filter((workout) => isWithinLastDays(workout.workout_date, 27));
  const lastMonthRuns = runs.filter((run) => isWithinLastDays(run.run_date, 27));
  const averageRecentVolume = lastMonthWorkouts.length
    ? lastMonthWorkouts.reduce((total, workout) => total + workout.total_volume, 0) / lastMonthWorkouts.length
    : 0;
  const longestRecentRun = Math.max(0, ...lastMonthRuns.map((run) => run.distance_km));
  const levelDifficulty = profile.gym_level === "advanced" ? "hard" : profile.gym_level === "intermediate" ? "steady" : "easy";
  const strengthTarget = recentWorkout
    ? Math.round(
        Math.max(recentWorkout.total_volume, averageRecentVolume) *
          (profile.gym_level === "advanced" ? 1.05 : profile.gym_level === "intermediate" ? 1.03 : 1.01),
      )
    : profile.gym_level === "advanced"
      ? 9000
      : profile.gym_level === "intermediate"
        ? 4500
        : 1800;
  const runTarget =
    recentRun && recentRun.distance_km >= 5
      ? Number(Math.min(Math.max(recentRun.distance_km, longestRecentRun) + 0.25, 7).toFixed(2))
      : profile.running_level === "cannot run 5K yet"
        ? Number(Math.min(Math.max(longestRecentRun + 0.2, 2), 4.8).toFixed(2))
        : 5;

  const split = nextSplit(profile.workout_split, workouts);

  const baseTasks: Omit<Task, "id">[] = [
    {
      user_id: profile.id,
      task_date: date,
      title: `Train ${split}`,
      description:
        profile.gym_level === "advanced"
          ? `Aim for controlled volume near ${strengthTarget.toLocaleString()} kg.`
          : `Complete a focused ${split.toLowerCase()} session with clean form.`,
      category: "strength",
      target_value: strengthTarget,
      difficulty: levelDifficulty,
      xp_reward: 50,
      coin_reward: 10,
      completed: false,
    },
    {
      user_id: profile.id,
      task_date: date,
      title: profile.running_level === "cannot run 5K yet" ? "Easy run/walk" : "Complete an easy run",
      description:
        profile.running_level === "cannot run 5K yet"
          ? `Cover ${runTarget} km with relaxed run/walk intervals.`
          : `Cover ${runTarget} km at a sustainable pace.`,
      category: "running",
      target_value: runTarget,
      difficulty: profile.running_level === "can run 5K fast" ? "hard" : "steady",
      xp_reward: 50,
      coin_reward: 10,
      completed: false,
    },
    {
      user_id: profile.id,
      task_date: date,
      title: "Hit protein target",
      description: `Reach ${profile.protein_target} g protein.`,
      category: "protein",
      target_value: profile.protein_target,
      difficulty: "steady",
      xp_reward: 25,
      coin_reward: 5,
      completed: false,
    },
    {
      user_id: profile.id,
      task_date: date,
      title: "Hit water target",
      description: `Drink ${profile.water_target} L water.`,
      category: "water",
      target_value: profile.water_target,
      difficulty: "easy",
      xp_reward: 20,
      coin_reward: 4,
      completed: false,
    },
    {
      user_id: profile.id,
      task_date: date,
      title: "Stay near calorie target",
      description: `Stay within 10% of ${profile.calorie_target} calories.`,
      category: "calories",
      target_value: profile.calorie_target,
      difficulty: "steady",
      xp_reward: 20,
      coin_reward: 4,
      completed: false,
    },
    {
      user_id: profile.id,
      task_date: date,
      title: profile.alcohol_goal ? "Alcohol-free day" : "Mindful alcohol check",
      description: profile.alcohol_goal ? "Keep today alcohol-free." : "Log whether today was alcohol-free.",
      category: "alcohol",
      target_value: 1,
      difficulty: "steady",
      xp_reward: 25,
      coin_reward: 5,
      completed: false,
    },
    {
      user_id: profile.id,
      task_date: date,
      title: "Mobility reset",
      description: "Complete 8 minutes of stretching or mobility work.",
      category: "mobility",
      target_value: 8,
      difficulty: "easy",
      xp_reward: 15,
      coin_reward: 3,
      completed: false,
    },
  ];

  return baseTasks.map((task) => ({
    ...task,
    id: randomId("task"),
  }));
}

function nextSplit(splits: WorkoutSplit[], workouts: StrengthWorkout[]) {
  if (!workouts.length) return splits[0];
  const lastSplit = workouts.at(-1)?.split_type;
  const index = Math.max(0, splits.findIndex((split) => split === lastSplit));
  return splits[(index + 1) % splits.length];
}

export function generateCoachingSummary(profile: Profile, state: FitQuestState): CoachingSummary {
  const workouts = getStrengthWorkouts(state, profile.id);
  const runs = getRuns(state, profile.id);
  const lifestyleLogs = getLifestyleLogs(state, profile.id);
  const recentWorkouts = workouts.filter((workout) => isWithinLastDays(workout.workout_date, 6));
  const recentRuns = runs.filter((run) => isWithinLastDays(run.run_date, 6));
  const recentLifestyle = lifestyleLogs.filter((log) => isWithinLastDays(log.log_date, 6));
  const waterMisses = recentLifestyle.filter((log) => log.water_liters < profile.water_target).length;
  const proteinHits = recentLifestyle.filter((log) => log.protein >= profile.protein_target).length;
  const alcoholFreeDays = recentLifestyle.filter((log) => log.alcohol_free).length;
  const latestRun = runs.at(-1);
  const previousRun = runs.at(-2);
  const paceImproved = Boolean(latestRun && previousRun && latestRun.pace_per_km < previousRun.pace_per_km);

  const levelGuidance = {
    beginner: "As a beginner, keep the priority on consistency, safe technique, and leaving one or two reps in reserve.",
    intermediate: "As an intermediate lifter, use gradual progression and keep recovery steady.",
    advanced: "As an advanced user, focus on progressive overload, recovery, and not chasing every session as a max effort.",
  }[profile.gym_level];

  return {
    weeklyFeedback: [
      `You completed ${recentWorkouts.length} strength workouts and ${recentRuns.length} runs this week.`,
      proteinHits >= 5
        ? "Protein consistency is strong this week."
        : `Protein target was hit ${proteinHits} days. A simpler repeatable meal could help.`,
      profile.alcohol_goal
        ? `You logged ${alcoholFreeDays} alcohol-free days. Try for ${Math.min(alcoholFreeDays + 1, 7)} next week.`
        : "Alcohol logging is optional, but keeping it visible helps recovery decisions.",
    ],
    strengthSuggestion:
      recentWorkouts.length === 0
        ? `${levelGuidance} Start with one well-controlled strength session before chasing volume.`
        : recentWorkouts.length >= 3
          ? "Try increasing total workout volume by about 5% next week if recovery feels good."
          : `${levelGuidance} A realistic next step is completing the next scheduled split.`,
    runningSuggestion: paceImproved
      ? "Your running pace improved. Your next run can be slightly longer at an easy pace."
      : latestRun
        ? "Keep the next run comfortable and build distance before chasing pace."
        : "Start with an easy run or run/walk session based on your current level.",
    habitSuggestion:
      waterMisses >= 3
        ? "Water target was missed several days. Try front-loading one liter before lunch."
        : "Lifestyle habits are trending well. Keep the targets stable for another week.",
    goalAdjustment:
      recentLifestyle.length >= 6 && waterMisses === 0
        ? "Water consistency is strong, so streak rewards should matter more than raising the target immediately."
        : "Keep targets stable until you have a full week of logs.",
  };
}

export function buildPartnerSummary(state: FitQuestState, userId: string): PartnerSummary | null {
  const remoteSummary = state.partnerSummaries[0];
  if (remoteSummary) return remoteSummary;

  const connection = state.partnerConnections.find(
    (item) =>
      item.status === "accepted" && (item.requester_id === userId || item.receiver_id === userId),
  );
  if (!connection) return null;
  const partnerId = connection.requester_id === userId ? connection.receiver_id : connection.requester_id;
  if (!partnerId) return null;
  const profile = state.profiles.find((item) => item.id === partnerId);
  if (!profile) return null;
  const relativeStrength = calculateRelativeStrengthScores(state, [partnerId])[0];

  return {
    profile,
    xp: profile.xp,
    level: profile.level,
    badges: getEarnedBadges(state, partnerId),
    streak: profile.current_streak,
    weeklyCompletion: weeklyCompletion(state.tasks, partnerId),
    weeklyXp: weeklyXp(state, partnerId),
    encouragements: state.encouragements
      .filter((item) => item.receiver_id === userId || item.receiver_id === partnerId)
      .slice(-4)
      .map((item) => item.message),
    milestones: getRecentMilestones(state, partnerId),
    age: profile.age,
    bodyWeightKg: profile.body_weight_kg,
    weightClass: relativeStrength?.weightClass ?? "Unclassified",
    relativeStrength: relativeStrength?.relativeStrength ?? 0,
    ageAdjustedStrength: relativeStrength?.ageAdjustedStrength ?? 0,
    ageMultiplier: relativeStrength?.ageMultiplier ?? 1,
    liftCount: relativeStrength?.liftCount ?? 0,
  };
}

export function getRecentMilestones(state: FitQuestState, userId: string) {
  const milestones: string[] = [];
  const recentRun = getRuns(state, userId).at(-1);
  const recentWorkout = getStrengthWorkouts(state, userId).at(-1);
  const latestBadge = state.userBadges
    .filter((badge) => badge.user_id === userId)
    .sort((a, b) => b.earned_at.localeCompare(a.earned_at))[0];

  if (recentRun) milestones.push("Completed a run");
  if (recentWorkout) milestones.push("Logged a strength workout");
  if (latestBadge) {
    const badge = state.badges.find((item) => item.id === latestBadge.badge_id);
    if (badge) milestones.push(`Earned ${badge.name}`);
  }
  const profile = state.profiles.find((item) => item.id === userId);
  if (profile && profile.current_streak >= 7) milestones.push("Hit a streak milestone");

  return milestones.slice(0, 4);
}

export function lifestyleHabitSummary(profile: Profile, logs: DailyLifestyleLog[]) {
  const recent = logs.filter((log) => isWithinLastDays(log.log_date, 6));
  const count = Math.max(1, recent.length);
  const proteinHits = recent.filter((log) => log.protein >= profile.protein_target).length;
  const waterHits = recent.filter((log) => log.water_liters >= profile.water_target).length;
  const calorieHits = recent.filter(
    (log) => Math.abs(log.calories - profile.calorie_target) <= profile.calorie_target * 0.1,
  ).length;
  const alcoholFreeDays = recent.filter((log) => log.alcohol_free).length;

  return {
    protein: Math.round((proteinHits / count) * 100),
    water: Math.round((waterHits / count) * 100),
    calories: Math.round((calorieHits / count) * 100),
    alcoholFreeDays,
  };
}

export function badgeByCondition(badges: Badge[], condition: string) {
  return badges.find((badge) => badge.condition_type === condition);
}

export function strengthChartData(workouts: StrengthWorkout[]) {
  return workouts.slice(-8).map((workout) => ({
    date: workout.workout_date.slice(5),
    volume: workout.total_volume,
  }));
}

export function calculateRelativeStrengthScores(
  state: FitQuestState,
  userIds: string[],
): RelativeStrengthScore[] {
  return userIds
    .map((userId) => {
      const profile = state.profiles.find((item) => item.id === userId);
      if (!profile) return null;
      const workouts = getStrengthWorkouts(state, userId);
      const workoutIds = new Set(workouts.map((workout) => workout.id));
      const topExerciseScores = state.strengthExercises
        .filter((exercise) => workoutIds.has(exercise.workout_id) && !exercise.is_bodyweight)
        .reduce((scores, exercise) => {
          const key = exercise.exercise_name.toLowerCase();
          scores.set(key, Math.max(scores.get(key) ?? 0, exercise.estimated_1rm));
          return scores;
        }, new Map<string, number>());
      const topLifts = Array.from(topExerciseScores.values())
        .sort((a, b) => b - a)
        .slice(0, 3);
      const strengthTotal = topLifts.reduce((total, lift) => total + lift, 0);
      const relativeStrength = profile.body_weight_kg
        ? Number(((strengthTotal / profile.body_weight_kg) * 100).toFixed(1))
        : 0;
      const multiplier = ageMultiplier(profile.age);

      return {
        userId,
        name: profile.name,
        age: profile.age,
        bodyWeightKg: profile.body_weight_kg,
        weightClass: weightClass(profile.body_weight_kg),
        relativeStrength,
        ageAdjustedStrength: Number((relativeStrength * multiplier).toFixed(1)),
        ageMultiplier: multiplier,
        liftCount: topLifts.length,
      };
    })
    .filter((score): score is RelativeStrengthScore => Boolean(score));
}

export function calculateRelativeStrengthScoreForProfile(
  profile: Profile,
  relativeStrength: number,
  ageAdjustedStrength?: number,
): RelativeStrengthScore {
  const multiplier = ageMultiplier(profile.age);
  return {
    userId: profile.id,
    name: profile.name,
    age: profile.age,
    bodyWeightKg: profile.body_weight_kg,
    weightClass: weightClass(profile.body_weight_kg),
    relativeStrength,
    ageAdjustedStrength: ageAdjustedStrength ?? Number((relativeStrength * multiplier).toFixed(1)),
    ageMultiplier: multiplier,
    liftCount: 0,
  };
}

function ageMultiplier(age: number) {
  if (age >= 70) return 1.42;
  if (age >= 60) return 1.28;
  if (age >= 50) return 1.16;
  if (age >= 40) return 1.07;
  return 1;
}

function weightClass(bodyWeightKg: number) {
  if (bodyWeightKg <= 59) return "59 kg";
  if (bodyWeightKg <= 66) return "66 kg";
  if (bodyWeightKg <= 74) return "74 kg";
  if (bodyWeightKg <= 83) return "83 kg";
  if (bodyWeightKg <= 93) return "93 kg";
  if (bodyWeightKg <= 105) return "105 kg";
  if (bodyWeightKg <= 120) return "120 kg";
  return "120+ kg";
}

export function runningChartData(runs: RunningWorkout[]) {
  return runs.slice(-8).map((run) => ({
    date: run.run_date.slice(5),
    distance: run.distance_km,
    pace: run.pace_per_km,
  }));
}
