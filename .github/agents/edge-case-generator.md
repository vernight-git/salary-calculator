---
name: Edge Case Generator
description: Generiert Sonder- und Grenzfälle zur Absicherung der Berechnungslogik und Systemstabilität.
---

# Edge Case Generator

Führt systematische Tests außerhalb der Standardbereiche durch.

## Aufgaben
- Erzeugt Minijob-, Midijob- und Übergangsbereich-Szenarien.  
- Testet Kombinationen von Freibeträgen, Boni, Zuschlägen.  
- Prüft Verhalten bei Nullwerten, Negativbeträgen oder extremen Einkommen.  
- Generiert Property-Based-Tests (fast-check).

## Eingaben
- Datenmodell der Payroll-Komponenten  
- Regelwerk aus dem Curator

## Ausgaben
- JSON-Testfälle mit erwarteten Referenzwerten  
- Reports mit fehlerhaften Invarianten

## Tests
- 100+ generierte Fälle pro Steuerklasse  
- Mutation-Tests zur Code-Robustheit
