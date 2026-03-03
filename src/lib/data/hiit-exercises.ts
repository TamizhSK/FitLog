export interface HiitExercise {
	id: string;
	name: string;
	icon: string;
	category: string;
	difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
	duration: string;
	calorieRange: string;
	overview: string;
	musclesWorked: string[];
	instructions: string[];
	tips: string[];
	variations: string[];
	bestFor: string[];
	defaultConfig: { workSeconds: number; restSeconds: number; rounds: number };
}

export const HIIT_EXERCISES: HiitExercise[] = [
	{
		id: 'tabata',
		name: 'Tabata',
		icon: 'flame',
		category: 'High Intensity',
		difficulty: 'Advanced',
		duration: '4 min per block',
		calorieRange: '120-200 per block',
		overview:
			'Tabata is a scientifically-backed high-intensity interval training protocol developed by Dr. Izumi Tabata in 1996. It consists of 8 rounds of 20 seconds all-out effort followed by 10 seconds of rest, totaling exactly 4 minutes. Despite its short duration, Tabata has been proven to improve both aerobic and anaerobic capacity simultaneously — something steady-state cardio alone cannot achieve. The key is true maximum effort during every work interval.',
		musclesWorked: ['Full Body', 'Core', 'Cardiovascular System'],
		instructions: [
			'Choose 1-2 exercises that engage large muscle groups (burpees, sprints, thrusters, jump squats).',
			'Set your timer: 20 seconds work, 10 seconds rest, 8 rounds.',
			'Warm up for 3-5 minutes with light cardio and dynamic stretches.',
			'Start round 1 — push to absolute maximum intensity. You should feel unable to speak.',
			'Rest for exactly 10 seconds. Stay on your feet, breathe deeply.',
			'Repeat for all 8 rounds. Your intensity should remain above 90% effort throughout.',
			'Cool down with 2-3 minutes of walking and static stretches.',
			'For multiple blocks, rest 1-2 minutes between Tabata sets.',
		],
		tips: [
			'True Tabata means 170%+ VO2max effort — if you can comfortably finish all 8 rounds, you\'re not going hard enough.',
			'Use a timer with audio cues so you don\'t waste seconds checking your phone.',
			'Stick to simple, explosive movements. Complex exercises break down under fatigue and increase injury risk.',
			'Track your rep count each round — your score is the lowest round. This is called your "Tabata Score".',
			'Beginners should start with a modified protocol: 15s work / 15s rest, and build up to the full 20/10.',
			'Limit Tabata to 2-3 sessions per week. It places extreme demand on your nervous system.',
		],
		variations: [
			'Single-Exercise Tabata: Pick one movement (e.g., air squats) and perform it for all 8 rounds. Great for beginners.',
			'Alternating Tabata: Switch between two exercises each round (e.g., odd rounds = burpees, even rounds = mountain climbers).',
			'Tabata Ladder: Start with a low-skill movement and increase complexity each round.',
			'Weighted Tabata: Use light dumbbells or kettlebells for movements like thrusters, swings, or snatches.',
			'Endurance Tabata: Stack 4-8 Tabata blocks back-to-back with 1-minute rest between blocks for a 20-40 minute session.',
		],
		bestFor: ['Fat loss', 'Cardiovascular conditioning', 'Time-efficient training', 'Athletic performance'],
		defaultConfig: { workSeconds: 20, restSeconds: 10, rounds: 8 },
	},
	{
		id: 'emom',
		name: 'EMOM (Every Minute On the Minute)',
		icon: 'clock',
		category: 'Structured Intervals',
		difficulty: 'Intermediate',
		duration: '10-30 min',
		calorieRange: '150-400',
		overview:
			'EMOM stands for "Every Minute On the Minute." At the start of each minute, you perform a prescribed number of reps. The faster you finish, the more rest you get before the next minute starts. This self-regulating format builds both endurance and pacing skills. As fatigue accumulates, your rest windows shrink, creating a progressive overload effect within a single session. EMOMs are incredibly versatile — used for strength, conditioning, skill work, or a combination of all three.',
		musclesWorked: ['Full Body', 'Depends on exercises chosen'],
		instructions: [
			'Choose 1-3 exercises and assign a rep count that takes roughly 30-40 seconds to complete.',
			'Set a running clock for your total time (10, 15, 20, or 30 minutes).',
			'At 0:00, begin your prescribed reps. Complete them as efficiently as possible.',
			'Rest for the remainder of the minute. If you finish in 35 seconds, you rest 25 seconds.',
			'At 1:00, start your next set. Continue this pattern for every minute.',
			'If using multiple exercises, rotate them: Minute 1 = Exercise A, Minute 2 = Exercise B, etc.',
			'If you can\'t complete reps within the minute, reduce the volume or scale the movement.',
		],
		tips: [
			'Choose a rep scheme that gives you at least 15-20 seconds of rest in the first few rounds. Fatigue will eat into your rest.',
			'EMOMs are excellent for practicing barbell lifts at moderate intensity — think 60-75% of your 1RM.',
			'Write your target reps on paper before starting. Decision fatigue is real when you\'re gassed.',
			'For conditioning-focused EMOMs, use 2-3 exercises to distribute fatigue across muscle groups.',
			'If rest drops below 10 seconds consistently, you\'ve overshot the volume. Reduce reps next time.',
			'Use EMOMs as a warm-up: 5-minute EMOM with 3 reps of your working lift at 50-60%.',
		],
		variations: [
			'Ascending EMOM: Add 1 rep each minute. Start easy, finish gasping. (e.g., Minute 1 = 5 reps, Minute 2 = 6 reps...)',
			'Alternating EMOM: Rotate between strength and cardio movements (e.g., odd minutes = deadlifts, even minutes = box jumps).',
			'E2MOM (Every 2 Minutes): Perform work every 2 minutes instead of every 1. Allows heavier loads and more recovery.',
			'EMOM for Skill: Use sub-maximal reps of technical lifts (snatches, muscle-ups) to accumulate volume without breakdown.',
			'Team EMOM: Partners alternate minutes, allowing one to work while the other rests.',
		],
		bestFor: ['Pacing discipline', 'Strength-endurance', 'Skill development', 'Work capacity'],
		defaultConfig: { workSeconds: 40, restSeconds: 20, rounds: 10 },
	},
	{
		id: 'amrap',
		name: 'AMRAP (As Many Rounds As Possible)',
		icon: 'biceps-flexed',
		category: 'Endurance Challenge',
		difficulty: 'Intermediate',
		duration: '5-20 min',
		calorieRange: '100-350',
		overview:
			'AMRAP — As Many Rounds (or Reps) As Possible — is a time-capped workout format where you cycle through a set list of exercises continuously until the clock runs out. There are no programmed rest periods; you rest only when you need to. The total rounds + reps completed becomes your score, making AMRAP one of the most measurable and competitive workout formats. It rewards both fitness and strategy — going too hard too early means crashing; going too easy means leaving reps on the table.',
		musclesWorked: ['Full Body', 'Core', 'Mental Toughness'],
		instructions: [
			'Select 3-5 exercises with specific rep counts (e.g., 10 push-ups, 15 air squats, 20 sit-ups).',
			'Set your timer for a fixed duration: 5, 10, 15, or 20 minutes.',
			'Start the clock and begin with Exercise 1. Move through the entire circuit.',
			'Once you complete all exercises in the circuit, that\'s 1 round. Immediately start round 2.',
			'Continue cycling through rounds until time expires. Record your total rounds + extra reps.',
			'Rest only as needed — the goal is maximum sustainable output, not maximum speed on any single round.',
			'Compare your score to previous attempts to track progress over time.',
		],
		tips: [
			'Pace the first 2-3 rounds at 70-80% effort. The workout gets exponentially harder — save something for the back half.',
			'Break sets before you have to. Doing 10 unbroken when fresh is easy; doing 10 unbroken at minute 12 is a different story.',
			'Pick movements with smooth transitions. Exercises that require equipment changes eat into your score.',
			'Use the "negative split" strategy: aim to complete more reps in the second half than the first.',
			'Keep a running tally on paper or in your head. Losing count is demoralizing and costs reps.',
			'For beginners: start with a 5-minute AMRAP. It\'s long enough to be challenging, short enough to maintain quality.',
		],
		variations: [
			'Bodyweight AMRAP: Use only bodyweight movements for a anywhere, anytime workout (push-ups, squats, burpees, lunges).',
			'Heavy AMRAP: Use barbell or dumbbell movements at moderate weight. Fewer reps per exercise, more strength focus.',
			'Partner AMRAP: "You go, I go" — one partner works while the other rests. Doubles the time under tension.',
			'Descending AMRAP: Reduce reps each round (Round 1: 21-15-9, Round 2: 15-12-9, etc.).',
			'Sprint AMRAP: 3-5 minute time cap with high-skill, low-rep movements. Tests peak power output.',
		],
		bestFor: ['Benchmark tracking', 'Mental toughness', 'Competitive training', 'Metabolic conditioning'],
		defaultConfig: { workSeconds: 300, restSeconds: 0, rounds: 1 },
	},
	{
		id: '30-30',
		name: '30/30 Intervals',
		icon: 'zap',
		category: 'Balanced Intervals',
		difficulty: 'Beginner',
		duration: '10-20 min',
		calorieRange: '100-250',
		overview:
			'The 30/30 protocol is the most accessible interval format — 30 seconds of work followed by 30 seconds of rest. The equal work-to-rest ratio makes it forgiving enough for beginners while still challenging for experienced athletes who push the intensity. Research shows that 30-second intervals are long enough to elevate heart rate into the anaerobic zone but short enough to maintain quality form throughout. This is the ideal starting point for anyone new to interval training.',
		musclesWorked: ['Full Body', 'Cardiovascular System'],
		instructions: [
			'Select 1-4 exercises. Simpler is better for your first sessions.',
			'Set your timer: 30 seconds work, 30 seconds rest, for 10-20 rounds.',
			'Warm up with 3-5 minutes of easy movement.',
			'Start your first 30-second work interval at a hard but sustainable pace — roughly 80-85% effort.',
			'When the rest period starts, actively recover: walk in place, shake out your arms, breathe deeply.',
			'Maintain consistent intensity across all rounds. If you\'re dying by round 5, you started too fast.',
			'Cool down with walking and stretching for 3-5 minutes.',
		],
		tips: [
			'The 1:1 work-to-rest ratio is the gold standard for building aerobic capacity without overtraining.',
			'Count your reps each round. Consistent rep counts mean you\'re pacing well. Dropping more than 20% means you started too hot.',
			'Use this protocol for learning new movements — 30 seconds is enough practice without fatigue-induced form breakdown.',
			'Pair upper and lower body exercises to distribute fatigue: push-ups one round, squats the next.',
			'Progress by increasing rounds before increasing intensity. 10 rounds → 12 → 15 → 20.',
			'This is an excellent format for outdoor training — sprints, hill runs, park bench exercises.',
		],
		variations: [
			'Single Movement: Pick one exercise (like kettlebell swings) and hammer it for all rounds. Simple and brutal.',
			'Circuit 30/30: Rotate through 4-6 different exercises, one per interval. Keeps things interesting.',
			'30/30 Ladder: Keep the 30-second window but increase reps each round (or increase weight).',
			'30/30 with Active Rest: Replace passive rest with low-intensity movement (walking, slow cycling).',
			'Density 30/30: Same exercises, same rest, but try to beat your previous rep count each session.',
		],
		bestFor: ['Beginners', 'General fitness', 'Active recovery days', 'Building aerobic base'],
		defaultConfig: { workSeconds: 30, restSeconds: 30, rounds: 10 },
	},
	{
		id: '45-15',
		name: '45/15 Intervals',
		icon: 'dumbbell',
		category: 'Work-Heavy Intervals',
		difficulty: 'Intermediate',
		duration: '12-24 min',
		calorieRange: '150-350',
		overview:
			'The 45/15 protocol — 45 seconds of work with only 15 seconds of rest — is a work-dominant interval format with a punishing 3:1 work-to-rest ratio. The extended work period forces you to develop muscular endurance and lactate tolerance, while the brief rest provides just enough recovery to maintain output without fully recovering. This format bridges the gap between steady-state cardio and sprint intervals, making it ideal for body composition goals and building the kind of conditioning that carries over to sport and daily life.',
		musclesWorked: ['Full Body', 'Muscular Endurance', 'Cardiovascular System'],
		instructions: [
			'Select 4-8 exercises that target different muscle groups to spread the fatigue.',
			'Set your timer: 45 seconds work, 15 seconds rest, for 8-16 rounds.',
			'During the 45-second work window, maintain a steady, controlled pace. This is NOT a sprint.',
			'Use the 15-second rest to transition to the next exercise and take 2-3 deep breaths.',
			'Focus on movement quality over speed. 45 seconds is long enough that form degradation becomes a real risk.',
			'Complete all rounds. Your heart rate will stay elevated throughout — this is by design.',
			'Record which exercises felt too easy or too hard, and adjust for next session.',
		],
		tips: [
			'The 15-second rest is really a transition window, not a recovery window. Choose exercises with minimal setup.',
			'Alternate between upper body, lower body, and core exercises to avoid local muscle failure.',
			'Bodyweight or light weight is ideal. Heavy loads with short rest and long work intervals is a recipe for injury.',
			'If you\'re gasping for air by round 3, your exercise selection is too aggressive. Sub in easier movements.',
			'This format shines with metabolic exercises: kettlebell swings, battle ropes, rowing, cycling.',
			'Track total reps per exercise across sessions. Progressive overload applies to conditioning too.',
		],
		variations: [
			'Strength 45/15: Use moderate dumbbell weight for compound movements. Focus on time under tension, not speed.',
			'Cardio 45/15: Alternate between 2-3 cardio modalities (row, bike, jump rope) to prevent repetitive strain.',
			'Core 45/15: 8 rounds of different core exercises. Dead bugs, planks, Russian twists, hollow holds, etc.',
			'Upper/Lower Split 45/15: Odd rounds = upper body, even rounds = lower body. Balanced and effective.',
			'Descending 45/15: Start at 45/15 and reduce work time each block (45/15 → 40/20 → 35/25 → 30/30).',
		],
		bestFor: ['Body composition', 'Muscular endurance', 'Metabolic conditioning', 'Sport-specific fitness'],
		defaultConfig: { workSeconds: 45, restSeconds: 15, rounds: 8 },
	},
	{
		id: 'custom',
		name: 'Custom Intervals',
		icon: 'sliders-horizontal',
		category: 'Flexible',
		difficulty: 'Beginner',
		duration: 'You decide',
		calorieRange: 'Varies',
		overview:
			'Custom intervals let you design your own work-to-rest protocol for any training goal. Whether you need 10-second explosive sprints with long recovery, 2-minute sustained efforts, or anything in between — this is your blank canvas. The ability to customize intervals is what separates thoughtful training from random exercise. By adjusting three simple variables (work time, rest time, and rounds), you can target completely different energy systems and training adaptations.',
		musclesWorked: ['Depends on exercises chosen'],
		instructions: [
			'Define your goal: strength (long rest), conditioning (short rest), or endurance (equal or less rest).',
			'Set your work interval: 10-15s for power, 20-30s for anaerobic, 45-90s for lactate threshold, 2-5min for aerobic.',
			'Set your rest interval: 3:1 rest-to-work for power, 1:1 for balanced, 1:3 work-to-rest for endurance.',
			'Set your total rounds based on how long you want to train (rounds x (work + rest) = total time).',
			'Choose exercises that match your goal and time domain.',
			'Run a test session. Adjust if it feels too easy (add rounds or reduce rest) or too hard (reduce rounds or add rest).',
			'Log your configuration so you can repeat and progress it over time.',
		],
		tips: [
			'The work-to-rest ratio is the most important variable. It determines which energy system you\'re training.',
			'Power/Speed: 1:3 to 1:5 ratio (e.g., 10s work / 50s rest). Full recovery between maximum efforts.',
			'Anaerobic Capacity: 1:1 to 2:1 ratio (e.g., 30s work / 30s rest). Builds lactate tolerance.',
			'Aerobic Endurance: 3:1 to 4:1 ratio (e.g., 45s work / 15s rest). Sustained effort, minimal recovery.',
			'Start conservative. You can always add rounds or reduce rest next session. You can\'t un-injure yourself.',
			'Pair your interval design with your weekly training plan. Heavy lift days? Go easier on intervals. Rest day tomorrow? Push harder.',
		],
		variations: [
			'Pyramid Intervals: Increase work time each round, then decrease (10s → 20s → 30s → 40s → 30s → 20s → 10s).',
			'Descending Rest: Keep work constant but reduce rest each round (60s rest → 50s → 40s → 30s → 20s).',
			'Density Blocks: Fixed time window (e.g., 5 minutes). Do as much work as possible, rest as needed.',
			'Contrast Intervals: Alternate between high-intensity and low-intensity rounds rather than full rest.',
			'Progressive Overload: Same protocol each week, but add 1 round or reduce rest by 5 seconds.',
		],
		bestFor: ['Personalized training', 'Specific sport preparation', 'Progressive programming', 'Experimentation'],
		defaultConfig: { workSeconds: 30, restSeconds: 15, rounds: 8 },
	},
];

export function getHiitExerciseById(id: string): HiitExercise | undefined {
	return HIIT_EXERCISES.find((e) => e.id === id);
}
