// utils.js
export function formatDateTime(dateStr, startTimeStr, endTimeStr) {
    const dateTime = new Date(`${dateStr}T${startTimeStr}`);
    const endDate = new Date(`${dateStr}T${endTimeStr}`);

    // Specify the locale and options for date formatting
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const startDate = dateTime.toLocaleDateString(undefined, options);
    const startTime = dateTime.toLocaleTimeString().split(',')[0];
    //if needed, add the same options for the end date
    //const endDateStr = endDate.toLocaleDateString(undefined, options);
    const endTime = endDate.toLocaleTimeString().split(',')[0];

    return `${startDate}, Time: ${startTime} to ${endTime}`;
}
