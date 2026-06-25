# Codex Next Steps for GeoAware Bible

## Objective

Upgrade the MVP into a true location-aware Bible experience without breaking the current manual country simulation.

## Required work

1. Add a privacy-conscious geolocation permission flow.
2. Connect reverse geocoding through a configurable provider key or a no-key provider where acceptable.
3. Resolve country code from coordinates.
4. Map country code to languageProfiles.
5. Preserve manual override as the final user authority.
6. Add localStorage persistence for preferred country and language.
7. Keep placeholder translations unless a source is verified as open-license or public-domain.
8. Add tests for country profile fallback and translation lookup.

## Guardrails

- Do not add copyrighted Bible text.
- Do not hardcode private API keys.
- Do not remove the current reader UI.
- Do not remove manual language selection.
- Keep the first experience simple and premium.

## Definition of done

A user can open the app, grant location permission, receive a recommended Scripture language, manually override it, refresh the page, and keep the selected preference.
