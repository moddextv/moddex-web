import { BadRequest, InternalServerError, NotFound } from '@/app/api/ApiErrors';
import { db } from '@/misc/Database';
import { Badge } from '@/misc/Interfaces';
import { logger } from '@/misc/Logger';
import { isInteger } from '@/utils/validation';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest, context: any) => {
  const { id, name } = Object.fromEntries(new URL(request.url).searchParams);

  try {
    if (id || name) {
      if (id && !isInteger(id)) {
        return BadRequest(`parameter id is expected to be an integer`);
      }

      const condition = id ? 'id' : 'name';
      const value = id || name;
      const badge: Badge = await db.queryOne(
        `SELECT id, name, path FROM badges WHERE ${condition}=?`,
        [value]
      );

      if (!badge) {
        return NotFound(`no badge with found ${condition} ${value}`);
      }

      return NextResponse.json(badge);
    }

    const badges: Badge[] = await db.query('SELECT id, name, path FROM badges');
    if (!badges.length) {
      return InternalServerError('something went wrong while fetching badges');
    }
    return NextResponse.json(badges);
  } catch (error) {
    logger.error('error on /api/v1/badges', error);
    return InternalServerError('something went wrong while fetching badge');
  }
};

/**
 * @swagger
 * /api/v1/badges:
 *  get:
 *    tags:
 *      - badges
 *    description: |
 *      returns badges with their id, name and path.
 *    parameters:
 *      - name: id
 *        in: query
 *        description: search badges by id
 *        schema:
 *          type: integer
 *      - name: name
 *        in: query
 *        description: search badges by name
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: successful operation
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Badge'
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
 *                  example: parameter id is expected to be an integer
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
 *                  example: no badge found
 */
