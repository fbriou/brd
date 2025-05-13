/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('photos', {
    id: 'uuid',
    user_id: { type: 'uuid', notNull: true },
    original_url: { type: 'text', notNull: true },
    thumbnail_url: { type: 'text', notNull: true },
    metadata: { type: 'jsonb', notNull: true },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('now()'),
    },
  }, {
    constraints: {
      primaryKey: 'id',
    },
  });

  pgm.createTable('albums', {
    id: 'uuid',
    user_id: { type: 'uuid', notNull: true },
    name: { type: 'text', notNull: true },
    description: 'text',
    cover_photo_id: { type: 'uuid', references: 'photos' },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('now()'),
    },
  }, {
    constraints: {
      primaryKey: 'id',
    },
  });

  pgm.createTable('shared_items', {
    id: 'uuid',
    item_type: { 
      type: 'text', 
      notNull: true,
      check: "item_type IN ('photo', 'album')"
    },
    item_id: { type: 'uuid', notNull: true },
    shared_with_user_id: { type: 'uuid', notNull: true },
    permission_level: { 
      type: 'text', 
      notNull: true,
      check: "permission_level IN ('read', 'write')"
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('now()'),
    },
  }, {
    constraints: {
      primaryKey: 'id',
    },
  });

  // Add indexes for better query performance
  pgm.createIndex('photos', 'user_id');
  pgm.createIndex('albums', 'user_id');
  pgm.createIndex('shared_items', ['item_type', 'item_id']);
  pgm.createIndex('shared_items', 'shared_with_user_id');
};

exports.down = pgm => {
  pgm.dropTable('shared_items');
  pgm.dropTable('albums');
  pgm.dropTable('photos');
}; 