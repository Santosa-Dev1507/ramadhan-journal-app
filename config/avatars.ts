// Avatar configuration
export const AVATARS = {
    male: '/avatars/male.png',
    female: '/avatars/female.png',
} as const;

export type AvatarId = keyof typeof AVATARS;

export function getAvatarUrl(avatarId: AvatarId): string {
    return AVATARS[avatarId];
}

// Helper to determine default avatar based on gender
export function getDefaultAvatar(gender: 'male' | 'female'): AvatarId {
    return gender === 'male' ? 'male' : 'female';
}
