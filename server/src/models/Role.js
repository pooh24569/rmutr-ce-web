const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  permissions: [{ type: String }], // ['manage_class','view_homework','kick_member']
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scope: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, 
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
