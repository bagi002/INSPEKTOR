export function buildUpdateStatement(columnMap, updates) {
  const assignments = [];
  const values = [];

  Object.entries(updates).forEach(([fieldName, value]) => {
    const columnName = columnMap[fieldName];
    if (!columnName) {
      return;
    }

    assignments.push(`${columnName} = ?`);
    values.push(value);
  });

  if (assignments.length === 0) {
    return null;
  }

  assignments.push("updated_at = CURRENT_TIMESTAMP");
  return {
    sqlFragment: assignments.join(", "),
    values,
  };
}
