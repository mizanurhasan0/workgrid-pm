import { auth } from '../middlewares';
import { create, get, getOne, entry, remove, updateChat, call, callMediaUpdate, PinChat } from './chat.entity';

export function chat() {
  this.route.post('/chat', auth, create(this));
  this.route.get('/chat', auth, get(this));
  this.route.get('/chat/:id', auth, getOne(this));
  this.route.patch('/chat/:id', auth, updateChat(this));
  // this.route.patch('/chat/leave/:id', auth, leave(this));
  this.route.patch('/chat/pin/:id', auth, PinChat(this));
  this.route.delete('/chat/:id', auth, remove(this));
}

export function chatSocket(app) {
  app.register('entry', entry);
  app.register('call', call);
  app.register('callMediaUpdate', callMediaUpdate);
}