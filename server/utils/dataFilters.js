export const getDateRange = (filter) => {
  const now = new Date();
  let start, end;

  switch (filter) {
    case "daily":
      // Today from midnight to now
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date();
      break;

    case "weekly":
      // This week from Sunday 00:00 to now
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date();
      break;

    case "monthly":
      // This month from 1st to now
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      break;

    case "yearly":
      // This year from Jan 1st to now
      start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      break;

    case "all-time":
    default:
      start = null;
      end = null;
      break;
  }

  console.log(`Filter: ${filter}, Start: ${start}, End: ${end}`); // Debug log
  return { start, end };
};