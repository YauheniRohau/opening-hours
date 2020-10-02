import React from 'react';
import resolveOpeningHours, { getOpenedTimeRanges } from './resolveOpeningHours';
import { serviceHours, storeTimezone } from './mocks.js';
import './App.css';

function App() {

  const timeRanges = getOpenedTimeRanges(serviceHours, storeTimezone);

  const resolvedOpeningHours = resolveOpeningHours(serviceHours, storeTimezone);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>{`${resolvedOpeningHours.localStoreDate}`}</h1>
          <strong>
            {
              resolvedOpeningHours.isOpen
                ? `Open now. Closes: ${resolvedOpeningHours.currentTimeRange.end}`
                : 'Closed now.'
                // : `Closed now. Opens: ${resolvedOpeningHours.currentTimeRange.start}`
            }
          </strong>
          <h2>Time ranges:</h2>
          {
            timeRanges && timeRanges.map((hour) =>
              <div>{`${hour.start} - ${hour.end}`}</div>
            )
          }
          <h2>Opens hours:</h2>
          {
            serviceHours && serviceHours.map((hour) =>
              <div>{`${hour.dayOfWeek}: ${hour.openTime} - ${hour.orderCutOffTime}`}</div>
            )
          }
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
