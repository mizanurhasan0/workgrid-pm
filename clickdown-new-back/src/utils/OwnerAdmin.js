import Role from '../services/role/role.schema';
import User from '../services/user/user.schema';

/**
 * Users who should receive realtime events for a project or task: every owner and admin,
 * plus the given members.
 * @param {Object} options
 * @param {boolean} [options.ids=false] Return id strings instead of user documents.
 * @param {Array} [options.members=[]] Member ids or populated user documents.
 * @returns {Promise<Array>} Unique ids or user documents. Empty array on failure.
 */
async function OwnerAdmins({ ids = false, members = [] } = {}) {
  try {
    const roles = await Role.find({ name: { $in: ['owner', 'admin'] } }).select('_id').lean();
    const memberIds = (members || []).map((m) => String(m?._id ?? m));
    const filter = {
      $or: [
        { role: { $in: roles.map((r) => r._id) } },
        { _id: { $in: memberIds } },
      ],
    };
    if (ids) {
      const found = await User.find(filter).select('_id').lean();
      return [...new Set(found.map((u) => String(u._id)))];
    }
    return User.find(filter);
  }
  catch (error) {
    console.error(error);
    return [];
  }
}

export default OwnerAdmins;
