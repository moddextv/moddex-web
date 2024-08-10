import 'swagger-ui-react/swagger-ui.css';
import './docs.css';
import SwaggerUI from 'swagger-ui-react';
import { Metadata } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';

export const metadata: Metadata = {
  title: 'api docs'
}

export default async function SwaggerDocsPage() {
  const spec = await getApiDocs();

  return (
    <main className="container mx-auto max-w-5xl py-16 px-6 flex-grow flex flex-col gap-8">
      <SwaggerUI spec={spec} />
    </main>);
}

const getApiDocs = async () => {
  return createSwaggerSpec({
    apiFolder: '/src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'modchecker api',
        description: `<p>this is a simple api to get information from <a href="https://modchecker.com" target="_blank">modchecker.com</a>.<br />get mods and vips from tracked channels or get the channels where a user is modded / viped in. we also provide an api endpoint to our badges.</p>`,
        version: '1.0'
      },
      servers: [
        { url: 'https://modchecker.com/' }
      ],
      tags: [
        {
          name: 'badges',
          description: 'all about our badges'
        },
        {
          name: 'users',
          description: 'fetch one or multiple tracked users'
        },
        {
          name: 'roles',
          description: 'all about tracked mods/vips'
        }
      ],
      components: {
        schemas: {
          Badge: {
            type: 'object',
            required: ['id', 'name', 'path'],
            properties: {
              id: {
                type: 'integer',
                example: 4
              },
              name: {
                type: 'string',
                example: 'early checker'
              },
              path: {
                type: 'string',
                example: '/badges/early_checker.png'
              }
            }
          },
          User: {
            type: 'object',
            required: [
              'id',
              'login',
              'name',
              'avatar',
              'badges',
              'bio',
              'created'
            ],
            properties: {
              id: {
                type: 'string',
                example: '217986157'
              },
              login: {
                type: 'string',
                example: 'maersux'
              },
              name: {
                type: 'string',
                example: 'maersux',
                description: 'twitch display name'
              },
              avatar: {
                type: 'string',
                example:
                  'https://static-cdn.jtvnw.net/jtv_user_pictures/4058d275-ca87-4cf3-b736-c0392b81b6ed-profile_image-300x300.png'
              },
              discord: {
                type: 'string',
                example: '780910551286546493'
              },
              badges: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Badge'
                }
              },
              bio: {
                type: 'string',
                example: `this random dev guy. if there's a social media platform with this name, it's probably me.`,
                description: 'when the twitch account was created'
              },
              created: {
                type: 'string',
                example: '2018-05-01T18:09:47.000Z',
                description: 'when the twitch account was created'
              },
              updated: {
                type: 'string',
                example: '2024-01-01T00:00:00.000Z',
                description: 'last fetched mods/vips of this channel'
              }
            }
          },
          Role: {
            type: 'object',
            required: ['id', 'login', 'name', 'avatar', 'badges', 'granted'],
            properties: {
              id: {
                type: 'string',
                example: '217986157'
              },
              login: {
                type: 'string',
                example: 'maersux'
              },
              name: {
                type: 'string',
                example: 'maersux'
              },
              avatar: {
                type: 'string',
                example:
                  'https://static-cdn.jtvnw.net/jtv_user_pictures/4058d275-ca87-4cf3-b736-c0392b81b6ed-profile_image-300x300.png'
              },
              badges: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Badge'
                }
              },
              granted: {
                type: 'string',
                example: '2023-01-01T00:00:00.000Z'
              }
            }
          },
          Error: {
            type: 'object',
            required: ['error', 'status'],
            properties: {
              error: {
                type: 'string',
                description: 'error message'
              },
              status: {
                type: 'integer',
                description: 'HTTP status code'
              },
              message: {
                type: 'string',
                description: 'more detailed cause of error'
              }
            }
          }
        }
      }
    }
  });
}