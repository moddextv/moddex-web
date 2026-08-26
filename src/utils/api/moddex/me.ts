import { call } from '@/utils/api/moddex/client';

export const getUserIgnored = (userId: string) =>
  call<{ userId: string; ignored: boolean }>('/v1/me/opt-out', {
    authenticated: true,
    actor: userId
  });

export const setUserIgnored = (userId: string, ignored: boolean) =>
  call<{ userId: string; ignored: boolean; updated: boolean }>('/v1/me/opt-out', {
    authenticated: true,
    method: 'PUT',
    actor: userId,
    body: { ignored }
  });

export const getUserPermissionLevel = (userId: string) =>
  call<{ userId: string; permission: number }>('/v1/me', {
    authenticated: true,
    actor: userId
  });

export const getUserChatBadges = <T>(userId: string) =>
  call<{ userId: string; available: T; selected: string | null }>('/v1/me/chat-badges', {
    authenticated: true,
    actor: userId
  });

export const setUserChatBadge = (userId: string, badge: string) =>
  call<{ userId: string; badge: string | null }>('/v1/me/chat-badge', {
    authenticated: true,
    method: 'PUT',
    actor: userId,
    body: { badge }
  });

export const setUserSocial = (userId: string, network: string, externalId: string) =>
  call<{ userId: string; network: string; externalId: string }>(
    `/v1/me/socials/${encodeURIComponent(network)}`,
    { authenticated: true, method: 'PUT', actor: userId, body: { externalId } }
  );

export const clearUserSocial = (userId: string, network: string) =>
  call<{ userId: string; network: string; removed: boolean }>(
    `/v1/me/socials/${encodeURIComponent(network)}`,
    { authenticated: true, method: 'DELETE', actor: userId }
  );

export const getChannelConnection = (channelId: string) =>
  call<{
    channelId: string;
    connected: boolean;
    everConnected: boolean;
    scopes: string | null;
    connectedAt: string | null;
    revokedAt: string | null;
    syncedAt: string | null;
  }>('/v1/me/connection', { authenticated: true, actor: channelId });

export const setChannelConnection = (channelId: string, scopes: string[]) =>
  call<{ channelId: string; connected: boolean; scopes: string }>('/v1/me/connection', {
    authenticated: true,
    method: 'PUT',
    actor: channelId,
    body: { scopes }
  });

export const clearChannelConnection = (channelId: string) =>
  call<{ channelId: string; connected: boolean; changed: boolean }>('/v1/me/connection', {
    authenticated: true,
    method: 'DELETE',
    actor: channelId
  });

export const setModeratedChannels = (
  userId: string,
  channels: { id: string; login: string }[],
  complete: boolean
) =>
  call<{ userId: string; channels: number; revoked: number; complete: boolean }>(
    '/v1/me/moderated-channels',
    { authenticated: true, method: 'POST', actor: userId, body: { channels, complete } }
  );
