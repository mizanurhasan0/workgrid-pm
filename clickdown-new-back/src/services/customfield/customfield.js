import { auth } from '../middlewares';
import { create, get, getOne, remove, removeCF, update } from './customfield.entity';

export default function custsomfield() {
  this.route.post('/cf', auth, create(this));
  this.route.get('/cf', auth, get(this));
  this.route.get('/cf/:id', auth, getOne(this));
  this.route.patch('/cf/:id', auth, update(this));
  this.route.delete('/cf/:id', auth, remove(this));
  this.route.delete('/cf/del/:id', auth, removeCF(this));

}