import { t } from 'elysia';

export const UpdateProfileModel = t.Object({
    bio: t.Optional(t.String({ maxLength: 500 })),
    avatar: t.Optional(t.String({ format: 'uri' })),
    socials: t.Optional(t.Any()) // <-- Bidang baru
});
export type UpdateProfileModelType = typeof UpdateProfileModel.static;