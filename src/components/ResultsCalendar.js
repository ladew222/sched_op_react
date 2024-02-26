import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const localizer = momentLocalizer(moment);

// Function to generate a color based on the section prefix
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 70%)`;
  return color;
};


// Function to handle the download of the ICS file

const handleDownloadICS = () => {
try {
    const calendarEvents = results.calendar_events.map(event => ({
        // ... your existing event mapping
        id: event.section_name, // Ensure each event has a unique identifier
        description:  `${event.section_name} ${event.faculty1}`, // Add a description if available
        location: `${event.bldg} ${event.room}`, // Set the location of the event
        DTSTART: new Date(event.start),
        SUMMARY:event.section_name,
        DTEND: new Date(event.end),
    }));

    const icsData = generateICS(calendarEvents);
    const blob = new Blob([icsData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element, click it, and then remove it from the DOM
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calendar.ics'; // Set the filename for the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("ICS file downloaded successfully!");
} catch (error) {
    console.error('Error generating ICS:', error);
    toast.error("Failed to download ICS file.");
}


};


const formatDateToICS = (date) => {
  // Format the JavaScript date object into a date-time string according to the ICS standard
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const generateICS = (events) => {
  let icsFileContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your Organization//EN',
  ];

  // Add events to the ICS content
  events.forEach((event) => {
    icsFileContent.push(
      'BEGIN:VEVENT',
      `UID:${event.id || event.title}`,
      `DTSTART:${formatDateToICS(event.start)}`,
      `DTEND:${formatDateToICS(event.end)}`,
      `SUMMARY:${event.title || ''}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT'
    );
  });

  icsFileContent.push('END:VCALENDAR');
  return icsFileContent.join('\r\n');
};

// Calendar component
const MyCalendar = ({ events }) => {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const firstEventStartDate = events.length > 0
    ? new Date(events[0].start)
    : new Date();

  const eventStyleGetter = (event) => {
    const sectionPrefix = event.section_name ? event.section_name.split('-')[0] : 'Default';
    const color = stringToColor(sectionPrefix);
    return {
      style: {
        backgroundColor: color,
      }
    };
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpen(true);
  };

  const calendarEvents = events.map(event => ({
    title: `${event.section_name || 'No Section'} - ${event.faculty1 || 'No Faculty'}`,
    start: new Date(event.start || new Date()),
    end: new Date(event.end || new Date()),
    bldg: event.bldg || 'N/A',
    room: event.room || 'N/A',
    faculty1: event.faculty1 || 'N/A',
    color: stringToColor(event.section_name ? event.section_name.split('-')[0] : 'Default')
  }));

  return (
    <div>
         <Button onClick={() => handleDownloadICS(currentResult.calendarEvents)}>
            Download ICS for Result {currentIndex + 1}
          </Button>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        defaultDate={firstEventStartDate}
        defaultView="week"
        style={{ height: 500 }}
        min={new Date(0, 0, 0, 7, 0, 0)}
        max={new Date(0, 0, 0, 22, 0, 0)}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <p><strong>Section:</strong> {selectedEvent.title}</p>
              <p><strong>Start:</strong> {selectedEvent.start.toLocaleString()}</p>
              <p><strong>End:</strong> {selectedEvent.end.toLocaleString()}</p>
              <p><strong>Location:</strong> {`${selectedEvent.bldg} ${selectedEvent.room}`}</p>
              <p><strong>Faculty:</strong> {selectedEvent.faculty1}</p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MyCalendar;