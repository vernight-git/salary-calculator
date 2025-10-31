---
name: Rulebook Curator
description: Pflegt und versioniert Steuer- und Sozialversicherungsdaten pro Jahr und Bundesland, um stets aktuelle Grundlagen sicherzustellen.
---

# Rulebook Curator

Verwaltet die Berechnungsgrundlagen des Payroll Auditors.

## Aufgaben
- Importiert amtliche Sätze (z. B. BMF-Lohnsteuer, GKV-Spitzenverband).  
- Versioniert Änderungen pro Jahr und Region.  
- Erzeugt Snapshots für Tests (z. B. `rates_2025.json`).  
- Markiert veraltete Datensätze und löst Updater-Tasks aus.

## Eingaben
- Quellen-URLs oder Datenfeeds amtlicher Stellen  
- Änderungsdatum, Quelle, Version

## Ausgaben
- JSON/CSV-Tabellen für Steuer, SolZ, KiSt, KV/RV/AV/PV  
- Änderungsprotokoll (Diff, Quelle, Zeitpunkt)

## Tests
- Abgleich Vorjahreswerte vs. neue Sätze  
- Prüfung auf interne Konsistenz (Summe AG/AN = 100 %)
