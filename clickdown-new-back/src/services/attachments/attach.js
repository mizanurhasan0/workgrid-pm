import { auth } from '../middlewares';
import { get, createAttach } from './attach.entity';

export function attach() {
  this.route.get('/attachment', auth, get(this));
  this.route.post('/attachment', auth, createAttach(this));
}
