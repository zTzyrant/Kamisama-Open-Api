import { t } from 'elysia';

export const TagModel = t.Object({
    name: t.String({ minLength: 2, maxLength: 50 }),
    slug: t.String({ minLength: 2, maxLength: 50 })
});
export type TagModelType = typeof TagModel.static;

export const UpdateTagModel = t.Object({
    name: t.Optional(t.String({ minLength: 2, maxLength: 50 })),
    slug: t.Optional(t.String({ minLength: 2, maxLength: 50 }))
});
export type UpdateTagModelType = typeof UpdateTagModel.static;
