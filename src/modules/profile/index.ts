import { Elysia } from 'elysia';
import { getProfile, updateProfile } from './service';
import { UpdateProfileModel } from './model';
import type { BetterAuthUser } from '../auth/types';

export const ProfileRoutes = new Elysia({ prefix: '/profile' })
    .derive(() => {
        return {
            user: null as unknown as BetterAuthUser
        }
    })
    // Get current user's profile
    .get('/', async ({ user, status }) => {
        const profile = await getProfile(user.id);
        return status(200, {
            status: 200,
            message: 'Profile retrieved successfully',
            data: profile
        });
    }, {
        auth: true, // Requires authentication
        detail: {
            tags: ['Profile'],
            summary: 'Get My Profile',
            description: 'Retrieve the profile information for the currently authenticated user.'
        }
    })
    // Update current user's profile
    .put('/', async ({ user, body, status }) => {
        const updatedProfile = await updateProfile(user.id, body);
        return status(200, {
            status: 200,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    }, {
        auth: true, // Requires authentication
        body: UpdateProfileModel,
        detail: {
            tags: ['Profile'],
            summary: 'Update My Profile',
            description: 'Update the profile information (bio, avatar) for the currently authenticated user.'
        }
    });
