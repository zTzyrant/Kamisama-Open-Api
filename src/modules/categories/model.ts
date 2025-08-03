import { t } from 'elysia';

export const CategoryModel = t.Object({
    name: t.String({ minLength: 2, maxLength: 50 }),
    slug: t.String({ minLength: 2, maxLength: 50 })
});
export type CategoryModelType = typeof CategoryModel.static;

export const UpdateCategoryModel = t.Object({
    name: t.Optional(t.String({ minLength: 2, maxLength: 50 })),
    slug: t.Optional(t.String({ minLength: 2, maxLength: 50 }))
});
export type UpdateCategoryModelType = typeof UpdateCategoryModel.static;
