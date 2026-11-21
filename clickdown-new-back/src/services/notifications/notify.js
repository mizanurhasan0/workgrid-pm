import { auth } from '../middlewares';
import { unreadCount, markRead, markAllRead, archive, restore, importStates } from './notify.entity';

/**
 * Per-user notification state. The list itself is GET /task/notify/:userId (it now includes
 * `read` and `archived` for the current user).
 */
export default function notification() {
  this.route.get('/notification/unread-count', auth, unreadCount(this));
  this.route.patch('/notification/read-all', auth, markAllRead(this));
  this.route.post('/notification/import', auth, importStates(this));
  this.route.patch('/notification/:id/read', auth, markRead(this));
  this.route.patch('/notification/:id/archive', auth, archive(this));
  this.route.patch('/notification/:id/restore', auth, restore(this));
}
