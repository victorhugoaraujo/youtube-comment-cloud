# ADR 0002: Análise only of the Criador’s own Canais

## Status

Accepted

## Context

The YouTube API accepts any public video URL. The domain, however, is a creator looking at *their own* audience to decide what to publish next — not a catalog of other people’s videos.

A Canal in CommentIQ is a YouTube channel the Criador operates and links. An Análise of a Vídeo belongs to that Canal.

## Decision

Without a linked Canal, there is no domain Análise. A Vídeo must belong to one of the Criador’s Canais. Third-party URLs are out of domain even if the API would return comments.

## Consequences

Pasting a URL is not enough. Product, ingest, and UI treat “not your Canal” as invalid, not as a successful Análise of someone else’s audience.
