import { Elysia } from 'elysia';
import { getTags, createTag, updateTag, deleteTag } from './service';
import { TagModel, UpdateTagModel } from './model';

export const TagRoutes = new Elysia({ prefix: '/tags' })
    // Public route to get all tags
    .get('/', async ({ status }) => {
        const tags = await getTags();
        return status(200, {
            status: 200,
            message: 'Tags retrieved successfully',
            data: tags
        });
    }, {
        detail: {
            tags: ['Tags'],
            summary: 'Get All Tags',
            description: 'Retrieve a list of all available tags.'
        }
    })
    // Admin route to create a new tag
    .post('/', async ({ body, status }) => {
        const newTag = await createTag(body);
        return status(201, {
            status: 201,
            message: 'Tag created successfully',
            data: newTag
        });
    }, {
        body: TagModel,
        admin: true, // Requires admin role
        detail: {
            tags: ['Tags'],
            summary: 'Create Tag',
            description: 'Create a new tag. Requires Admin role.'
        }
    })
    // Admin route to update a tag
    .put('/:id', async ({ params: { id }, body, status }) => {
        const updatedTag = await updateTag(id, body);
        return status(200, {
            status: 200,
            message: 'Tag updated successfully',
            data: updatedTag
        });
    }, {
        body: UpdateTagModel,
        admin: true, // Requires admin role
        detail: {
            tags: ['Tags'],
            summary: 'Update Tag',
            description: 'Update an existing tag. Requires Admin role.',
            params: {
                id: { description: 'The ID of the tag to update.' }
            }
        }
    })
    // Super Admin route to delete a tag
    .delete('/:id', async ({ params: { id }, status }) => {
        await deleteTag(id);
        return status(200, {
            status: 200,
            message: 'Tag deleted successfully'
        });
    }, {
        superAdmin: true, // Requires super admin role
        detail: {
            tags: ['Tags'],
            summary: 'Delete Tag',
            description: 'Delete an existing tag. Requires Super Admin role.',
            params: {
                id: { description: 'The ID of the tag to delete.' }
            }
        }
    });
