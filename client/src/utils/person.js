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

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// "Wed 25 Nov, 16:00 to 17:00" in the viewer's own timezone
export function formatSession(start, end) {
  const from = new Date(start);
  const to = new Date(end);
  return `${dayFormat.format(from)}, ${timeFormat.format(from)} to ${timeFormat.format(to)}`;
}
