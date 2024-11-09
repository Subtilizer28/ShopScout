import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, CircularProgress, Card, CardContent, Typography, Chip, Fade,
  Checkbox, Slider, TextField, FormControl, FormControlLabel, FormGroup
} from '@mui/material';

function Suggest() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  const [showInputs, setShowInputs] = useState(false);
  const [showPhoneInputs, setShowPhoneInputs] = useState(false);
  const [showLaptopInputs, setShowLaptopInputs] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 600000]);
  const [error, setError] = useState('');
  const [phoneFormData, setPhoneFormData] = useState({
    brand: [],           // for single-value inputs like brand
    minPrice: 'Min',
    maxPrice: 'Max',
    selectedRams: [],     // for multiple checkboxes (RAM options)
    selectedStorage: [],   // add similar arrays for other multi-select options if needed
    selectedBattery: [],
    selectedScreen: [],
    selectedClock: []
  });
  const [laptopFormData, setLaptopFormData] = useState({
    brand: [],           // for single-value inputs like brand
    minPrice: 'Min',
    maxPrice: 'Max',
    selectedRams: [],     // for multiple checkboxes (RAM options)
    selectedSSD: [],   // add similar arrays for other multi-select options if needed
    selectedGraphics: [],
    selectedScreen: [],
    selectedGraphicsMemory: [],
    selectedHDD: [],
    selectedProcessor: []
  });

  const handleDeviceTypeSelect = (type) => {
    setDeviceType(type);
    if (type === 'Phone') {setShowPhoneInputs(true); setShowInputs(true)};
    if (type === 'Laptop') {setShowLaptopInputs(true); setShowInputs(true)};;
  };
  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target;
    if(deviceType === 'Phone') {
      setPhoneFormData((prevData) => {
        const selectedOptions = prevData[category];
        return {
          ...prevData,
          [category]: checked
            ? [...selectedOptions, value]  // add if checked
            : selectedOptions.filter((option) => option !== value)  // remove if unchecked
        };
      });
    }
    else if(deviceType === 'Laptop') {
      setLaptopFormData((prevData) => {
        const selectedOptions = prevData[category];
        return {
          ...prevData,
          [category]: checked
            ? [...selectedOptions, value]  // add if checked
            : selectedOptions.filter((option) => option !== value)  // remove if unchecked
        };
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);
    if(deviceType === 'Phone') {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/psuggest`, phoneFormData);
        if(response.data==="noproducts"){
          setSubmitted(false)
          setError("No products found. Try adjusting your filters.")
        }
        else{
          const fetchedProducts = response.data.map(product => ({
            name: product.productName,
            description: `${product.ram} | ${product.internalStorage} | ${product.batteryCapacity}`,
            price: product.price,
            flipkartLink: product.flipkartDirectUrl,
            image: product.imageUrl
          }));
          setProducts(fetchedProducts);
        }
      } catch (error) {
          console.error('Error sending data to server:', error);
      } finally {
          setLoading(false);
      }
    }
    else if(deviceType === 'Laptop') {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/lsuggest`, laptopFormData);
        if(response.data==="noproducts"){
          setSubmitted(false)
          setError("No products found. Try adjusting your filters.")
        }
        else{
          const fetchedProducts = response.data.map(product => ({
            name: product.productName,
            description: `${product.ram} | ${product.graphicsCard} | ${product.processor} | ${product.screenSize}`,
            price: product.price,
            flipkartLink: product.flipkartDirectUrl,
            image: product.imageUrl
          }));
          setProducts(fetchedProducts);
        }
      } catch (error) {
          console.error('Error sending data to server:', error);
      } finally {
          setLoading(false);
      }
    }
  };
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue); 
    const [min,max] = newValue;
    if(deviceType === 'Phone') {
      phoneFormData.minPrice = min;
      phoneFormData.maxPrice = max;
    }
    else if(deviceType === 'Laptop') {
      laptopFormData.minPrice = min;
      laptopFormData.maxPrice = max;
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 4, maxHeight: '800px' }}>
      
      {/* Specification Selection Section - Hidden when form is submitted */}
      {!submitted && (
        <Fade in={!submitted}>
          <Box sx={{ textAlign: 'center', marginBottom: 4, width: '100%', maxWidth: '800px' }}>
            {/* Device Type Selection */}
            {!deviceType && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 4, marginTop: 20 }}>
                <Button 
                  variant="contained" 
                  onClick={() => handleDeviceTypeSelect('Phone')}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    color: 'white',
                    height: '40px',
                    width: '120px',
                    borderRadius: '20px',
                    padding: '10px 30px',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}
                >
                  Phone
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => handleDeviceTypeSelect('Laptop')}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    color: 'white',
                    height: '40px',
                    width: '120px',
                    borderRadius: '20px',
                    padding: '10px 30px',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}
                >
                  Laptop
                </Button>
              </Box>
            )}

            {showInputs && (
              <div>
              <form onSubmit={handleSubmit}>
                {error && (
                  <Typography variant="body2" sx={{ color: 'red', marginBottom: '10px' }}>
                      {error}
                  </Typography>
                )}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2, 
                  borderRadius: 5,
                  height: 'auto', 
                  background: 'transparent', 
                }}>
                  {/* Phone-specific inputs */}
                  {showPhoneInputs && (
                    <FormControl
                      onSubmit={handleSubmit}
                    >
                      <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 'bold', marginTop: 20 }} gutterBottom>
                        Select Specifications
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          height: 'cover',
                          margin: 1,
                        }}>
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              height: 'auto',
                              display: 'flex',
                              flexWrap: 'wrap',
                              width: '30%',
                              boxSizing: 'border-box',
                              marginLeft: 3.5,
                              marginRight: 3,
                              marginTop: 3,
                              padding: 1,
                              marginBottom: 25,
                              color: 'white'
                            }}
                          >
                            <Typography color="white" variant="body2" sx={{ marginTop: 1, width: '90%', marginBottom: 1 }}>Brands</Typography>
                            {[
                              "Apple", "Samsung", "Google", "Motorola", "Vivo", "Oppo", 
                              "Realme", "OnePlus", "LG", "Mi", "IQOO", "ASUS", 
                              "HTC", "Sony", "Tecno", "Nokia", "Honor"
                            ].map((brand) => (
                              <Box
                                key={brand}
                                sx={{
                                  width: 90, // Allows two checkboxes per row
                                  padding: '2px 8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginLeft: -1,
                                  marginTop: -10,
                                }}
                              >
                                <FormControlLabel
                                  control={<Checkbox id={brand} value={brand} onChange={(e) => handleCheckboxChange(e, 'brand')} checked={phoneFormData.brand.includes(brand)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />} 
                                  label={brand} 
                                  sx={{ 
                                    marginTop: -1.5,
                                    marginLeft: 0 
                                  }} 
                                />
                              </Box>
                            ))}
                          </Box>
                          <Box
                            sx={{
                              backgroundColor: 'transparent',
                              height: 'cover',
                              width: '60%',
                              display: 'flex',
                              flexWrap: 'wrap',
                              boxSizing: 'border-box',
                              marginTop: 2
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, margin: 1 }}>
                              {/* Min-Max Price Slider */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 3, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Price Range</Typography>
                                <Slider
                                  value={priceRange}
                                  onChange={handlePriceChange}
                                  valueLabelDisplay="auto"
                                  min={0}
                                  max={250000}
                                  sx={{ color: 'white', width: '70%' }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                                  <TextField
                                    name='min'
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceChange(e, [Number(e.target.value), priceRange[1]])}
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                          borderColor: 'transparent', // Border color
                                        },
                                        '&:hover fieldset': {
                                          borderColor: 'transparent', // Hover border color
                                        }
                                      },
                                      width: '40%', 
                                      background: 'white', 
                                      height: 30,
                                      borderRadius: 5,
                                      input: {
                                        textAlign: 'center',
                                        color: 'black', // Text color inside the TextField
                                        padding: '4px 8px', // Adjust padding for a more compact size
                                        fontSize: '0.85rem'
                                      },
                                    }}
                                  />
                                  <TextField
                                    name='max'
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceChange(e, [priceRange[0], Number(e.target.value)])}
                                    size="small"
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                          borderColor: 'transparent', // Border color
                                        },
                                        '&:hover fieldset': {
                                          borderColor: 'transparent', // Hover border color
                                        }
                                      },
                                      width: '40%', 
                                      background: 'white', 
                                      height: 30,
                                      borderRadius: 5,
                                      input: {
                                        textAlign: 'center',
                                        color: 'black', // Text color inside the TextField
                                        padding: '4px 8px', // Adjust padding for a more compact size
                                        fontSize: '0.85rem'
                                      },
                                    }}
                                  />
                                </Box>
                              </Box>
                              
                              {/* RAM Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>RAM</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                                  {["4 GB", "3 GB", "2 GB", "1GB and Below", "8 GB and Above", "6 GB", "6 GB Above"].map((phoneRamOption) => (
                                    <FormControlLabel
                                      key={phoneRamOption}
                                      value={phoneRamOption}
                                      control={<Checkbox id={phoneRamOption} value={phoneRamOption} onChange={(e) => handleCheckboxChange(e, 'selectedRams')} checked={phoneFormData.selectedRams.includes(phoneRamOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{phoneRamOption}</Typography>}
                                      sx={{
                                        width: 105,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 0,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                              {/* Internal Storage Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginLeft: 1, marginBottom: 12, marginTop: -3, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Internal Storage</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1}}>
                                  {["256 GB & Above", "128 - 255.9 GB", "64 - 127.9 GB", "32 - 63.9 GB", "16 - 31.9 GB", "256 GB Above"].map((storageOption, index) => (
                                    <FormControlLabel
                                      key={storageOption}
                                      value={storageOption}
                                      control={<Checkbox id={storageOption} value={storageOption} onChange={(e) => handleCheckboxChange(e, 'selectedStorage')} checked={phoneFormData.selectedStorage.includes(storageOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{storageOption}</Typography>}
                                      sx={{
                                        width: 108,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                              
                              {/* Battery Capacity Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginRight: 1, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Battery Capacity</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                                  {["1000 - 1999 mAh", "2000 - 2999 mAh", "3000 - 3999 mAh", "4000 - 4999 mAh", "5000 - 5999 mAh", "5000 mAh Above", "6000 mAh & Above", "Less than 1000 mAh"].map((batteryOption) => (
                                    <FormControlLabel
                                      key={batteryOption}
                                      value={batteryOption}
                                      control={<Checkbox id={batteryOption} value={batteryOption} onChange={(e) => handleCheckboxChange(e, 'selectedBattery')} checked={phoneFormData.selectedBattery.includes(batteryOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{batteryOption}</Typography>}
                                      sx={{
                                        width: 108,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                        marginBottom: 1
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                              {/* Screen Size Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginLeft: 1, marginTop: -12, marginBottom: 8, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Screen Size</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1, marginBottom: 1 }}>
                                  {["5.7 - 5.9 inch", "5.5 - 5.6 inch", "5.2 - 5.4 inch", "4.5 - 4.9 inch", "4 - 4.4 inch", "6.4 inch & Above", "6 - 6.3 inch", "6 inch above"].map((phoneScreenOption) => (
                                    <FormControlLabel
                                      key={phoneScreenOption}
                                      value={phoneScreenOption}
                                      control={<Checkbox id={phoneScreenOption} value={phoneScreenOption} onChange={(e) => handleCheckboxChange(e, 'selectedScreen')} checked={phoneFormData.selectedScreen.includes(phoneScreenOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{phoneScreenOption}</Typography>}
                                      sx={{
                                        width: 107,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                              
                              {/* Processor Clock Speed Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginLeft: 1, marginRight: 1, marginBottom: 3, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Processor Clock Speed</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1, marginBottom: 1 }}>
                                  {["1.5 - 1.9 GHz", "2 - 2.1 GHz", "2.2 - 2.4 GHz", "2.5 & Above", "2.5 GHz Above", "Below 1.5 GHz", "2 - 2.5 GHz"].map((speedOption) => (
                                    <FormControlLabel
                                      key={speedOption}
                                      value={speedOption}
                                      control={<Checkbox id={speedOption} value={speedOption} onChange={(e) => handleCheckboxChange(e, 'selectedClock')} checked={phoneFormData.selectedClock.includes(speedOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{speedOption}</Typography>}
                                      sx={{
                                        width: 107,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                            </Box>
                          </Box>
                      </Box>
                    </FormControl>
                  )}

                  {/* Laptop-specific inputs */}
                  {showLaptopInputs && (
                    <FormControl
                      onSubmit={handleSubmit}
                    >
                      <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 'bold', marginTop: 55 }} gutterBottom>
                        Select Specifications
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          height: 'cover',
                          margin: 1,
                        }}
                      >
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              height: 'auto',
                              maxHeight: 650,
                              display: 'flex',
                              flexWrap: 'wrap',
                              width: '30%',
                              boxSizing: 'border-box',
                              marginLeft: 3.5,
                              marginRight: 3,
                              marginTop: 3,
                              padding: 1,
                              marginBottom: 25,
                              color: 'white'
                            }}
                          >
                            <Typography color="white" variant="body2" sx={{ marginTop: 1, width: '90%', marginBottom: 1 }}>Brands</Typography>
                            {[
                              "HP", "ASUS", "Lenovo", "DELL", "MSI", "Avita", "Acer", "Apple", "Infinix",
                              "Samsung", "AXL", "Ultimus", "Gigabyte", 
                              "Zebronics", "Colorful", "Thomson", "Chuwi", "Wings", "realme", "Microsoft",
                              "Vaio", "Alienware", "walker", "Primebook"
                            ].map((brand) => (
                              <Box
                                key={brand}
                                sx={{
                                  width: 90, // Allows two checkboxes per row
                                  padding: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginLeft: -1,
                                  marginTop: -10,
                                }}
                              >
                                <FormControlLabel
                                  control={<Checkbox id={brand} value={brand} onChange={(e) => handleCheckboxChange(e, 'brand')} checked={laptopFormData.brand.includes(brand)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />} 
                                  label={brand} 
                                  sx={{ 
                                    marginTop: -1.5,
                                    marginLeft: 0 
                                  }} 
                                />
                              </Box>
                            ))}
                          </Box>
                          <Box
                            sx={{
                              backgroundColor: 'transparent',
                              height: 'cover',
                              width: '60%',
                              display: 'flex',
                              flexWrap: 'wrap',
                              boxSizing: 'border-box',
                              marginTop: 2
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, margin: 1 }}>
                              {/* Min-Max Price Slider */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 20, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Price Range</Typography>
                                <Slider
                                  value={priceRange}
                                  onChange={handlePriceChange}
                                  valueLabelDisplay="auto"
                                  min={0}
                                  max={500000}
                                  sx={{ color: 'white', width: '70%' }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                                  <TextField
                                    name='min'
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceChange(e, [Number(e.target.value), priceRange[1]])}
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                          borderColor: 'transparent', // Border color
                                        },
                                        '&:hover fieldset': {
                                          borderColor: 'transparent', // Hover border color
                                        }
                                      },
                                      width: '40%', 
                                      background: 'white', 
                                      height: 30,
                                      borderRadius: 5,
                                      input: {
                                        textAlign: 'center',
                                        color: 'black', // Text color inside the TextField
                                        padding: '4px 8px', // Adjust padding for a more compact size
                                        fontSize: '0.85rem'
                                      },
                                    }}
                                  />
                                  <TextField
                                    name='max'
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceChange(e, [priceRange[0], Number(e.target.value)])}
                                    size="small"
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                          borderColor: 'transparent', // Border color
                                        },
                                        '&:hover fieldset': {
                                          borderColor: 'transparent', // Hover border color
                                        }
                                      },
                                      width: '40%', 
                                      background: 'white', 
                                      height: 30,
                                      borderRadius: 5,
                                      input: {
                                        textAlign: 'center',
                                        color: 'black', // Text color inside the TextField
                                        padding: '4px 8px', // Adjust padding for a more compact size
                                        fontSize: '0.85rem'
                                      },
                                    }}
                                  />
                                </Box>
                              </Box>
                              
                              {/* RAM Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>RAM</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                                  {["8 GB", "4 GB", "16 GB", "32 GB", "2 GB", "18 GB", "48 GB", "64 GB", "12 GB", "36 GB", "24 GB"].map((laptopRamOption) => (
                                    <FormControlLabel
                                      key={laptopRamOption}
                                      value={laptopRamOption}
                                      control={<Checkbox id={laptopRamOption} value={laptopRamOption} onChange={(e) => handleCheckboxChange(e, 'selectedRams')} checked={laptopFormData.selectedRams.includes(laptopRamOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{laptopRamOption}</Typography>}
                                      sx={{
                                        width: 105,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 0,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                              {/* SSD Storage Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginLeft: 1, marginBottom: 48, marginTop: -20, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>SSD SSD</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1}}>
                                  {["512 GB", "256 GB", "1 TB", "8 GB", "128 GB", "2 TB"].map((ssdOption, index) => (
                                    <FormControlLabel
                                      key={ssdOption}
                                      value={ssdOption}
                                      control={<Checkbox id={ssdOption} value={ssdOption} onChange={(e) => handleCheckboxChange(e, 'selectedSSD')} checked={laptopFormData.selectedSSD.includes(ssdOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{ssdOption}</Typography>}
                                      sx={{
                                        width: 108,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                              
                              {/* Graphics Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginRight: 1, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Graphics Card Series</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                                  {["Intel Integrated", "AMD Radeon", "NVIDIA GeForce RTX", "AMD Radeon RDNA 3", "Arc A370M", "Qualcomm Adreno", "NVIDIA Quadro", "MediaTek Integrated", "Qualcomm", "NVIDIA GeForce", "NVIDIA GeForce GTX"].map((graphicsOption) => (
                                    <FormControlLabel
                                      key={graphicsOption}
                                      value={graphicsOption}
                                      control={<Checkbox id={graphicsOption} value={graphicsOption} onChange={(e) => handleCheckboxChange(e, 'selectedGraphics')} checked={laptopFormData.selectedGraphics.includes(graphicsOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{graphicsOption}</Typography>}
                                      sx={{
                                        width: 108,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                        marginBottom: 1
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                              {/* Screen Size Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginLeft: 1, marginTop: -48, marginBottom: 16, borderRadius: 5, width: 220 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Screen Size</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1, marginBottom: 1 }}>
                                  {["Below 12 inch", "12 inch - 12.9 inch", "13 inch - 13.9 inch", "14 inch - 14.9 inch", "15 inch - 15.9 inch", "16 inch - 17.9 inch", "18 inch - 20 inch", "Above 20 inch"].map((laptopScreenOption) => (
                                    <FormControlLabel
                                      key={laptopScreenOption}
                                      value={laptopScreenOption}
                                      control={<Checkbox id={laptopScreenOption} value={laptopScreenOption} onChange={(e) => handleCheckboxChange(e, 'selectedScreen')} checked={laptopFormData.selectedScreen.includes(laptopScreenOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{laptopScreenOption}</Typography>}
                                      sx={{
                                        width: 104,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                            </Box>    
                              {/* Graphics Memory Selection */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginLeft: 1, marginRight: -1, marginBottom: 4, borderRadius: 5, marginTop: -15 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Graphics Memory</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1, marginBottom: 1 }}>
                                  {["128 MB", "512 MB", "1 GB", "2 GB", "3 GB", "4 GB", "Integrated Graphics", "6 GB", "8 GB", "16 GB", "12 GB"].map((graphicsMemOption) => (
                                    <FormControlLabel
                                      key={graphicsMemOption}
                                      value={graphicsMemOption}
                                      control={<Checkbox id={graphicsMemOption} value={graphicsMemOption} onChange={(e) => handleCheckboxChange(e, 'selectedGraphicsMemory')} checked={laptopFormData.selectedGraphicsMemory.includes(graphicsMemOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{graphicsMemOption}</Typography>}
                                      sx={{
                                        width: 105,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                              {/* Hard Disk Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginLeft: 1, marginRight: 1, marginBottom: 15, borderRadius: 5 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>HDD SSD</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1, marginBottom: 1 }}>
                                  {["1 TB", "256 GB", "500 GB"].map((hddOption) => (
                                    <FormControlLabel
                                      key={hddOption}
                                      value={hddOption}
                                      control={<Checkbox id={hddOption} value={hddOption} onChange={(e) => handleCheckboxChange(e, 'selectedHDD')} checked={laptopFormData.selectedHDD.includes(hddOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{hddOption}</Typography>}
                                      sx={{
                                        width: 100,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2}}>
                              <Box sx={{ flex: 1, backgroundColor: 'transparent', marginLeft: 1, marginTop: -20, borderRadius: 5 }}>
                              </Box>
                              {/* Processor Brand Selection */}
                              <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', maxHeight: 200, marginTop: -15, borderRadius: 5, marginRight: 1 }}>
                                <Typography color="white" variant="body2" sx={{ marginTop: 1 }}>Processor Brand</Typography>
                                <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1}}>
                                  {["AMD", "Intel", "Apple", "Qualcomm", "MediaTek"].map((processorOption) => (
                                    <FormControlLabel
                                      key={processorOption}
                                      value={processorOption}
                                      control={<Checkbox id={processorOption} value={processorOption} onChange={(e) => handleCheckboxChange(e, 'selectedProcessor')} checked={laptopFormData.selectedProcessor.includes(processorOption)} sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, }} />}
                                      label={<Typography color="white" variant="body2">{processorOption}</Typography>}
                                      sx={{
                                        width: 100,  // Each item takes up half the row width
                                        margin: 0,     // Removes extra margin to align neatly
                                        marginTop: 1,
                                        marginLeft: -0.8
                                      }}
                                    />
                                  ))}
                                </FormGroup>
                              </Box>
                            </Box>
                          </Box>
                      </Box>
                    </FormControl>
                  )}
                </Box>
                {/* Suggest Button */}
                <Button 
                  type="submit"
                  variant="contained" 
                  color="primary"
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    color: 'white',
                    height: '50px',
                    width: '150px',
                    borderRadius: '20px',
                    padding: '10px 30px',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    marginBottom: 3,
                  }}
                >
                  Suggest
                </Button>
                </form>
              </div>
            )}
          </Box>
        </Fade>
      )}

      {/* Loading Spinner */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 20, color: "white" }}>
          <CircularProgress sx={{ color: 'white' }} size={60} thickness={5} />
        </Box>
      )}

      {/* Product Cards Section */}
      {!loading && products.length > 0 && (
        <Fade in={!loading}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {products.map((product, index) => (
              <Box key={index} sx={{ minWidth: '300px', flexBasis: '30%', textAlign: 'center' }}>
                <Card sx={{ backgroundColor: 'transparent', borderRadius: "25px", boxShadow: 5, minHeight: 380 }}>
                  <CardContent>
                    <Box sx={{
                      width: 150,
                      height: 200,
                      background: 'black',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      borderRadius: 5 
                    }}>
                      <img src={product.image} width={150} height={200} style={{ borderRadius: 16 }} />
                    </Box>
                    <Typography sx={{ marginTop: 1 }} variant="h5" color="white" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="white">
                      {product.description}
                    </Typography>
                    <Typography sx={{ marginTop: 1 }} variant="h5" color="white">
                      {product.price}
                    </Typography>
                    {/* Link Chips */}
                    <Box sx={{ marginTop: 1 }}>
                      <Chip
                        label="Flipkart"
                        component="a"
                        href={product.flipkartLink}
                        target="_blank"
                        clickable
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Fade>
      )}
    </Box>
  );
}

export default Suggest;