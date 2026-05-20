"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getDemoState } from "@/lib/demo-data";
import {
  calculatePace,
  calculatePersonalRecords,
  calculateWorkoutVolume,
  estimatedOneRepMax,
  generateInviteCode,
  generateDailyTasks,
  getProfile,
  levelFromXp,
  randomId,
  timestampNow,
  todayISO,
} from "@/lib/fitness";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Badge,
  DailyLifestyleLog,
  FitQuestState,
  MainGoal,
  PartnerConnection,
  PartnerSummary,
  Profile,
  RunningLevel,
  RunningWorkout,
  StrengthExercise,
  StrengthWorkout,
  Task,
  WorkoutSplit,
} from "@/lib/types";

type StrengthExerciseInput = {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  is_bodyweight: boolean;
  notes: string;
};

type OnboardingInput = Pick<
  Profile,
  | "name"
  | "nickname"
  | "main_goal"
  | "age"
  | "body_weight_kg"
  | "gym_level"
  | "running_level"
  | "five_k_goal"
  | "calorie_target"
  | "protein_target"
  | "water_target"
  | "alcohol_goal"
  | "workout_split"
>;

type AuthStatus = "loading" | "authenticated" | "anonymous" | "demo";
type AppNotice = { tone: "success" | "error" | "info"; message: string } | null;

type FitQuestContextValue = {
  state: FitQuestState;
  profile: Profile;
  supabaseReady: boolean;
  authStatus: AuthStatus;
  isDemoMode: boolean;
  authError: string | null;
  notice: AppNotice;
  clearNotice: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  switchDemoUser: (userId: string) => void;
  updateOnboarding: (input: OnboardingInput) => void;
  completeTask: (taskId: string) => void;
  addStrengthWorkout: (input: {
    workout_date: string;
    split_type: WorkoutSplit;
    notes: string;
    exercises: StrengthExerciseInput[];
  }) => void;
  addRun: (input: {
    run_date: string;
    distance_km: number;
    time_minutes: number;
    notes: string;
  }) => void;
  addLifestyleLog: (input: {
    log_date: string;
    calories: number;
    protein: number;
    water_liters: number;
    alcohol_free: boolean;
  }) => void;
  createReward: (input: { title: string; description: string; coin_cost: number }) => void;
  purchaseReward: (rewardId: string) => void;
  sendEncouragement: (receiverId: string, message: string) => void;
  createPartnerInvite: () => Promise<string | null>;
  acceptPartnerInvite: (inviteCode: string) => Promise<boolean>;
  refreshAccountData: () => Promise<void>;
};

const STORAGE_KEY = "fitquest.mvp.state.v2";
const FitQuestContext = createContext<FitQuestContextValue | null>(null);

export function FitQuestProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const supabaseReady = isSupabaseConfigured();
  const [state, setState] = useState<FitQuestState>(() => ensureTodayTasks(getDemoState()));
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => (supabaseReady ? "loading" : "demo"));
  const [authError, setAuthError] = useState<string | null>(null);
  const [notice, setNotice] = useState<AppNotice>(null);
  const localStorageLoaded = useRef(false);

  useEffect(() => {
    if (supabaseReady) return;
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      localStorageLoaded.current = true;
      if (!saved) {
        setState((previous) => ensureTodayTasks(previous));
        return;
      }
      try {
        setState(ensureTodayTasks(JSON.parse(saved) as FitQuestState));
      } catch {
        setState(ensureTodayTasks(getDemoState()));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [supabaseReady]);

  useEffect(() => {
    if (supabaseReady) return;
    if (!localStorageLoaded.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, supabaseReady]);

  useEffect(() => {
    if (!supabase) return;
    if (authStatus !== "authenticated") return;
    void syncOwnedSupabaseState(supabase, state, state.currentUserId);
  }, [authStatus, state, supabase]);

  const profile = getProfile(state);

  const loadSupabaseProfile = useCallback(
    async (userId: string, email: string) => {
      if (!supabase) return;
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      const remoteProfile = (profileRow as Profile | null) ?? createDefaultProfile(userId, email);
      if (!profileRow) {
        await supabase.from("profiles").upsert(remoteProfile);
      }

      const [
        strengthWorkoutsResponse,
        exercisesResponse,
        runsResponse,
        lifestyleResponse,
        tasksResponse,
        rewardsResponse,
        rewardPurchasesResponse,
        badgesResponse,
        userBadgesResponse,
        xpResponse,
        connectionsResponse,
        encouragementsResponse,
        partnerSummariesResponse,
      ] = await Promise.all([
        supabase.from("strength_workouts").select("*").eq("user_id", userId),
        supabase.from("strength_exercises").select("*, strength_workouts!inner(user_id)").eq("strength_workouts.user_id", userId),
        supabase.from("running_workouts").select("*").eq("user_id", userId),
        supabase.from("daily_lifestyle_logs").select("*").eq("user_id", userId),
        supabase.from("tasks").select("*").eq("user_id", userId),
        supabase.from("rewards").select("*").eq("user_id", userId),
        supabase.from("reward_purchases").select("*").eq("user_id", userId),
        supabase.from("badges").select("*"),
        supabase.from("user_badges").select("*").eq("user_id", userId),
        supabase.from("xp_transactions").select("*").eq("user_id", userId),
        supabase
          .from("partner_connections")
          .select("*")
          .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase
          .from("encouragements")
          .select("*")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase.rpc("get_partner_summaries"),
      ]);

      setState((previous) => {
        const badges = badgesResponse.data?.length
          ? (badgesResponse.data as Badge[])
          : previous.badges;
        const connections = (connectionsResponse.data as PartnerConnection[] | null) ?? [];
        const partnerSummaries = mapPartnerSummaries(
          (partnerSummariesResponse.data as PartnerSummaryRpcRow[] | null) ?? [],
          badges,
        );
        const next = {
          currentUserId: userId,
          profiles: [remoteProfile, ...partnerSummaries.map((summary) => summary.profile)],
          partnerConnections: connections,
          strengthWorkouts: (strengthWorkoutsResponse.data as StrengthWorkout[] | null) ?? [],
          strengthExercises: stripJoinedWorkout(
            (exercisesResponse.data as (StrengthExercise & { strength_workouts?: unknown })[] | null) ?? [],
          ),
          runningWorkouts: (runsResponse.data as RunningWorkout[] | null) ?? [],
          dailyLifestyleLogs: (lifestyleResponse.data as DailyLifestyleLog[] | null) ?? [],
          tasks: (tasksResponse.data as Task[] | null) ?? [],
          badges,
          userBadges: (userBadgesResponse.data as FitQuestState["userBadges"] | null) ?? [],
          rewards: (rewardsResponse.data as FitQuestState["rewards"] | null) ?? [],
          rewardPurchases: (rewardPurchasesResponse.data as FitQuestState["rewardPurchases"] | null) ?? [],
          xpTransactions: (xpResponse.data as FitQuestState["xpTransactions"] | null) ?? [],
          encouragements: (encouragementsResponse.data as FitQuestState["encouragements"] | null) ?? [],
          partnerSummaries,
        } satisfies FitQuestState;
        setAuthStatus("authenticated");
        return ensureTodayTasks(next, userId);
      });
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) {
        setAuthStatus("anonymous");
        return;
      }
      void loadSupabaseProfile(user.id, user.email ?? "user@example.com");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthStatus("loading");
        void loadSupabaseProfile(session.user.id, session.user.email ?? "user@example.com");
      } else {
        setAuthStatus("anonymous");
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSupabaseProfile, supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      if (!supabase) {
        const demoUser = state.profiles.find((item) => item.email.toLowerCase() === email.toLowerCase());
        setState((previous) => ensureTodayTasks({
          ...previous,
          currentUserId: demoUser?.id ?? previous.currentUserId,
        }));
        return true;
      }

      setAuthStatus("loading");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthStatus("anonymous");
        setAuthError(error.message);
        return false;
      }
      if (data.user) await loadSupabaseProfile(data.user.id, data.user.email ?? email);
      return true;
    },
    [loadSupabaseProfile, state.profiles, supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setAuthError(null);
      if (!supabase) {
        const newProfile = createDefaultProfile(randomId("profile"), email, name);
        setState((previous) => ({
          ...previous,
          currentUserId: newProfile.id,
          profiles: [...previous.profiles, newProfile],
          tasks: [...previous.tasks, ...generateDailyTasks(newProfile, previous)],
        }));
        return true;
      }

      setAuthStatus("loading");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        setAuthStatus("anonymous");
        setAuthError(error.message);
        return false;
      }
      if (data.user) {
        const newProfile = createDefaultProfile(data.user.id, data.user.email ?? email, name);
        await supabase.from("profiles").upsert(newProfile);
        setState((previous) => ({
          ...emptyState(newProfile.id, previous.badges),
          currentUserId: newProfile.id,
          profiles: [newProfile],
          tasks: generateDailyTasks(newProfile, emptyState(newProfile.id, previous.badges)),
        }));
        setAuthStatus("authenticated");
      }
      return true;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setAuthStatus(supabaseReady ? "anonymous" : "demo");
    setState((previous) => ensureTodayTasks({ ...previous, currentUserId: previous.profiles[0].id }));
  }, [supabase, supabaseReady]);

  const switchDemoUser = useCallback((userId: string) => {
    setState((previous) => ensureTodayTasks({ ...previous, currentUserId: userId }));
  }, []);

  const updateOnboarding = useCallback(
    (input: OnboardingInput) => {
      setState((previous) => {
        const updatedProfile = { ...getProfile(previous), ...input, onboarding_completed: true };
        void syncTable(supabase, "profiles", updatedProfile);
        setNotice({ tone: "success", message: "Profile and goals saved." });
        return {
          ...previous,
          profiles: upsertById(previous.profiles, updatedProfile),
        };
      });
    },
    [supabase],
  );

  const completeTask = useCallback((taskId: string) => {
    setState((previous) => {
      const next = cloneState(previous);
      completeTasks(next, previous.currentUserId, (task) => task.id === taskId);
      setNotice({ tone: "success", message: "Task completed. XP added." });
      return next;
    });
  }, []);

  const addStrengthWorkout: FitQuestContextValue["addStrengthWorkout"] = useCallback(
    (input) => {
      setState((previous) => {
        const next = cloneState(previous);
        const userId = previous.currentUserId;
        const profile = getProfile(previous, userId);
        const workoutId = randomId("strength");
        const exercises = input.exercises
          .filter((exercise) => exercise.exercise_name.trim())
          .map((exercise) => ({
            ...exercise,
            id: randomId("exercise"),
            workout_id: workoutId,
            estimated_1rm: exercise.is_bodyweight
              ? 0
              : estimatedOneRepMax(exercise.weight, exercise.reps),
          }));
        const totalVolume = calculateWorkoutVolume(exercises);
        const workout: StrengthWorkout = {
          id: workoutId,
          user_id: userId,
          workout_date: input.workout_date,
          split_type: input.split_type,
          notes: input.notes,
          total_volume: totalVolume,
          created_at: timestampNow(),
        };
        const previousRecords = calculatePersonalRecords(
          next.strengthWorkouts.filter((item) => item.user_id === userId),
          next.strengthExercises.filter((item) =>
            next.strengthWorkouts.some(
              (workoutItem) => workoutItem.id === item.workout_id && workoutItem.user_id === userId,
            ),
          ),
          next.runningWorkouts.filter((run) => run.user_id === userId),
        );

        next.strengthWorkouts.push(workout);
        next.strengthExercises.push(...exercises);
        completeTasks(next, userId, (task) => task.category === "strength");
        awardBadge(next, userId, "first_workout");

        if (totalVolume > previousRecords.highestWorkoutVolume) {
          addXp(next, userId, 100, "Personal record", 20);
          awardBadge(next, userId, "first_strength_pr");
        }
        applyLevelBadges(next, profile.id);
        void syncTable(supabase, "strength_workouts", workout);
        if (exercises.length) void syncTable(supabase, "strength_exercises", exercises);
        setNotice({ tone: "success", message: "Strength workout saved." });
        return next;
      });
    },
    [supabase],
  );

  const addRun: FitQuestContextValue["addRun"] = useCallback(
    (input) => {
      setState((previous) => {
        const next = cloneState(previous);
        const userId = previous.currentUserId;
        const run: RunningWorkout = {
          id: randomId("run"),
          user_id: userId,
          run_date: input.run_date,
          distance_km: input.distance_km,
          time_minutes: input.time_minutes,
          pace_per_km: calculatePace(input.distance_km, input.time_minutes),
          notes: input.notes,
          created_at: timestampNow(),
        };
        next.runningWorkouts.push(run);
        completeTasks(next, userId, (task) => task.category === "running");
        awardBadge(next, userId, "first_run");
        if (run.distance_km >= 5) awardBadge(next, userId, "first_5k");
        applyLevelBadges(next, userId);
        void syncTable(supabase, "running_workouts", run);
        setNotice({ tone: "success", message: "Run saved." });
        return next;
      });
    },
    [supabase],
  );

  const addLifestyleLog: FitQuestContextValue["addLifestyleLog"] = useCallback(
    (input) => {
      setState((previous) => {
        const next = cloneState(previous);
        const userId = previous.currentUserId;
        const profile = getProfile(previous, userId);
        const log: DailyLifestyleLog = {
          id: randomId("life"),
          user_id: userId,
          log_date: input.log_date,
          calories: input.calories,
          protein: input.protein,
          water_liters: input.water_liters,
          alcohol_free: input.alcohol_free,
          created_at: timestampNow(),
        };

        next.dailyLifestyleLogs = [
          ...next.dailyLifestyleLogs.filter(
            (item) => !(item.user_id === userId && item.log_date === input.log_date),
          ),
          log,
        ];

        completeTasks(next, userId, (task) => {
          if (task.category === "protein") return input.protein >= profile.protein_target;
          if (task.category === "water") return input.water_liters >= profile.water_target;
          if (task.category === "calories") {
            return Math.abs(input.calories - profile.calorie_target) <= profile.calorie_target * 0.1;
          }
          if (task.category === "alcohol") return profile.alcohol_goal ? input.alcohol_free : true;
          return false;
        });

        const recentLogs = next.dailyLifestyleLogs
          .filter((item) => item.user_id === userId)
          .sort((a, b) => b.log_date.localeCompare(a.log_date))
          .slice(0, 7);
        if (recentLogs.length >= 7 && recentLogs.every((item) => item.protein >= profile.protein_target)) {
          awardBadge(next, userId, "protein_7");
        }
        if (recentLogs.length >= 7 && recentLogs.every((item) => item.alcohol_free)) {
          awardBadge(next, userId, "alcohol_free_week");
        }
        applyLevelBadges(next, userId);
        void syncTable(supabase, "daily_lifestyle_logs", log);
        setNotice({ tone: "success", message: "Lifestyle log saved." });
        return next;
      });
    },
    [supabase],
  );

  const createReward: FitQuestContextValue["createReward"] = useCallback(
    (input) => {
      setState((previous) => {
        const reward = {
          ...input,
          id: randomId("reward"),
          user_id: previous.currentUserId,
          created_at: timestampNow(),
        };
        void syncTable(supabase, "rewards", reward);
        setNotice({ tone: "success", message: "Reward created." });
        return { ...previous, rewards: [...previous.rewards, reward] };
      });
    },
    [supabase],
  );

  const purchaseReward = useCallback(
    (rewardId: string) => {
      setState((previous) => {
        const reward = previous.rewards.find((item) => item.id === rewardId);
        const profile = getProfile(previous);
        if (!reward || reward.coin_cost > profile.coins) {
          setNotice({ tone: "error", message: "Not enough coins for that reward yet." });
          return previous;
        }

        const purchase = {
          id: randomId("purchase"),
          user_id: profile.id,
          reward_id: reward.id,
          purchased_at: timestampNow(),
        };
        const updatedProfile = { ...profile, coins: profile.coins - reward.coin_cost };
        void syncTable(supabase, "profiles", updatedProfile);
        void syncTable(supabase, "reward_purchases", purchase);
        setNotice({ tone: "success", message: "Reward purchased." });
        return {
          ...previous,
          profiles: upsertById(previous.profiles, updatedProfile),
          rewardPurchases: [...previous.rewardPurchases, purchase],
        };
      });
    },
    [supabase],
  );

  const sendEncouragement = useCallback(
    (receiverId: string, message: string) => {
      setState((previous) => {
        const encouragement = {
          id: randomId("enc"),
          sender_id: previous.currentUserId,
          receiver_id: receiverId,
          message,
          created_at: timestampNow(),
        };
        void syncTable(supabase, "encouragements", encouragement);
        setNotice({ tone: "success", message: "Encouragement sent." });
        return { ...previous, encouragements: [...previous.encouragements, encouragement] };
      });
    },
    [supabase],
  );

  const createPartnerInvite = useCallback(async () => {
    const current = getProfile(state);
    const existingPending = state.partnerConnections.find(
      (connection) => connection.requester_id === current.id && connection.status === "pending",
    );
    if (existingPending) {
      setNotice({ tone: "info", message: "Existing invite code is ready to share." });
      return existingPending.invite_code;
    }

    const code = generateInviteCode();
    const connection: PartnerConnection = {
      id: randomId("partner"),
      requester_id: current.id,
      receiver_id: null,
      status: "pending",
      invite_code: code,
      created_at: timestampNow(),
    };

    if (supabase) {
      const { error } = await supabase.from("partner_connections").insert(connection as never);
      if (error) {
        setNotice({ tone: "error", message: error.message });
        return null;
      }
    }

    setState((previous) => ({
      ...previous,
      partnerConnections: [...previous.partnerConnections, connection],
    }));
    setNotice({ tone: "success", message: "Invite code created." });
    return code;
  }, [state, supabase]);

  const acceptPartnerInvite = useCallback(
    async (inviteCode: string) => {
      const normalizedCode = inviteCode.trim().toUpperCase();
      if (!normalizedCode) {
        setNotice({ tone: "error", message: "Enter an invite code first." });
        return false;
      }

      if (supabase) {
        const { error } = await supabase.rpc("accept_partner_invite", {
          invite_code_input: normalizedCode,
        });
        if (error) {
          setNotice({ tone: "error", message: error.message });
          return false;
        }
        await loadSupabaseProfile(profile.id, profile.email);
        setNotice({ tone: "success", message: "Family partner connected." });
        return true;
      }

      let connected = false;
      setState((previous) => {
        const current = getProfile(previous);
        const pending = previous.partnerConnections.find(
          (connection) =>
            connection.status === "pending" &&
            connection.requester_id !== current.id &&
            connection.invite_code.toUpperCase() === normalizedCode,
        );
        if (!pending) return previous;
        connected = true;
        return {
          ...previous,
          partnerConnections: previous.partnerConnections.map((connection) =>
            connection.id === pending.id
              ? { ...connection, receiver_id: current.id, status: "accepted" }
              : connection,
          ),
        };
      });
      setNotice(
        connected
          ? { tone: "success", message: "Family partner connected." }
          : { tone: "error", message: "Invite code not found." },
      );
      return connected;
    },
    [loadSupabaseProfile, profile.email, profile.id, supabase],
  );

  const refreshAccountData = useCallback(async () => {
    if (!supabase) return;
    await loadSupabaseProfile(profile.id, profile.email);
    setNotice({ tone: "success", message: "Account data refreshed." });
  }, [loadSupabaseProfile, profile.email, profile.id, supabase]);

  const value: FitQuestContextValue = {
    state,
    profile,
    supabaseReady,
    authStatus,
    isDemoMode: authStatus === "demo",
    authError,
    notice,
    clearNotice: () => setNotice(null),
    signIn,
    signUp,
    signOut,
    switchDemoUser,
    updateOnboarding,
    completeTask,
    addStrengthWorkout,
    addRun,
    addLifestyleLog,
    createReward,
    purchaseReward,
    sendEncouragement,
    createPartnerInvite,
    acceptPartnerInvite,
    refreshAccountData,
  };

  return <FitQuestContext.Provider value={value}>{children}</FitQuestContext.Provider>;
}

export function useFitQuest() {
  const context = useContext(FitQuestContext);
  if (!context) throw new Error("useFitQuest must be used inside FitQuestProvider");
  return context;
}

function createDefaultProfile(id: string, email: string, name = "FitQuest User"): Profile {
  return {
    id,
    email,
    name,
    nickname: "New quester",
    gym_level: "beginner",
    running_level: "cannot run 5K yet" as RunningLevel,
    main_goal: "both" as MainGoal,
    age: 30,
    body_weight_kg: 80,
    onboarding_completed: false,
    five_k_goal: "Build toward a steady 5K",
    calorie_target: 2300,
    protein_target: 130,
    water_target: 2.2,
    alcohol_goal: true,
    workout_split: ["Chest + triceps", "Back + biceps", "Legs"],
    xp: 0,
    level: 1,
    coins: 0,
    current_streak: 0,
    created_at: timestampNow(),
  };
}

function emptyState(currentUserId: string, badges: Badge[] = []): FitQuestState {
  return {
    currentUserId,
    profiles: [],
    partnerConnections: [],
    strengthWorkouts: [],
    strengthExercises: [],
    runningWorkouts: [],
    dailyLifestyleLogs: [],
    tasks: [],
    badges,
    userBadges: [],
    rewards: [],
    rewardPurchases: [],
    xpTransactions: [],
    encouragements: [],
    partnerSummaries: [],
  };
}

function cloneState(state: FitQuestState): FitQuestState {
  return {
    ...state,
    profiles: [...state.profiles],
    partnerConnections: [...state.partnerConnections],
    strengthWorkouts: [...state.strengthWorkouts],
    strengthExercises: [...state.strengthExercises],
    runningWorkouts: [...state.runningWorkouts],
    dailyLifestyleLogs: [...state.dailyLifestyleLogs],
    tasks: [...state.tasks],
    badges: [...state.badges],
    userBadges: [...state.userBadges],
    rewards: [...state.rewards],
    rewardPurchases: [...state.rewardPurchases],
    xpTransactions: [...state.xpTransactions],
    encouragements: [...state.encouragements],
    partnerSummaries: [...state.partnerSummaries],
  };
}

type PartnerSummaryRpcRow = {
  profile_id: string;
  name: string;
  nickname: string;
  xp: number;
  level: number;
  coins: number;
  current_streak: number;
  weekly_completion: number;
  weekly_xp: number;
  age: number;
  body_weight_kg: number;
  weight_class: string;
  relative_strength_index: number;
  age_adjusted_strength_index: number;
  badges: { name: string; description: string; icon: string }[] | null;
  recent_milestones: string[] | null;
  encouragement_messages: string[] | null;
};

function mapPartnerSummaries(rows: PartnerSummaryRpcRow[], knownBadges: Badge[]): PartnerSummary[] {
  return rows.map((row) => {
    const profile = createDefaultProfile(row.profile_id, "partner@example.com", row.name);
    profile.nickname = row.nickname;
    profile.xp = row.xp;
    profile.level = row.level;
    profile.coins = row.coins;
    profile.current_streak = row.current_streak;
    profile.age = row.age;
    profile.body_weight_kg = Number(row.body_weight_kg);
    profile.onboarding_completed = true;

    const badges = (row.badges ?? []).map((badge, index) => ({
      id:
        knownBadges.find((knownBadge) => knownBadge.name === badge.name)?.id ??
        `summary-badge-${row.profile_id}-${index}`,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      condition_type:
        knownBadges.find((knownBadge) => knownBadge.name === badge.name)?.condition_type ??
        badge.name.toLowerCase().replaceAll(" ", "_"),
    }));

    return {
      profile,
      xp: row.xp,
      level: row.level,
      badges,
      streak: row.current_streak,
      weeklyCompletion: Number(row.weekly_completion),
      weeklyXp: row.weekly_xp,
      encouragements: row.encouragement_messages ?? [],
      milestones: row.recent_milestones ?? [],
      age: row.age,
      bodyWeightKg: Number(row.body_weight_kg),
      weightClass: row.weight_class,
      relativeStrength: Number(row.relative_strength_index),
      ageAdjustedStrength: Number(row.age_adjusted_strength_index),
      ageMultiplier: row.age >= 70 ? 1.42 : row.age >= 60 ? 1.28 : row.age >= 50 ? 1.16 : row.age >= 40 ? 1.07 : 1,
      liftCount: 0,
    };
  });
}

function completeTasks(next: FitQuestState, userId: string, matcher: (task: Task) => boolean) {
  const completedNow: Task[] = [];
  const today = todayISO();
  next.tasks = next.tasks.map((task) => {
    if (task.user_id === userId && task.task_date === today && !task.completed && matcher(task)) {
      completedNow.push(task);
      return { ...task, completed: true };
    }
    return task;
  });

  completedNow.forEach((task) => addXp(next, userId, task.xp_reward, task.title, task.coin_reward));

  const todayTasks = next.tasks.filter((task) => task.user_id === userId && task.task_date === today);
  const alreadyBonused = next.xpTransactions.some(
    (transaction) =>
      transaction.user_id === userId &&
      transaction.reason === "Completed all daily tasks" &&
      transaction.created_at.slice(0, 10) === today,
  );
  if (todayTasks.length > 0 && todayTasks.every((task) => task.completed) && !alreadyBonused) {
    addXp(next, userId, 150, "Completed all daily tasks", 25, 1);
    awardBadge(next, userId, "consistency_champion");
  }

  const profile = getProfile(next, userId);
  if (profile.current_streak >= 7) awardBadge(next, userId, "streak_7");
  if (profile.current_streak >= 30) awardBadge(next, userId, "streak_30");
}

function addXp(
  next: FitQuestState,
  userId: string,
  amount: number,
  reason: string,
  coinReward = 0,
  streakIncrement = 0,
) {
  next.xpTransactions.push({
    id: randomId("xp"),
    user_id: userId,
    amount,
    reason,
    created_at: timestampNow(),
  });
  next.profiles = next.profiles.map((profile) => {
    if (profile.id !== userId) return profile;
    const xp = profile.xp + amount;
    return {
      ...profile,
      xp,
      level: levelFromXp(xp),
      coins: profile.coins + coinReward,
      current_streak: profile.current_streak + streakIncrement,
    };
  });
}

function awardBadge(next: FitQuestState, userId: string, conditionType: string) {
  const badge = next.badges.find((item) => item.condition_type === conditionType);
  if (!badge) return;
  const exists = next.userBadges.some((item) => item.user_id === userId && item.badge_id === badge.id);
  if (exists) return;
  next.userBadges.push({
    id: randomId("user_badge"),
    user_id: userId,
    badge_id: badge.id,
    earned_at: timestampNow(),
  });
}

function applyLevelBadges(next: FitQuestState, userId: string) {
  const profile = getProfile(next, userId);
  if (profile.level >= 5) awardBadge(next, userId, "level_5");
  if (profile.level >= 10) awardBadge(next, userId, "level_10");
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  const exists = items.some((existing) => existing.id === item.id);
  if (!exists) return [...items, item];
  return items.map((existing) => (existing.id === item.id ? item : existing));
}

function ensureTodayTasks(state: FitQuestState, userId = state.currentUserId) {
  const profile = getProfile(state, userId);
  const hasToday = state.tasks.some(
    (task) => task.user_id === profile.id && task.task_date === todayISO(),
  );
  if (hasToday) return state;
  return {
    ...state,
    tasks: [...state.tasks, ...generateDailyTasks(profile, state)],
  };
}

function stripJoinedWorkout(remoteItems: (StrengthExercise & { strength_workouts?: unknown })[]) {
  return remoteItems.map((remoteItem) => {
    const item = { ...remoteItem };
    delete item.strength_workouts;
    return item;
  });
}

async function syncTable<T>(supabase: ReturnType<typeof createSupabaseBrowserClient>, table: string, payload: T) {
  if (!supabase) return;
  await supabase.from(table).upsert(payload as never);
}

async function syncOwnedSupabaseState(
  supabase: NonNullable<ReturnType<typeof createSupabaseBrowserClient>>,
  state: FitQuestState,
  userId: string,
) {
  const profile = state.profiles.find((item) => item.id === userId);
  if (!profile) return;

  const ownWorkoutIds = new Set(
    state.strengthWorkouts.filter((item) => item.user_id === userId).map((item) => item.id),
  );
  const ownExercises = state.strengthExercises.filter((item) => ownWorkoutIds.has(item.workout_id));

  await supabase.from("profiles").upsert(profile as never);
  await syncArray(supabase, "strength_workouts", state.strengthWorkouts.filter((item) => item.user_id === userId));
  await syncArray(supabase, "strength_exercises", ownExercises);
  await syncArray(supabase, "running_workouts", state.runningWorkouts.filter((item) => item.user_id === userId));
  await syncArray(
    supabase,
    "daily_lifestyle_logs",
    state.dailyLifestyleLogs.filter((item) => item.user_id === userId),
  );
  await syncArray(supabase, "tasks", state.tasks.filter((item) => item.user_id === userId));
  await syncArray(supabase, "user_badges", state.userBadges.filter((item) => item.user_id === userId));
  await syncArray(supabase, "rewards", state.rewards.filter((item) => item.user_id === userId));
  await syncArray(
    supabase,
    "reward_purchases",
    state.rewardPurchases.filter((item) => item.user_id === userId),
  );
  await syncArray(
    supabase,
    "xp_transactions",
    state.xpTransactions.filter((item) => item.user_id === userId),
  );
}

async function syncArray<T>(
  supabase: NonNullable<ReturnType<typeof createSupabaseBrowserClient>>,
  table: string,
  payload: T[],
) {
  if (!payload.length) return;
  await supabase.from(table).upsert(payload as never);
}
