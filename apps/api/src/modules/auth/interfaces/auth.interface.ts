import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userRoles?: Array<{
      id: string;
      userId: string;
      roleId: string;
      createdAt: Date;
      role: {
        id: string;
        name: string;
        description?: string;
        isActive: boolean;
        createdAt: Date;
      };
    }>;
  };
}
