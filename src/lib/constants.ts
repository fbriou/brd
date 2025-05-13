export const UserGroups = {
  ADMIN: 'admin',
  PREMIUM: 'premium',
  BASIC: 'basic'
} as const;

export const Permissions = {
  PHOTOS: {
    CREATE: 'photos:create',
    DELETE: 'photos:delete',
    SHARE: 'photos:share',
    LIST_ALL: 'photos:list-all'
  },
  ALBUMS: {
    CREATE: 'albums:create',
    DELETE: 'albums:delete',
    SHARE: 'albums:share'
  },
  USERS: {
    MANAGE: 'users:manage',
    DELETE: 'users:delete'
  }
} as const;

export const GroupPermissions = {
  [UserGroups.ADMIN]: [
    ...Object.values(Permissions.PHOTOS),
    ...Object.values(Permissions.ALBUMS),
    ...Object.values(Permissions.USERS)
  ],
  [UserGroups.PREMIUM]: [
    Permissions.PHOTOS.CREATE,
    Permissions.PHOTOS.DELETE,
    Permissions.PHOTOS.SHARE,
    Permissions.ALBUMS.CREATE,
    Permissions.ALBUMS.DELETE,
    Permissions.ALBUMS.SHARE
  ],
  [UserGroups.BASIC]: [
    Permissions.PHOTOS.CREATE,
    Permissions.PHOTOS.DELETE
  ]
} as const; 