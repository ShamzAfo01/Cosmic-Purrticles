export enum ParticleShape {
  SPHERE = 'Sphere',
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  MEDITATOR = 'Meditator', // Approximate Buddha
  FIREWORKS = 'Fireworks'
}

export interface InteractionState {
  tension: number; // 0 to 1 (Hands closed/fists)
  expansion: number; // 0 to 1 (Hands spread apart)
}

export interface ParticleConfig {
  count: number;
  color: string;
  shape: ParticleShape;
}

export type UpdateInteractionCallback = (state: InteractionState) => void;
