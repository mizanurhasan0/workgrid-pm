import { auth, checkRole } from '../middlewares';
import { create, getAll, getOne, remove, update } from './role.entity';

/**
 * @description this role function initiate the routes to make crud operations on role schema.
 */
export default function role() {


  /**
  * POST /role
  * @description this route is used to create a role.
  * @response {Object} 200 - the role.
  */
  this.route.post('/role', auth, checkRole(['owner', 'admin']), create(this));


  /**
  * GET /role
  * @description this route is used to get all roles or a single role, to get single role roulte should have query.
  * @response {Object} 200 - the roles.
  */
  this.route.get('/role', auth, getAll(this));


  /**
  * GET /role/:id
  * @description this route is used to find one role by id.
  * @response {Object} 200 - the role.
  */
  this.route.get('/role/:id', auth, getOne(this));

  /**
  * DELETE /role/:id
  * @description this route is used to delete one role by id.
  * @response {Object} 200 - the role.
  */
  this.route.delete('/role/:id', auth, checkRole(['owner', 'admin']), remove(this));


  /**
   * PATCH /role/:id
   * @description this route is used to update one role by id.
   * @response {Object} 200 -the role
   */
  this.route.patch('/role/:id', auth, checkRole(['owner', 'admin']), update(this));
}

