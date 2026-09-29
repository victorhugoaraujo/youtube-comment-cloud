# ADR 0003: No Análise of Shorts

## Status

Accepted

## Context

YouTube treats a Short as a video. CommentIQ’s job is deciding what long-form to publish next from audience comments on recorded videos. The creator does not want Short analysis in the product.

## Decision

A Short is not a Vídeo in this domain. There is no Análise of Shorts. Ingest and UI reject Short URLs the same way they reject third-party URLs and Live.

## Consequences

Do not add Short-specific sentiment, themes, or scripts. Do not silently analyze a Short as if it were a long-form Vídeo.
