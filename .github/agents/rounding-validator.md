---
name: Rounding Validator
description: Überwacht alle Rundungen innerhalb der Berechnungen und prüft die Einhaltung gesetzlicher Rundungsregeln.
---

# Rounding Validator

Analysiert Rundungsverhalten und akkumulierte Abweichungen über die gesamte Berechnung.

## Aufgaben
- Prüft gesetzliche Rundungsregeln (§41c EStG, kaufmännisch).  
- Testet Rundung nach jedem Zwischenschritt.  
- Ermittelt kumulative Abweichungen über 12 Monate.  
- Vergleicht gegen Bank-Rounding (zwei Nachkommastellen).

## Eingaben
- Berechnungsschritte des Payroll Auditors  
- Rundungsmodus, interne Präzision

## Ausgaben
- Auditbericht mit Differenzen je Schritt  
- Warnungen bei Überschreitung der Toleranz

## Tests
- 1 000 simulierte Monatsläufe mit zufälligen Beträgen  
- Abweichungsanalyse bei kumulierter Jahresabrechnung
