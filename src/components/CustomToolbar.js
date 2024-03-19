import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';


// Styled components for better control over slider color
const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.common.white, // Change thumb color to white
  '& .MuiSlider-track': {
    color: theme.palette.common.white, // Change track color to white
  },
  '& .MuiSlider-rail': {
    color: theme.palette.grey[400], // Change rail color to grey
  },
}));

// Styled Button with contrast and gradient
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: '1px solid white',
  borderRadius: 3,
  color: 'white',
  fontWeight: 'bold',
  padding: '10px 30px',
  margin: theme.spacing(1),
  '&:hover': {
    background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
  },
}));

const CustomToolbar = ({ fileData, onOptimize, onHoldAll, sliderValues, onSliderChange }) => {

      // State to store the selected file for uploading
  const [studentScheduleFile, setStudentScheduleFile] = React.useState(null);
  const [uploadStatus, setUploadStatus] = React.useState('');


// Inside CustomToolbar component
  const handleFileUpload = () => {
    if (studentScheduleFile) {
      const formData = new FormData();
      formData.append('file', studentScheduleFile);
    
      fetch('/upload_student_schedule', {
        method: 'POST',
        body: formData,
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        setUploadStatus('File uploaded successfully.');
        // Handle the successful upload here
      })
      .catch(error => {
        setUploadStatus('Failed to upload file.');
        // Handle the error here
      });
    }
  };

    const handleFileChange = (event) => {
      // Get the first file in the file input (if multiple files are allowed, this would need to be adjusted)
      const file = event.target.files[0];
      
      // Update the studentScheduleFile state with the selected file
      setStudentScheduleFile(file);
      
      // Optionally reset the upload status if you have a message being displayed from a previous upload
      setUploadStatus('');
    };



    return (
      <AppBar position="static" sx={{ backgroundColor: 'navy' }}>
        <Toolbar>
          {/* Logo and title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src="/logo.webp" alt="Class Scheduler Logo" style={{ marginRight: 20, height: '40px' }} />
            <Typography variant="h6" component="div" sx={{ color: 'white' }}>
              Class Scheduler
            </Typography>
          </Box>
  
          {/* File upload and info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}> {/* Add gap between elements */}
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
              <Button component="span" sx={{ color: 'white', fontSize: '0.875rem' }}> {/* Adjust font size */}
                  Choose File
                </Button>
              </label>
              <Button onClick={handleFileUpload} sx={{ color: 'white', fontSize: '0.875rem' }}> {/* Adjust font size */}
                Upload
              </Button>
            </Box>
            {fileData && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}> {/* Add margin-top */}
                <Typography color="inherit" sx={{ my: 1 }}>
                  {fileData.name}
                </Typography>
                <Typography color="inherit">
                  File size: {(fileData.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
            )}
          </Box>
  
          {/* Sliders */}
          {fileData && (
            <StyledSliderBox sliderValues={sliderValues} onSliderChange={onSliderChange}  sx={{ width: '100%' }} />
          )}
        </Toolbar>
      </AppBar>
    );
  };
  

// Component for sliders to keep CustomToolbar clean
const StyledSliderBox = ({ sliderValues, onSliderChange }) => (
  <>
    <Box sx={{ width: '20%', color: 'white' }}>
      <Typography gutterBottom>Avoiding Selected Classes</Typography>
      <StyledSlider
        value={sliderValues.avoidingClassesValue}
        onChange={onSliderChange('avoidingClassesValue')}
        aria-labelledby="Avoiding-Classes-Slider"
      />
    </Box>
    <Box sx={{ width: '20%', color: 'white' }}>
      <Typography gutterBottom>Keep 4 Credit Classes Together</Typography>
      <StyledSlider
        value={sliderValues.keepClassesTogetherValue}
        onChange={onSliderChange('keepClassesTogetherValue')}
        aria-labelledby="Keep-Classes-Together-Slider"
      />
    </Box>
    <Box sx={{ width: '20%', color: 'white' }}>
      <Typography gutterBottom>Blocked Slot Penalty Value</Typography>
      <StyledSlider
        value={sliderValues.blockedSlotPenaltyValue}
        onChange={onSliderChange('blockedSlotPenaltyValue')}
        aria-labelledby="Blocked-Slot-Penalty-Slider"
      />
    </Box>
    <Box sx={{ width: '20%', color: 'white' }}>
      <Typography gutterBottom>Hold Penalty Slider Value</Typography>
      <StyledSlider
        value={sliderValues.holdPenaltyValue}
        onChange={onSliderChange('holdPenaltyValue')}
        aria-labelledby="Hold-Penalty-Slider"
      />
    </Box>
  </>
);

export default CustomToolbar;
