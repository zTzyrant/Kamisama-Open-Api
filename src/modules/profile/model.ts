import { t } from 'elysia';

export const UpdateProfileModel = t.Object({
    bio: t.Optional(t.String({ maxLength: 500 })),
    avatar: t.Optional(t.String({ format: 'uri' })),
    jobs: t.Optional(t.Array(t.String())),
    socials: t.Optional(t.Array(t.Object({
        media: t.String(),
        url: t.String()
    }))),
    nationality: t.Optional(t.String()),
    website: t.Optional(t.String({ format: 'uri' })),
    phone: t.Optional(t.String())
});
export type UpdateProfileModelType = typeof UpdateProfileModel.static;