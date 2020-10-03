import isBefore from 'date-fns/isBefore';
import addDays from 'date-fns/addDays';
import parse from 'date-fns/parse';
import setDay from 'date-fns/setDay';
import isEqual from 'date-fns/isEqual';
import isWithinInterval from 'date-fns/isWithinInterval';
import addWeeks from 'date-fns/addWeeks';
import areIntervalsOverlapping from 'date-fns/areIntervalsOverlapping';
import closestTo from 'date-fns/closestTo';

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

const preventOverlappingRanges = (sortedOpenedTimeRanges) => {
  const firstTimeRange = sortedOpenedTimeRanges.slice(0, 1)[0];

  const combinedIntervals = sortedOpenedTimeRanges.slice(1).reduce((resultRanges, currentRange) => {
    const lastRangeInResult = resultRanges.slice(-1)[0];
    const isOverlapping = areIntervalsOverlapping(lastRangeInResult, currentRange, { inclusive: true });

    if (isOverlapping) {
      return [
        ...resultRanges.slice(0, -1),
        {
          start: lastRangeInResult.start,
          end: currentRange.end,
        },
      ]
    }

    return [...resultRanges, currentRange];
  }, [firstTimeRange]);

  return combinedIntervals;
}

/*
* week = -1 - previous week
* week = 0 - current week
* week = 1 - next week
*/
const getWeekOpenedTimeRanges = (serviceHoursSorted, localStoreDate, week = 0) => serviceHoursSorted.map((serviceHours) => {
  const localStoreWeekDayDate = setDay(localStoreDate, weekDays[serviceHours.dayOfWeek]);

  const start = parse(serviceHours.openTime, 'hh:mm a', localStoreWeekDayDate);
  let end = parse(serviceHours.orderCutOffTime, 'hh:mm a', localStoreWeekDayDate);

  if (isBefore(end, start) || isEqual(end, start)) {
    end = addDays(end, 1);
  }

  return {
    start: addWeeks(start, week),
    end: addWeeks(end, week),
  };
});

export const getOpenedTimeRanges = (serviceHours, localStoreDate) => {
  const serviceHoursSorted = serviceHours.sort((a, b) => weekDays[a.dayOfWeek] - weekDays[b.dayOfWeek]);

  const currentWeekOpenedTimeRanges = getWeekOpenedTimeRanges(serviceHoursSorted, localStoreDate, 0);

  const currentWeekLastOpenedTimeRange = currentWeekOpenedTimeRanges.slice(-1)[0];

  const previousWeekOpenedTimeRange = {
    start: addWeeks(currentWeekLastOpenedTimeRange.start, -1),
    end: addWeeks(currentWeekLastOpenedTimeRange.end, -1),
  };

  const nextWeekOpenedTimeRanges = getWeekOpenedTimeRanges(serviceHoursSorted, localStoreDate, 1);

  const resultOpenedTimeRanges = [
    previousWeekOpenedTimeRange,
    ...currentWeekOpenedTimeRanges,
    ...nextWeekOpenedTimeRanges,
  ];

  return preventOverlappingRanges(resultOpenedTimeRanges);
};

const resolveOpeningHours = (
  serviceHours,
  storeTimezone
) => {

  const result = {
    localStoreDate: null,
    isOpen: false,
    openTime: null,
    closeTime: null,
    openedTimeRanges: [],
    currentTimeRange: {},
  };

  if (!serviceHours || !storeTimezone) {
    return result;
  }

  const utcTimeNow = new Date().toISOString();

  const localStoreDate = utcToZonedTime(utcTimeNow, storeTimezone);

  const openedTimeRanges = getOpenedTimeRanges(serviceHours, localStoreDate);

  const currentOpenedTimeRange = openedTimeRanges.find((range) => isWithinInterval(localStoreDate, range));



  if (!currentOpenedTimeRange) {
    const openedTimes = openedTimeRanges.map((range) => range.start).filter((date) => isBefore(localStoreDate, date));

    const openTime = closestTo(
      localStoreDate,
      openedTimes
    );

    return {
      ...result,
      localStoreDate,
      openTime,
      openedTimeRanges,
    }
  }

  return {
    localStoreDate,
    isOpen: !!currentOpenedTimeRange,
    openTime: currentOpenedTimeRange.start,
    closeTime: currentOpenedTimeRange.end,
    openedTimeRanges,
    currentTimeRange: currentOpenedTimeRange,
  }
};

export default resolveOpeningHours;
