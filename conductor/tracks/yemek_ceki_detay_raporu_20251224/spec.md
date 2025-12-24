# Spec: Add 'Gelir' column to 'Yemek Ceki Detay Raporu'

## Objective

Add a new column "Gelir" (Income) to the "Yemek Çeki Kategorileri Detay Raporu" (Meal Voucher Categories Detail Report) screen, and populate it with calculated income data.

## Background

The "Yemek Çeki Kategorileri Detay Raporu" displays detailed information about meal voucher invoices. The business needs to see the income associated with each meal voucher category and date range directly in this report to better analyze profitability.

## Requirements

### Backend

1.  **API Modification:**
    *   The API endpoint that serves the data for the "Yemek Çeki Kategorileri Detay Raporu" must be modified to include a new field named `Gelir`.
    *   The `Gelir` field should be of a numeric type (Decimal or Float), consistent with the `Tutar` field.

2.  **Income Calculation Logic:**
    *   For each `YemekCeki` record (representing a row in the report), calculate the corresponding income.
    *   The income is calculated by summing the `Tutar` from the `Gelir` table.
    *   The matching criteria between `YemekCeki` and `Gelir` are:
        *   `YemekCeki.Kategori_ID` must match `Gelir.Kategori_ID`.
        *   `Gelir.Tarih` must be within the date range defined by `YemekCeki.Ilk_Tarih` and `YemekCeki.Son_Tarih` (inclusive).
    *   If no matching `Gelir` record is found for a `YemekCeki` record, the `Gelir` value for that row should be `0`.

### Frontend

1.  **UI Modification:**
    *   A new column titled "Gelir" must be added to the "Yemek Çeki Kategorileri Detay Raporu" table.
    *   This new column should be positioned immediately after the "Tutar" (Amount) column.

2.  **Data Display:**
    *   The "Gelir" column in each row must display the calculated income value received from the backend.
    *   The formatting of the "Gelir" column (e.g., currency symbol, decimal places) must be consistent with the "Tutar" column.

3.  **Group/Total Calculation:**
    *   The report's group headers and/or grand total row must include a "Toplam Gelir" (Total Income).
    *   This total must be calculated based on a `DISTINCT` combination of `(YemekCeki/Kategori, IlkTarih, SonTarih)`. This means that if multiple rows share the same category and date range, their associated income should only be counted **once** towards the total.

## Out of Scope

*   Changes to any other reports or screens.
*   Modifications to the `Gelir` data entry process.
*   Creation of new database tables.

## Acceptance Criteria

1.  The "Yemek Çeki Kategorileri Detay Raporu" screen displays a "Gelir" column after the "Tutar" column.
2.  For each row, the "Gelir" column correctly displays the sum of income from the `Gelir` table, based on matching `Kategori_ID` and the `Ilk_Tarih` / `Son_Tarih` range.
3.  If a `YemekCeki` record has no corresponding `Gelir` records, its "Gelir" column shows `0` or a blank value, consistent with the report's standard for no data.
4.  The grand total for the "Gelir" column is calculated correctly, counting the income for each unique `(Kategori_ID, Ilk_Tarih, Son_Tarih)` group only once.
5.  Existing functionality of the report remains unchanged and operates as expected.
