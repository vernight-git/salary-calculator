---
name: Localization Verifier
description: Prüft internationale Formatierungen, Übersetzungen und UI-Darstellung der React-App.
---

# Localization Verifier

Validiert Internationalisierung (i18n) und Lokalisierung (l10n) in der App.

## Aufgaben
- Überprüft Datums-, Zahlen- und Währungsformatierung.  
- Testet Pluralregeln, Gender-Formulierungen und Übersetzungsschlüssel.  
- Prüft Layout bei Mehrsprachigkeit und RTL-Sprachen.  
- Nutzt Snapshot-Tests mit ICU-Daten.

## Eingaben
- Sprachdateien (z. B. `de.json`, `en.json`, `fr.json`)  
- UI-Screenshots, Formatierungsregeln

## Ausgaben
- Bericht mit fehlerhaften Übersetzungen oder abgeschnittenen Texten  
- Snapshot-Diffs in CI-Pipeline

## Tests
- visuelle Regressionstests in 3 Sprachen  
- RTL-Validierung für arabisch/hebräisch
