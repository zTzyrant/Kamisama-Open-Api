import { PrismaClient } from '@prisma/client';
import type { UpdateProfileModelType } from './model';

const prisma = new PrismaClient();

/**
 * Retrieves a user's profile. If it doesn't exist, it creates one.
 * This acts as a robust fallback for the signup process.
 * @param userId - The ID of the user.
 * @returns The user's profile.
 */
export const getProfile = async (userId: string) => {
    return await prisma.profile.upsert({
        where: { userId },
        update: {},
        create: { userId, bio: '', avatar: '', socials: {} }, // <-- Tambahkan socials default
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    image: true,
                    role: true
                }
            }
        }
    });
};

/**
 * Updates a user's profile.
 * @param userId - The ID of the user.
 * @param data - The data to update.
 * @returns The updated profile.
 */
export const updateProfile = async (userId: string, data: UpdateProfileModelType) => {
    return await prisma.profile.update({
        where: { userId },
        data,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    image: true,
                    role: true
                }
            }
        }
    });
};