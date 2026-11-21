import { auth } from '../middlewares';
import { create, getAll } from './invitations.entity';

export default function invitations() {

  /*
   * POST /invitation
   * @description this route is used to create an invitaion.
   * @response {Object} 200 - the invitaion.
   */
  this.route.post('/invitation', auth, create(this));

  /*
 * POST /invitation
 * @description this route is used to create an invitaion.
 * @response {Object} 200 - the invitaion.
 */
  this.route.get('/invitation', auth, getAll(this));

}