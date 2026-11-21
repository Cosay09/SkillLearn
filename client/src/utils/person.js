const YEAR_LABEL = {
  1: "1st year",
  2: "2nd year",
  3: "3rd year",
  4: "4th year",
};

export function describePerson({ department, year }) {
  return [department, YEAR_LABEL[year]].filter(Boolean).join(", ");
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

export function formatDate(value) {
  return dateFormat.format(new Date(value));
}
