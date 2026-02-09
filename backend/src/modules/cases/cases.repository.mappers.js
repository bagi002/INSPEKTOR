export function mapCaseRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    authorUserId: row.author_user_id,
    authorFirstName: row.author_first_name,
    authorLastName: row.author_last_name,
    title: row.title,
    description: row.description,
    publicationStatus: row.publication_status,
    averageRating: row.average_rating,
    ratingCount: row.rating_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHomeActiveCase(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    progressPercent: row.progress_percent,
  };
}

export function mapHomeResolvedCase(row) {
  return {
    id: row.id,
    title: row.title,
    rating: row.rating,
    reviews: row.reviews,
  };
}

export function mapTopRatedCase(row) {
  return {
    id: row.id,
    title: row.title,
    rating: row.rating,
    reviews: row.reviews,
    author: `${row.author_first_name} ${row.author_last_name}`.trim(),
  };
}

export function mapCreatedCase(row) {
  return {
    id: row.id,
    title: row.title,
    publicationStatus: row.publication_status,
    rating: row.rating,
    reviews: row.reviews,
  };
}
