import { Elysia } from 'elysia';
import { getCategories, createCategory, updateCategory, deleteCategory } from './service';
import { CategoryModel, UpdateCategoryModel } from './model';

export const CategoryRoutes = new Elysia({ prefix: '/categories' })
    // Public route to get all categories
    .get('/', async ({ status }) => {
        const categories = await getCategories();
        return status(200, {
            status: 200,
            message: 'Categories retrieved successfully',
            data: categories
        });
    }, {
        detail: {
            tags: ['Categories'],
            summary: 'Get All Categories',
            description: 'Retrieve a list of all available categories.'
        }
    })
    // Admin route to create a new category
    .post('/', async ({ body, status }) => {
        const newCategory = await createCategory(body);
        return status(201, {
            status: 201,
            message: 'Category created successfully',
            data: newCategory
        });
    }, {
        body: CategoryModel,
        admin: true, // Requires admin role
        detail: {
            tags: ['Categories'],
            summary: 'Create Category',
            description: 'Create a new category. Requires Admin role.'
        }
    })
    // Admin route to update a category
    .put('/:id', async ({ params: { id }, body, status }) => {
        const updatedCategory = await updateCategory(id, body);
        return status(200, {
            status: 200,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    }, {
        body: UpdateCategoryModel,
        admin: true, // Requires admin role
        detail: {
            tags: ['Categories'],
            summary: 'Update Category',
            description: 'Update an existing category. Requires Admin role.',
            params: {
                id: { description: 'The ID of the category to update.' }
            }
        }
    })
    // Super Admin route to delete a category
    .delete('/:id', async ({ params: { id }, status }) => {
        await deleteCategory(id);
        return status(200, {
            status: 200,
            message: 'Category deleted successfully'
        });
    }, {
        superAdmin: true, // Requires super admin role
        detail: {
            tags: ['Categories'],
            summary: 'Delete Category',
            description: 'Delete an existing category. Requires Super Admin role.',
            params: {
                id: { description: 'The ID of the category to delete.' }
            }
        }
    });
