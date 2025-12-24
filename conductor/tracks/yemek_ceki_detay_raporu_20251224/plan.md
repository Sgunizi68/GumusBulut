# Plan: Add 'Gelir' column to 'Yemek Ceki Detay Raporu'

## Phase 1: Backend Implementation

- [x] **Task: Modify Backend API to Include 'Gelir' Field.**
    - **Sub-task: Write Failing Tests.** Create a new test case for the `get_yemek_cekiler` function (or the relevant API endpoint test) that asserts the presence of a `Gelir` field in the response. This test should initially fail.
    - **Sub-task: Update `get_yemek_cekiler` CRUD function.** Modify the `get_yemek_cekiler` function in `backend/db/crud.py` to calculate and include the `Gelir` field. This will involve:
        - Creating a correlated subquery to sum `Gelir.Tutar`.
        - The subquery will match `Gelir` records based on `Kategori_ID` and the `Ilk_Tarih` / `Son_Tarih` range from the `YemekCeki` table.
        - Using `func.coalesce` to ensure a value of `0` is returned if no matching `Gelir` records are found.
    - **Sub-task: Update `YemekCeki` Schema.** Modify the `YemekCekiList` Pydantic schema in `backend/schemas/yemek_ceki.py` to include the new `Gelir` field (e.g., `Gelir: float`).
    - **Sub-task: Run Tests.** Execute the test suite and confirm that the previously failing test now passes and all other tests remain successful.
- [ ] **Task: Conductor - User Manual Verification 'Backend Implementation' (Protocol in workflow.md)**

## Phase 2: Frontend Implementation

- [x] **Task: Add 'Gelir' Column to the Report Table.**
    - **Sub-task: Locate the Frontend Component.** Identify the React component responsible for rendering the "Yemek Çeki Kategorileri Detay Raporu". Search for "Yemek Ceki" or similar strings in the `CopyCat/` directory.
    - **Sub-task: Update Table Structure.** Modify the table definition (e.g., in the component's JSX or in a table configuration file) to add a new column header "Gelir" immediately after the "Tutar" column.
    - **Sub-task: Update Data Mapping.** Ensure the new `Gelir` field from the API response is correctly accessed and rendered in the cells of the new "Gelir" column. Apply the same formatting as the "Tutar" column.
- [x] **Task: Implement 'Toplam Gelir' Grand Total Calculation.**
    - **Sub-task: Create Calculation Logic.** In the frontend component, implement the logic to calculate the grand total for the "Gelir" column.
    - **Sub-task: Implement DISTINCT Logic.** The calculation must only sum the `Gelir` for unique combinations of `(Kategori_ID, Ilk_Tarih, Son_Tarih)`. This will require creating a helper function to identify unique records before summing their `Gelir` values.
    - **Sub-task: Display Total.** Render the calculated "Toplam Gelir" in the report's footer or group summary row.
- [ ] **Task: Conductor - User Manual Verification 'Frontend Implementation' (Protocol in workflow.md)**

## Phase 3: Finalization and Commit

- [x] **Task: Review and Finalize.**
    - Perform a final review of both backend and frontend changes to ensure they meet all requirements outlined in the `spec.md`.
    - Manually test the report to confirm functionality, including sorting and filtering if applicable.
- [x] **Task: Commit all changes.**
    - Add and commit all modified files with a descriptive commit message, e.g., `feat(reports): Add Gelir column to Yemek Ceki report`.
- [ ] **Task: Conductor - User Manual Verification 'Finalization and Commit' (Protocol in workflow.md)**
