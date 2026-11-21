import { auth } from '../middlewares';
import { get, updateRead, update, createMsg, getAttachAndLink, getMessages, addReaction, removeReaction, reaction } from './message.entity';

export function message() {
  this.route.get('/message', auth, get(this));
  this.route.get('/message/:chatId', auth, getMessages(this));
  this.route.get('/message/attach/:chatId', auth, getAttachAndLink(this));
  this.route.post('/message', auth, createMsg(this));
  this.route.patch('/message/:chatId', auth, updateRead(this));
  this.route.put('/message/:id/reaction', auth, addReaction(this));
  this.route.delete('/message/:id/reaction', auth, removeReaction(this));
  // this.route.delete('/message/:id', auth, deleteMSG(this));
}

export function messageSocket(app) {
  // app.register('message', create);
  app.register('messageUpdate', update);
  app.register('messageReaction', reaction);
}