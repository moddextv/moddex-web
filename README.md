# moddex

A reverse index of Twitch moderator and VIP roles, at
[moddex.tv](https://moddex.tv).

Twitch only lets a broadcaster see their own mod and VIP list. moddex answers
the inverse question — given an account, which channels does it hold a role on.
The index is crowdsourced: looking up a channel scrapes its lists, which is what
lets an account's page say where it moderates.

This repository is the web frontend. It reads everything from `api.moddex.tv`.

Documentation for the whole project lives in the `moddex-workspace` repository.
