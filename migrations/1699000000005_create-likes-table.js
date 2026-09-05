exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('likes', 'unique_likes_per_user', 'UNIQUE(comment_id, owner)');
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
