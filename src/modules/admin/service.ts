// src/modules/admin/service.ts
import { prisma } from '../../lib/prisma';
import { RegisterUserDto } from '../auth/model'; // Re-use DTO for user creation
import { AuthService } from '../auth/service'; // Reuse existing auth service functions

export class AdminService {
  // --- User Management ---

  static async getAllUsers() {
    return prisma.user.findMany({
      include: {
        role: true,
        sessions: {
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
        },
      },
    });
  }

  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        sessions: {
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
        },
      },
    });
  }

  static async createUser(userData: RegisterUserDto, roleName: string) {
    // Re-use AuthService.register for hashing password and basic user creation
    const newUser = await AuthService.register(userData);

    // Update user's role if a specific role is provided
    if (roleName) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        throw new Error(`Role '${roleName}' not found.`);
      }
      await prisma.user.update({
        where: { id: newUser.id },
        data: { roleId: role.id },
      });
      // Re-fetch user with updated role
      return prisma.user.findUnique({ where: { id: newUser.id }, include: { role: true } });
    }
    return newUser;
  }

  static async updateUser(userId: string, data: { name?: string; email?: string; username?: string; roleName?: string }) {
    const updateData: any = { ...data };
    if (data.roleName) {
      const role = await prisma.role.findUnique({ where: { name: data.roleName } });
      if (!role) {
        throw new Error(`Role '${data.roleName}' not found.`);
      }
      updateData.roleId = role.id;
      delete updateData.roleName; // Remove roleName from updateData as it's handled
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true },
    });
  }

  static async deleteUser(userId: string) {
    // Soft delete user
    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  // --- Session Management ---

  static async getAllSessions() {
    return prisma.userSession.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
      where: {
        expiresAt: {
          gt: new Date(), // Only active sessions
        },
      },
    });
  }

  static async revokeUserSession(userId: string, sessionId: string) {
    return AuthService.revokeSession(userId, sessionId);
  }

  static async revokeAllUserSessions(userId: string) {
    return AuthService.revokeAllSessions(userId);
  }

  // --- Role Management ---

  static async getAllRoles() {
    return prisma.role.findMany();
  }

  static async getRoleById(roleId: string) {
    return prisma.role.findUnique({ where: { id: roleId } });
  }

  static async createRole(name: string, description?: string) {
    const existingRole = await prisma.role.findUnique({ where: { name } });
    if (existingRole) {
      throw new Error(`Role '${name}' already exists.`);
    }
    return prisma.role.create({ data: { name, description } });
  }

  static async updateRole(roleId: string, data: { name?: string; description?: string }) {
    return prisma.role.update({
      where: { id: roleId },
      data: data,
    });
  }

  static async deleteRole(roleId: string) {
    // Check if any users are assigned to this role before deleting
    const usersWithRole = await prisma.user.count({ where: { roleId: roleId } });
    if (usersWithRole > 0) {
      throw new Error('Cannot delete role: Users are still assigned to this role.');
    }
    return prisma.role.delete({ where: { id: roleId } });
  }
}
