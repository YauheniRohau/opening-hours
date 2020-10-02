import isBefore from 'date-fns/isBefore';
import addDays from 'date-fns/addDays';
import parse from 'date-fns/parse';
import setDay from 'date-fns/setDay';
import isEqual from 'date-fns/isEqual';
import isWithinInterval from 'date-fns/isWithinInterval';

import utcToZonedTime from 'date-fns-tz/utcToZonedTime';

const weekDays = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
};

export const getOpenedTimeRanges = (serviceHours, storeTimezone) => {
  const utcTimeNow = new Date().toISOString();

  const localStoreDate = utcToZonedTime(utcTimeNow, storeTimezone);

  return serviceHours.map((day) => {
    const dateWeek = setDay(localStoreDate, weekDays[day.dayOfWeek]);
    const start = parse(day.openTime, 'hh:mm a', dateWeek);
    let end = parse(day.orderCutOffTime, 'hh:mm a', dateWeek);

    if (isBefore(end, start) || isEqual(end, start)) {
      end = addDays(end, 1);
    }

    return { start, end };
  });
};

// const getClosedTimeRanges = (serviceHours) => getOpenedTimeRanges

const resolveOpeningHours = (
  serviceHours,
  storeTimezone
) => {
  const utcTimeNow = new Date().toISOString();

  const localStoreDate = utcToZonedTime(utcTimeNow, storeTimezone);

  const openedTimeRanges = getOpenedTimeRanges(serviceHours);

  const currentOpenedTimeRange = openedTimeRanges.find((range) => isWithinInterval(localStoreDate, range));

  // const currentClosedTimeRange = openedTimeRanges.find((range) => {
  //   const closedRange
  //   return isWithinInterval(localStoreDate, range)
  // });

  return {
    localStoreDate,
    isOpen: !!currentOpenedTimeRange,
    currentTimeRange: currentOpenedTimeRange,
  }

};

export default resolveOpeningHours;
