import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserGroups } from '../lib/constants';

export type UserGroup = typeof UserGroups[keyof typeof UserGroups];

export interface User {
  id: string;
  email: string;
  groups: UserGroup[];
}

export interface AuthorizedEvent extends APIGatewayProxyEvent {
  user: User;
}

export interface Photo {
  id: string;
  userId: string;
  originalUrl: string;
  thumbnailUrl: string;
  metadata: {
    originalName: string;
    size: number;
    type: string;
    width?: number;
    height?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Album {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedItem {
  id: string;
  itemType: 'photo' | 'album';
  itemId: string;
  sharedWithUserId: string;
  permissionLevel: 'read' | 'write';
  createdAt: Date;
} 