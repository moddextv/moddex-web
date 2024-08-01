import { BadRequest, InternalServerError, NotFound } from '@/app/api/ApiErrors';
import { User } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';
import { constants } from '@/utils/constants';
import {
  filterUsers,
  getUsersByBadgeId,
  getUsersByBadgeName,
  getUsersFromDb,
  getUsersFromDbById
} from '@/utils/user';
import { isInteger } from '@/utils/validation';
import { NextResponse } from 'next/server';

export const GET = async (request: Request, context: any) => {
  const { id, login, badgeId, badgeName } = Object.fromEntries(
    new URL(request.url).searchParams
  );

  try {
    if (id) {
      const idItems = id.split(/\s*,\s*/);
      if (idItems.length > constants.maxItemsPerRequest) {
        return BadRequest(
          `the maximum amount of ids is ${constants.maxItemsPerRequest}.`
        );
      }
      const users = await getUsersFromDbById(idItems);
      return filterResults(users, 'id', id);
    }

    if (login) {
      const loginItems = login.split(/\s*,\s*/);
      if (loginItems.length > constants.maxItemsPerRequest) {
        return BadRequest(
          `the maximum amount of logins is ${constants.maxItemsPerRequest}.`
        );
      }
      const users = await getUsersFromDb(loginItems);
      return filterResults(users, 'login', login);
    }

    if (badgeId) {
      if (!isInteger(badgeId)) {
        return BadRequest(`parameter badgeId is expected to be an integer`);
      }
      const users = await getUsersByBadgeId(decodeURIComponent(badgeId));
      return filterResults(users, 'badgeId', badgeId);
    }

    if (badgeName) {
      const users = await getUsersByBadgeName(decodeURIComponent(badgeName));
      return filterResults(users, 'badgeName', badgeName);
    }

    return BadRequest(
      'one parameter is expected: id, login, badgeId, badgeName'
    );
  } catch (error) {
    logger.error('error on /api/v1/users', error);
    return InternalServerError('something went wrong while fetching users');
  }
};

const filterResults = async (users: User[], paramName: string, param: string) => {
  const filteredUsers = await filterUsers(users);

  if (!filteredUsers.length) {
    return NotFound(`no user found with ${paramName} ${param}`);
  }

  return NextResponse.json(filteredUsers);
};

/**
 * @swagger
 * /api/v1/users:
 *  get:
 *    tags:
 *      - users
 *    description: |
 *      returns tracked users. filter by id, login, badgeId or badgeName
 *
 *      **one parameter is required**
 *    parameters:
 *      - name: id
 *        in: query
 *        description: search users by id - chainable up to 15 users separated by ,
 *        schema:
 *          type: string
 *      - name: login
 *        in: query
 *        description: search users by login - chainable up to 15 users separated by ,
 *        schema:
 *          type: string
 *      - name: badgeId
 *        in: query
 *        description: search users by badgeId
 *        schema:
 *          type: integer
 *      - name: badgeName
 *        in: query
 *        description: search users by badgeName
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: successful operation
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      '400':
 *        description: invalid input
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: bad request
 *                status:
 *                  type: integer
 *                  example: 400
 *                message:
 *                  type: string
 *                  example: parameter badgeId is expected to be an integer
 *      '404':
 *        description: user not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: not found
 *                status:
 *                  type: integer
 *                  example: 404
 *                message:
 *                  type: string
 *                  example: no user found
 */
