import { BadRequest, InternalServerError, NotFound } from '@/app/api/ApiErrors';
import { User } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';
import { getChannelVips } from '@/utils/roles/channel';
import { getUserVips } from '@/utils/roles/user';
import { filterUsers, getUsersFromDb, getUsersFromDbById } from '@/utils/user';
import { isInteger } from '@/utils/validation';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest, context: any) => {
  const {
    channel,
    channel_id: channelId,
    user,
    user_id: userId
  } = Object.fromEntries(new URL(request.url).searchParams);

  try {
    if (channelId) {
      if (!isInteger(channelId)) {
        return BadRequest(`parameter channel_id is expected to be an integer`);
      }

      const channels: User[] = await getUsersFromDbById([channelId]);
      const channelFromDb = channels[0];
      if (!channelFromDb) {
        return NotFound(`no tracked channel found with id ${channelId}`);
      }

      const vips = await getChannelVips(channelFromDb);
      const filteredVips = await filterUsers(vips);
      if (!filteredVips) {
        return NotFound(
          `no tracked vips found for channel with id ${channelId}`
        );
      }

      return NextResponse.json(filteredVips);
    }

    if (channel) {
      const channels: User[] = await getUsersFromDb([channel.toLowerCase()]);
      const channelFromDb = channels[0];
      if (!channelFromDb) {
        return NotFound(`no tracked channel found with login ${channel}`);
      }

      const vips = await getChannelVips(channelFromDb);
      const filteredVips = await filterUsers(vips);
      if (!filteredVips) {
        return NotFound(
          `no tracked vips found for channel with login ${channel}`
        );
      }

      return NextResponse.json(filteredVips);
    }

    if (userId) {
      if (!isInteger(userId)) {
        return BadRequest(`parameter user_id is expected to be an integer`);
      }

      const users: User[] = await getUsersFromDbById([userId]);
      const userFromDb = users[0];
      if (!userFromDb) {
        return NotFound(`no tracked user found with id ${userId}`);
      }

      const vips = await getUserVips(userFromDb);
      const filteredVips = await filterUsers(vips);
      if (!filteredVips) {
        return NotFound(`no tracked vips found for user with id ${userId}`);
      }

      return NextResponse.json(filteredVips);
    }

    if (user) {
      const users: User[] = await getUsersFromDb([user.toLowerCase()]);
      const userFromDb = users[0];
      if (!userFromDb) {
        return NotFound(`no tracked user found with login ${user}`);
      }

      const vips = await getUserVips(userFromDb);
      const filteredVips = await filterUsers(vips);
      if (!filteredVips) {
        return NotFound(`no tracked vips found for user with login ${user}`);
      }

      return NextResponse.json(filteredVips);
    }

    return BadRequest(
      `one of these parameter is expected: channel, channel_id, user, user_id`
    );
  } catch (error) {
    logger.error('error on /api/v1/user/vips', error);
    return InternalServerError('something went wrong while fetching vips');
  }
};

/**
 * @swagger
 * /api/v1/vips:
 *  get:
 *    tags:
 *      - roles
 *    description: |
 *      returns tracked vips of a given channel or a list of channels a given user has vip privileges
 *    parameters:
 *      - name: channel
 *        in: query
 *        description: get vips from a tracked channel
 *        schema:
 *          type: string
 *      - name: channel_id
 *        in: query
 *        description: get vips from a tracked channel by id
 *        schema:
 *          type: integer
 *      - name: user
 *        in: query
 *        description: get tracked channels where a user has vip privileges
 *        schema:
 *          type: string
 *      - name: user_id
 *        in: query
 *        description: get tracked channels where a user by id has vip privileges
 *        schema:
 *          type: integer
 *    responses:
 *      '200':
 *        description: successful operation
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Role'
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
 *                  example: parameter channel_id is expected to be an integer
 *      '404':
 *        description: badge not found
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
 *                  example: no users found
 */
