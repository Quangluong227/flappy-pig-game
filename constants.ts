
export const GAME_WIDTH: number = 384; // Typical retro game width
export const GAME_HEIGHT: number = 600; // Taller for portrait feel

export const PIG_SIZE_W: number = 50;
export const PIG_SIZE_H: number = 40;
export const PIG_X_POSITION: number = GAME_WIDTH / 4; // Pig stays fixed horizontally

export const GRAVITY: number = 0.4; // Acceleration downwards
export const FLAP_VELOCITY: number = -8; // Instantaneous upward velocity on flap
export const MAX_VELOCITY: number = 10; // Terminal velocity (downwards)
export const MIN_VELOCITY: number = -10; // Max upward flap velocity

export const PIPE_WIDTH: number = 70;
export const PIPE_GAP_HEIGHT: number = 150; // Vertical space for pig to pass
export const PIPE_SPAWN_X: number = GAME_WIDTH; // Spawn pipes at the right edge
export const PIPE_SPACING: number = 220; // Horizontal distance between pipes

export const INITIAL_PIPE_SPEED: number = 2.5;
export const PIPE_SPEED_INCREMENT: number = 0.05; // Speed increase per score point

export const GROUND_HEIGHT: number = 80;
export const SKY_HEIGHT: number = GAME_HEIGHT - GROUND_HEIGHT;

export const CLOUD_COUNT: number = 5;
export const CLOUD_MIN_Y: number = 20;
export const CLOUD_MAX_Y: number = SKY_HEIGHT / 2;
export const CLOUD_MIN_SPEED: number = 0.2;
export const CLOUD_MAX_SPEED: number = 0.5;