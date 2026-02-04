const bcrypt = require('bcrypt');

UsersSchema.pre('save', async function(next) {
  if (!this.isModified('mdp')) return next();
  this.mdp = await bcrypt.hash(this.mdp, 10);
  next();
});
