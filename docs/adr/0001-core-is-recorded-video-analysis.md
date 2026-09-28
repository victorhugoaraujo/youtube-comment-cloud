# ADR 0001: Core is recorded-video Análise

## Status

Accepted

## Context

The product has two surfaces: Análise of a published Vídeo (comment pull, sentiment, themes, ideas, spoken script) and Live (chat polling, overlay). Grilling confirmed they are different concepts. The creator’s job-to-be-done is deciding what to publish next from audience comments on recorded videos.

## Decision

CommentIQ’s domain core is Análise of a recorded Vídeo. Live and Overlay stay in the product as-is but are out of modeling and roadmap focus until we explicitly scale Live.

Do not introduce Chat or Nuvem as domain nouns. Do not grow Live-only language, features, or glossary until that moment.

## Consequences

Work on comment ingest, sentiment/Hater, Tema thresholds, Ideia, and Roteiro is in-bounds. Live work is maintenance only unless a later decision reopens this ADR.
