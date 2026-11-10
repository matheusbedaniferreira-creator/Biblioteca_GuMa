-- Google Books discovery is external: no new personal data, no new SQL tables.
-- Images/descriptions returned by Laravel at /api/google-books are NOT inventory records.
-- Only staff can create a local inventory record after checking an actual physical exemplar.
SELECT 'Google Books discovery uses backend API; no migration needed.' AS note;
