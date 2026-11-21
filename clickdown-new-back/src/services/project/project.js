import { auth } from '../middlewares';
import { create, get, getOne, getSpecific, getStatus, remove, shortUpdate, update } from './project.entity';

export default function project() {
  this.route.get('/project', auth, get(this));
  this.route.get('/projects', auth, getSpecific(this));
  this.route.post('/project', auth, create(this));
  this.route.get('/project/:id', auth, getOne(this));
  this.route.get('/project/status/:id', auth, getStatus(this));
  this.route.patch('/project/:id', auth, update(this));
  this.route.patch('/project/short/:id', auth, shortUpdate(this));
  this.route.delete('/project/:id', auth, remove(this));
}