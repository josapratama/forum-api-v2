export const up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.addConstraint('threads', 'fk_threads_owner', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

export const down = (pgm) => {
  pgm.dropTable('threads');
};
