# ADR 0004: Análise is of a public Vídeo alvo

## Status

Accepted

Supersedes [ADR 0002](0002-analise-only-own-canais.md)

## Context

The job is to gather comments on a target video and turn what is worth using into ideas and spoken scripts for later videos. YouTube comment threads on a public long-form video are public. Requiring a linked Canal (OAuth, “your videos only”) blocked that job and did not match how the Criador actually starts: paste a URL.

Selling still assumes the buyer is someone who will publish the next video. That is positioning, not an ownership check.

## Decision

An Análise is a snapshot of Comentários on one public **Vídeo alvo**, entered by URL. Channel ownership is not required and not verified. **Canal** is out of the domain core until a later decision (e.g. “my channels” or Live) reopens it.

Shorts and Live remain out of Análise (ADR 0001, ADR 0003).

## Consequences

Ingest and UI accept any public long-form URL within plan Limite. Do not fail an Análise because the video is “not yours”. Do not grow Canal, OAuth, or competitor-catalog language as if they were the product.
