import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../index.css';


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

const generateICS = (events) => {
  // Define the beginning of the calendar file
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
      `DTSTART:${formatDateToICS(event.DTSTART)}`,
      `DTEND:${formatDateToICS(event.DTEND)}`,
      `SUMMARY:${event.SUMMARY || ''}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT'
    );
  });

  // End of the calendar file
  icsFileContent.push('END:VCALENDAR');

  // Join the content array into a single string, with a newline character between each line
  return icsFileContent.join('\r\n');
};

const formatDateToICS = (date) => {
  // Format the JavaScript date object into a date-time string according to the ICS standard
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};


const ResultsTable = ({ results }) => {
  // State for dialog
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Function to convert data to CSV format and trigger download
  const handleDownloadCSV = () => {
    // Define the header for CSV
    const header = ['Section', 'Title', 'Min Credit', 'Timeslot', 'Location', 'Faculty'];
    // Map the data to a CSV format
    const csvContent = [
      header.join(','), // header row first
      ...results.sorted_schedule[0].schedule.map(row => [
        row.section,
        row.title,
        row.minCredit,
        row.timeslot,
        `"${row.bldg} ${row.room}"`, // Wrap in quotes to handle any commas
        row.faculty1
      ].join(',')) // join each row's columns with a comma
    ].join('\r\n'); // join each row with a new line

    // Create a Blob with the CSV content and the appropriate type
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'results.csv'; // File name for download
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

   // Determine the week that contains the first event
   const firstEventStartDate = results.calendar_events.length > 0
   ? new Date(results.calendar_events[0].start)
   : new Date(); // Fallback to current date if no events

  // Handle closing the dialog
  const handleClose = () => {
    setOpen(false);
  };

   // Function to handle the download of the ICS file
  const handleDownloadICS = () => {
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
  };


  const handleEventClick = (event) => {
    // Assuming the event clicked provides the full event object directly
    setSelectedEvent(event);
    setOpen(true);
  };

  // Convert calendar events to a suitable format for the calendar
  const calendarEvents = results.calendar_events.map(event => ({
    title: `${event.section_name} - ${event.faculty1}`, // Concatenate section name and faculty name
    start: new Date(event.start),
    end: new Date(event.end),
    bldg: event.bldg,
    room: event.room,
    faculty1: event.faculty1,
    color: stringToColor(event.section_name.split('-')[0]) // Assuming the prefix is before the first dash
  }));

  // Style for the events
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
      }
    };
  };

  return (
    <>
    <div id={'results'}>
      <h1>Optimization Results</h1>
      <Button onClick={handleDownloadCSV}>
        Download CSV
      </Button>
      <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
        <Table aria-label="optimization results table">
          <TableHead>
            <TableRow>
              <TableCell>Section</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Min Credit</TableCell>
              <TableCell>Timeslot</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Faculty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.sorted_schedule[0].schedule.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.section}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.minCredit}</TableCell>
                <TableCell>{row.timeslot}</TableCell>
                <TableCell>{`${row.bldg} ${row.room}`}</TableCell>
                <TableCell>{row.faculty1}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={handleDownloadICS}>
        Download ICS
      </Button>
      <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          defaultDate={firstEventStartDate} // Set the calendar to open to the week of the first event
          defaultView="week" // Set the default view to week
          style={{ height: 500 }}
          min={new Date(0, 0, 0, 7, 0, 0)} // 9:00 AM
          max={new Date(0, 0, 0, 17, 0, 0)} // 5:00 PM
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
        />

      {/* Dialog for event details */}
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
    </>
  );
};

export default ResultsTable;
