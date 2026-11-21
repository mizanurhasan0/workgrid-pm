import { auth } from '../middlewares';
import { allUpdateLogs, create, get, getCustomOne, getOne, gpCopyTask, gpMoveTask, gpRemove, gpUpdate, timeUpdate, update } from './task.entity';

export default function task() {
  this.route.post('/task', auth, create(this));
  this.route.post('/task/gp/copy', auth, gpCopyTask(this));
  this.route.post('/task/gp/move', auth, gpMoveTask(this));
  this.route.get('/task', auth, get(this));
  // this.route.get('/task/notify/logs/:userId', auth, allLogs(this));
  this.route.get('/task/notify/:userId', auth, allUpdateLogs(this));
  this.route.get('/task/:id', auth, getOne(this));
  this.route.get('/task/drawer/:id', auth, getCustomOne(this));
  this.route.patch('/task/:id', auth, update(this));
  this.route.patch('/task/gp/update', auth, gpUpdate(this));
  // this.route.delete('/task/:id', auth, remove(this));
  this.route.delete('/task/remove/gp', auth, gpRemove(this));
}
export function taskSocket(app) {
  app.register('taskUpdate', timeUpdate);
}