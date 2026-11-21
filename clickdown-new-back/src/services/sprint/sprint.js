import { auth } from '../middlewares';
import { create, dateUpdate, get, getOne, remove, update } from './sprint.entity';

export default function sprint() {
  this.route.post('/sprint', auth, create(this));
  this.route.get('/sprint', auth, get(this));
  this.route.get('/sprint/:id', auth, getOne(this));
  this.route.patch('/sprint/:id', auth, update(this));
  this.route.patch('/sprint', auth, dateUpdate(this));
  this.route.delete('/sprint/:id', auth, remove(this));
}