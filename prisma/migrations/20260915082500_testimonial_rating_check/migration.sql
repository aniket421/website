-- Rating is documented as 1-5 (BACKEND.md §3). Zod enforces it at every write
-- boundary; this keeps the invariant true even for writes that bypass the app.
ALTER TABLE "Testimonial"
  ADD CONSTRAINT "Testimonial_rating_range" CHECK ("rating" >= 1 AND "rating" <= 5);
