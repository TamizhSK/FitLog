export interface Exercise {
	exerciseId: string;
	name: string;
	imageUrl: string;
	imageUrls?: {
		'360p': string;
		'480p': string;
		'720p': string;
		'1080p': string;
	};
	bodyParts: string[];
	equipments: string[];
	exerciseType: string;
	targetMuscles: string[];
	secondaryMuscles: string[];
	videoUrl?: string;
	keywords?: string[];
	overview?: string;
	instructions?: string[];
	exerciseTips?: string[];
	variations?: string[];
	relatedExerciseIds?: string[];
}

export interface BodyPart {
	name: string;
	imageUrl: string;
}

export interface Equipment {
	name: string;
	imageUrl: string;
}

export interface Muscle {
	name: string;
}
