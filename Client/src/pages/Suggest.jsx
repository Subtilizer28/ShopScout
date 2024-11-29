import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, CircularProgress, Card, CardContent, Typography, Chip, Fade,
  Checkbox, Slider, TextField, FormControl, FormControlLabel, FormGroup, CardActionArea, CardMedia
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const setMultiCookie = (name, data, days) => {
  const jsonData = JSON.stringify(data);
  const chunkSize = 3800;
  const chunks = [];

  for (let i = 0; i < jsonData.length; i += chunkSize) {
      chunks.push(jsonData.slice(i, i + chunkSize));
  }

  chunks.forEach((chunk, index) => {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}_${index}=${encodeURIComponent(chunk)}; ${expires}; path=/`;
  });

  document.cookie = `${name}_count=${chunks.length}; path=/`;
};

const getMultiCookie = (name) => {
  const countMatch = document.cookie.match(new RegExp(`(^| )${name}_count=([^;]+)`));
  const count = countMatch ? parseInt(countMatch[2], 10) : 0;

  if (count === 0) return null;

  const chunks = [];
  for (let i = 0; i < count; i++) {
      const chunkMatch = document.cookie.match(new RegExp(`(^| )${name}_${i}=([^;]+)`));
      if (chunkMatch) {
          chunks.push(decodeURIComponent(chunkMatch[2]));
      }
  }

  return chunks.length ? JSON.parse(chunks.join('')) : null;
};

function Suggest() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  const [showInputs, setShowInputs] = useState(false);
  const [showPhoneInputs, setShowPhoneInputs] = useState(false);
  const [showLaptopInputs, setShowLaptopInputs] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [error, setError] = useState('');
  const [phoneFormData, setPhoneFormData] = useState({
    brand: [],
    minPrice: 'Min',
    maxPrice: 'Max',
    selectedRams: [],
    selectedStorage: [],
    selectedBattery: [],
    selectedScreen: [],
    selectedClock: []
  });
  const [laptopFormData, setLaptopFormData] = useState({
    brand: [],
    minPrice: 'Min',
    maxPrice: 'Max',
    selectedRams: [],
    selectedSSD: [],
    selectedGraphics: [],
    selectedScreen: [],
    selectedGraphicsMemory: [],
    selectedHDD: [],
    selectedProcessor: []
  });

  const toggleWishlist = (title, image, link) => {
    const wishlist = getMultiCookie('wishlist') || [];
    const itemIndex = wishlist.findIndex((item) => item.link === link);

    let updatedWishlist;
    if (itemIndex !== -1) {
        updatedWishlist = wishlist.filter((item) => item.link !== link);
        alert('Item removed from wishlist!');
    } else {
        updatedWishlist = [...wishlist, { title, image, link }];
        alert('Item added to wishlist!');
    }

    setMultiCookie('wishlist', updatedWishlist, 7); // Expires in 7 days
  };

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
        setLoading(false);
        setSubmitted(false)
        setError("An error occurred. Please try again.");
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
        setLoading(false);
        setSubmitted(false)
        setError("An error occurred. Please try again.");
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
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Specification Selection Section - Hidden when form is submitted */}
      {!submitted && (
        <Fade in={!submitted}>
          <Box sx={{ textAlign: 'center', height: '100%', width: '100%', maxWidth: '800px'}}>
            {/* Device Type Selection */}
            {!deviceType && (
              <Fade in={true} timeout={1000}>
                <Box sx={{ display: 'flex', gap: 3, height: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: { md: 'row', xs: 'column' } }}>
                  <Card
                    onClick={() => handleDeviceTypeSelect('Phone')}
                    sx={{
                      width: 200,
                      height: 250,
                      borderRadius: '16px',
                      boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0px 6px 25px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <CardActionArea sx={{ height: '100%' }}>
                      <CardMedia
                        component="img"
                        image="/images/phone.png"
                        alt="Phone"
                        sx={{
                          marginLeft: 'auto',
                          marginRight: 'auto',
                          height: '160px',
                          width: '160px',
                          objectFit: 'contain',
                          marginBottom: 2,
                        }}
                      />
                      <CardContent>
                        <Typography
                          variant="h6"
                          align="center"
                          color="white"
                          fontWeight="bold"
                        >
                          Phone
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>

                  <Card
                    onClick={() => handleDeviceTypeSelect('Laptop')}
                    sx={{
                      width: 200,
                      height: 250,
                      borderRadius: '16px',
                      boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0px 6px 25px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    <CardActionArea sx={{ height: '100%' }}>
                      <CardMedia
                        component="img"
                        image="/images/laptop.png"
                        alt="Laptop"
                        sx={{
                          marginLeft: 'auto',
                          marginRight: 'auto',
                          height: '160px',
                          width: '160px',
                          objectFit: 'contain',
                          marginBottom: 2,
                        }}
                      />
                      <CardContent>
                        <Typography
                          variant="h6"
                          align="center"
                          color="white"
                          fontWeight="bold"
                        >
                          Laptop
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              </Fade>
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
                    <FormControl onSubmit={handleSubmit}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'white',
                          mb: 3,
                          fontWeight: 'bold',
                          marginTop: { xs: 3, sm: 3, md: 3 },
                        }}
                        gutterBottom
                      >
                        Select Specifications
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          height: 'auto',
                          gap: 2,
                          p: 2,
                        }}
                      >
                        {/* Brand Selection */}
                        <Box
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: 5,
                            p: 2,
                            flex: { xs: '1 1 auto', md: '1 0 30%' },
                            color: 'white',
                            paddingLeft: '40px',
                            marginBottom: 'auto'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ marginBottom: 1 }}
                            gutterBottom
                          >
                            Brands
                          </Typography>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: 1,
                            }}
                          >
                            {[
                              'Apple', 'Samsung', 'Google', 'Motorola', 'Vivo', 'Oppo',
                              'Realme', 'OnePlus', 'LG', 'Mi', 'IQOO', 'ASUS',
                              'HTC', 'Sony', 'Tecno', 'Nokia', 'Honor',
                            ].map((brand) => (
                              <FormControlLabel
                                key={brand}
                                control={
                                  <Checkbox
                                    id={brand}
                                    value={brand}
                                    onChange={(e) => handleCheckboxChange(e, 'brand')}
                                    checked={phoneFormData.brand.includes(brand)}
                                    sx={{
                                      color: 'white',
                                      '&.Mui-checked': { color: 'white' },
                                    }}
                                  />
                                }
                                label={<Typography color="white" variant="body2">{brand}</Typography>}
                              />
                            ))}
                          </Box>
                        </Box>

                        {/* Specifications */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            flex: { xs: '1 1 auto', md: '2 0 60%' },
                          }}
                        >
                          {/* Price Range */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ marginBottom: 1 }}
                              color='white'
                            >
                              Price Range
                            </Typography>
                            <Slider
                              value={priceRange}
                              onChange={handlePriceChange}
                              valueLabelDisplay="auto"
                              min={0}
                              max={250000}
                              sx={{ color: 'white', width: '80%' }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2 }}>
                              <TextField
                                name="min"
                                value={priceRange[0]}
                                onChange={(e) => handlePriceChange(e, [Number(e.target.value), priceRange[1]])}
                                size="small"
                                sx={{
                                  backgroundColor: 'white',
                                  borderRadius: 5,
                                  width: '30%',
                                  input: { textAlign: 'center', fontSize: '0.85rem' },
                                }}
                              />
                              <TextField
                                name="max"
                                value={priceRange[1]}
                                onChange={(e) => handlePriceChange(e, [priceRange[0], Number(e.target.value)])}
                                size="small"
                                sx={{
                                  backgroundColor: 'white',
                                  borderRadius: 5,
                                  width: '30%',
                                  input: { textAlign: 'center', fontSize: '0.85rem' },
                                }}
                              />
                            </Box>
                          </Box>

                          {/* RAM Selection */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white' >
                              RAM
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {['4 GB', '3 GB', '2 GB', '1GB and Below', '8 GB and Above', '6 GB'].map((ram) => (
                                <FormControlLabel
                                  key={ram}
                                  control={
                                    <Checkbox
                                      id={ram}
                                      value={ram}
                                      onChange={(e) => handleCheckboxChange(e, 'selectedRams')}
                                      checked={phoneFormData.selectedRams.includes(ram)}
                                      sx={{
                                        color: 'white',
                                        '&.Mui-checked': { color: 'white' },
                                      }}
                                    />
                                  }
                                  label={<Typography color="white" variant="body2">{ram}</Typography>}
                                />
                              ))}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 1 }}>
                            {/* Internal Storage Selection */}
                            <Box
                              sx={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: 5,
                                p: 2,
                                color: 'white',
                              }}
                            >
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Internal Storage
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {[
                                  "256 GB & Above",
                                  "128 - 255.9 GB",
                                  "64 - 127.9 GB",
                                  "32 - 63.9 GB",
                                  "16 - 31.9 GB",
                                  "Less than 16 GB",
                                ].map((storageOption) => (
                                  <FormControlLabel
                                    key={storageOption}
                                    control={
                                      <Checkbox
                                        id={storageOption}
                                        value={storageOption}
                                        onChange={(e) => handleCheckboxChange(e, 'selectedStorage')}
                                        checked={phoneFormData.selectedStorage.includes(storageOption)}
                                        sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                      />
                                    }
                                    label={<Typography variant="body2">{storageOption}</Typography>}
                                    sx={{
                                      flex: '1 1 45%',
                                      m: 0,
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>

                            {/* Battery Capacity Selection */}
                            <Box
                              sx={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: 5,
                                p: 2,
                                color: 'white',
                              }}
                            >
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Battery Capacity
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {[
                                  "1000 - 1999 mAh",
                                  "2000 - 2999 mAh",
                                  "3000 - 3999 mAh",
                                  "4000 - 4999 mAh",
                                  "5000 - 5999 mAh",
                                  "6000 mAh & Above",
                                  "Less than 1000 mAh",
                                ].map((batteryOption) => (
                                  <FormControlLabel
                                    key={batteryOption}
                                    control={
                                      <Checkbox
                                        id={batteryOption}
                                        value={batteryOption}
                                        onChange={(e) => handleCheckboxChange(e, 'selectedBattery')}
                                        checked={phoneFormData.selectedBattery.includes(batteryOption)}
                                        sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                      />
                                    }
                                    label={<Typography variant="body2">{batteryOption}</Typography>}
                                    sx={{
                                      flex: '1 1 45%',
                                      m: 0,
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>

                            {/* Screen Size Selection */}
                            <Box
                              sx={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: 5,
                                p: 2,
                                color: 'white',
                              }}
                            >
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Screen Size
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {[
                                  "6.4 inch & Above",
                                  "6 - 6.3 inch",
                                  "5.7 - 5.9 inch",
                                  "5.5 - 5.6 inch",
                                  "5.2 - 5.4 inch",
                                  "4.5 - 4.9 inch",
                                  "4 - 4.4 inch",
                                ].map((screenOption) => (
                                  <FormControlLabel
                                    key={screenOption}
                                    control={
                                      <Checkbox
                                        id={screenOption}
                                        value={screenOption}
                                        onChange={(e) => handleCheckboxChange(e, 'selectedScreen')}
                                        checked={phoneFormData.selectedScreen.includes(screenOption)}
                                        sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                      />
                                    }
                                    label={<Typography variant="body2">{screenOption}</Typography>}
                                    sx={{
                                      flex: '1 1 45%',
                                      m: 0,
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>

                            {/* Processor Clock Speed Selection */}
                            <Box
                              sx={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: 5,
                                p: 2,
                                color: 'white',
                              }}
                            >
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Processor Clock Speed
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {[
                                  "2.5 GHz & Above",
                                  "2.2 - 2.4 GHz",
                                  "2 - 2.1 GHz",
                                  "1.5 - 1.9 GHz",
                                  "Below 1.5 GHz",
                                ].map((clockOption) => (
                                  <FormControlLabel
                                    key={clockOption}
                                    control={
                                      <Checkbox
                                        id={clockOption}
                                        value={clockOption}
                                        onChange={(e) => handleCheckboxChange(e, 'selectedClock')}
                                        checked={phoneFormData.selectedClock.includes(clockOption)}
                                        sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                      />
                                    }
                                    label={<Typography variant="body2">{clockOption}</Typography>}
                                    sx={{
                                      flex: '1 1 45%',
                                      m: 0,
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </FormControl>
                  )}

                  {/* Laptop-specific inputs */}
                  {showLaptopInputs && (
                    <FormControl onSubmit={handleSubmit}>
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'white',
                          mb: 3,
                          fontWeight: 'bold',
                          marginTop: { xs: 3, sm: 3, md: 3 },
                        }}
                        gutterBottom
                      >
                        Select Specifications
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          height: 'auto',
                          gap: 2,
                          p: 2,
                        }}
                      >
                        {/* Brand Selection */}
                        <Box
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: 5,
                            p: 2,
                            flex: { xs: '1 1 auto', md: '1 0 30%' },
                            color: 'white',
                            paddingLeft: '40px',
                            marginBottom: 'auto',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ marginBottom: 1 }}
                            gutterBottom
                          >
                            Brands
                          </Typography>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: 1,
                            }}
                          >
                            {[
                              "HP", "ASUS", "Lenovo", "DELL", "MSI", "Avita", "Acer", "Apple", "Infinix",
                              "Samsung", "AXL", "Ultimus", "Gigabyte", 
                              "Zebronics", "Colorful", "Thomson", "Chuwi", "Wings", "realme", "Microsoft",
                              "Vaio", "Alienware", "walker", "Primebook"
                            ].map((brand) => (
                              <FormControlLabel
                                key={brand}
                                control={
                                  <Checkbox
                                    id={brand}
                                    value={brand}
                                    onChange={(e) => handleCheckboxChange(e, 'brand')}
                                    checked={laptopFormData.brand.includes(brand)}
                                    sx={{
                                      color: 'white',
                                      '&.Mui-checked': { color: 'white' },
                                    }}
                                  />
                                }
                                label={<Typography color="white" variant="body2">{brand}</Typography>}
                              />
                            ))}
                          </Box>
                        </Box>

                        {/* Specifications */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            flex: { xs: '1 1 auto', md: '2 0 60%' },
                          }}
                        >
                          {/* Price Range */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white'>
                              Price Range
                            </Typography>
                            <Slider
                              value={priceRange}
                              onChange={handlePriceChange}
                              valueLabelDisplay="auto"
                              min={0}
                              max={300000}
                              sx={{ color: 'white', width: '70%' }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2 }}>
                              <TextField
                                name="min"
                                value={priceRange[0]}
                                onChange={(e) => handlePriceChange(e, [Number(e.target.value), priceRange[1]])}
                                size="small"
                                sx={{
                                  backgroundColor: 'white',
                                  borderRadius: 5,
                                  width: '40%',
                                  input: { textAlign: 'center', fontSize: '0.85rem' },
                                }}
                              />
                              <TextField
                                name="max"
                                value={priceRange[1]}
                                onChange={(e) => handlePriceChange(e, [priceRange[0], Number(e.target.value)])}
                                size="small"
                                sx={{
                                  backgroundColor: 'white',
                                  borderRadius: 5,
                                  width: '40%',
                                  input: { textAlign: 'center', fontSize: '0.85rem' },
                                }}
                              />
                            </Box>
                          </Box>

                          {/* RAM Selection */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white'>
                              RAM
                            </Typography>
                            <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                              {["8 GB", "4 GB", "16 GB", "32 GB", "2 GB", "18 GB", "48 GB", "64 GB", "12 GB", "36 GB", "24 GB"].map((laptopRamOption) => (
                                <FormControlLabel
                                  key={laptopRamOption}
                                  control={
                                    <Checkbox
                                      id={laptopRamOption}
                                      value={laptopRamOption}
                                      onChange={(e) => handleCheckboxChange(e, 'selectedRams')}
                                      checked={laptopFormData.selectedRams.includes(laptopRamOption)}
                                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                    />
                                  }
                                  label={<Typography color="white" variant="body2">{laptopRamOption}</Typography>}
                                  sx={{
                                    width: 100,
                                    margin: 0,
                                  }}
                                />
                              ))}
                            </FormGroup>
                          </Box>

                          {/* SSD Storage Selection */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white'>
                              SSD Storage
                            </Typography>
                            <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                              {["512 GB", "256 GB", "1 TB", "128 GB", "2 TB"].map((ssdOption) => (
                                <FormControlLabel
                                  key={ssdOption}
                                  control={
                                    <Checkbox
                                      id={ssdOption}
                                      value={ssdOption}
                                      onChange={(e) => handleCheckboxChange(e, 'selectedSSD')}
                                      checked={laptopFormData.selectedSSD.includes(ssdOption)}
                                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                    />
                                  }
                                  label={<Typography color="white" variant="body2">{ssdOption}</Typography>}
                                  sx={{
                                    width: 100,
                                    margin: 0,
                                  }}
                                />
                              ))}
                            </FormGroup>
                          </Box>

                          {/* Graphics Selection */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white'>
                              Graphics Card Series
                            </Typography>
                            <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                              {["Intel Integrated", "AMD Radeon", "NVIDIA GeForce RTX", "AMD Radeon RDNA 3", "Qualcomm Adreno"].map((graphicsOption) => (
                                <FormControlLabel
                                  key={graphicsOption}
                                  control={
                                    <Checkbox
                                      id={graphicsOption}
                                      value={graphicsOption}
                                      onChange={(e) => handleCheckboxChange(e, 'selectedGraphics')}
                                      checked={laptopFormData.selectedGraphics.includes(graphicsOption)}
                                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                    />
                                  }
                                  label={<Typography color="white" variant="body2">{graphicsOption}</Typography>}
                                  sx={{
                                    width: 100,
                                    margin: 0,
                                  }}
                                />
                              ))}
                            </FormGroup>
                          </Box>

                          {/* Screen Size Selection */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white'>
                              Screen Size
                            </Typography>
                            <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                              {["Below 12 inch", "12 inch - 12.9 inch", "13 inch - 13.9 inch", "14 inch - 14.9 inch", "15 inch - 15.9 inch", "16 inch - 17.9 inch", "18 inch - 20 inch", "Above 20 inch"].map((laptopScreenOption) => (
                                <FormControlLabel
                                  key={laptopScreenOption}
                                  control={
                                    <Checkbox
                                      id={laptopScreenOption}
                                      value={laptopScreenOption}
                                      onChange={(e) => handleCheckboxChange(e, 'selectedScreen')}
                                      checked={laptopFormData.selectedScreen.includes(laptopScreenOption)}
                                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                    />
                                  }
                                  label={<Typography color="white" variant="body2">{laptopScreenOption}</Typography>}
                                  sx={{
                                    width: 100,
                                    margin: 0,
                                  }}
                                />
                              ))}
                            </FormGroup>
                          </Box>

                          {/* Graphics Memory Selection */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white'>
                              Graphics Memory
                            </Typography>
                            <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                              {["128 MB", "512 MB", "1 GB", "2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "16 GB"].map((graphicsMemOption) => (
                                <FormControlLabel
                                  key={graphicsMemOption}
                                  control={
                                    <Checkbox
                                      id={graphicsMemOption}
                                      value={graphicsMemOption}
                                      onChange={(e) => handleCheckboxChange(e, 'selectedGraphicsMemory')}
                                      checked={laptopFormData.selectedGraphicsMemory.includes(graphicsMemOption)}
                                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                    />
                                  }
                                  label={<Typography color="white" variant="body2">{graphicsMemOption}</Typography>}
                                  sx={{
                                    width: 100,
                                    margin: 0,
                                  }}
                                />
                              ))}
                            </FormGroup>
                          </Box>

                          {/* Hard Disk Selection */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white'>
                              HDD Storage
                            </Typography>
                            <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                              {["1 TB", "256 GB", "500 GB"].map((hddOption) => (
                                <FormControlLabel
                                  key={hddOption}
                                  control={
                                    <Checkbox
                                      id={hddOption}
                                      value={hddOption}
                                      onChange={(e) => handleCheckboxChange(e, 'selectedHDD')}
                                      checked={laptopFormData.selectedHDD.includes(hddOption)}
                                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                    />
                                  }
                                  label={<Typography color="white" variant="body2">{hddOption}</Typography>}
                                  sx={{
                                    width: 100,
                                    margin: 0,
                                  }}
                                />
                              ))}
                            </FormGroup>
                          </Box>

                          {/* Processor Brand Selection */}
                          <Box
                            sx={{
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 5,
                              p: 2,
                            }}
                          >
                            <Typography variant="body2" sx={{ marginBottom: 1 }} color='white'>
                              Processor Brand
                            </Typography>
                            <FormGroup row sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                              {["AMD", "Intel", "Apple", "Qualcomm", "MediaTek"].map((processorOption) => (
                                <FormControlLabel
                                  key={processorOption}
                                  control={
                                    <Checkbox
                                      id={processorOption}
                                      value={processorOption}
                                      onChange={(e) => handleCheckboxChange(e, 'selectedProcessor')}
                                      checked={laptopFormData.selectedProcessor.includes(processorOption)}
                                      sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                                    />
                                  }
                                  label={<Typography color="white" variant="body2">{processorOption}</Typography>}
                                  sx={{
                                    width: 100,
                                    margin: 0,
                                  }}
                                />
                              ))}
                            </FormGroup>
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
                    marginTop: 3,
                    marginBottom: 3
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: "white" }}>
          <CircularProgress sx={{ color: 'white' }} size={60} thickness={5} />
        </Box>
      )}

      {/* Product Cards Section */}
      {!loading && products.length > 0 && (
        <Fade in={true} timeout={1000}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3, // Consistent spacing between cards
              flexWrap: 'wrap',
              padding: 2,
              height: '100%',
              width: '100%',
              marginX: { xs: 1, sm: 2, md: 5}, // Add margins for larger screens
            }}
          >
            {products.map((product, index) => (
              <Card
                key={index}
                sx={{
                  width: { xs: '80%', sm: '45%', md: '20%' }, 
                  height: 450,
                  borderRadius: '16px',
                  boxShadow: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                  color: 'white',
                  margin: 1
                }}
              >
                {/* Product Image */}
                <CardMedia
                  component="img"
                  image={product.image}
                  alt={product.name}
                  sx={{
                    height: 200,
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px 16px 0 0',
                  }}
                />

                {/* Product Content */}
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" sx={{ marginTop: 1 }}>
                    {product.price}
                  </Typography>

                  {/* Links and Wishlist */}
                  <Box sx={{ marginTop: 1 }}>
                    <Chip
                      label="Flipkart"
                      component="a"
                      href={product.flipkartLink}
                      target="_blank"
                      clickable
                      color="primary"
                    />
                    <Box sx={{ marginTop: 1 }}>
                      <FavoriteIcon
                        onClick={() => toggleWishlist(product.name, product.image, product.flipkartLink)}
                        color={
                          getMultiCookie('wishlist')?.some(item => item.link === product.flipkartLink)
                            ? 'error'
                            : 'disabled'
                        }
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Fade>
      )}
    </Box>
  );
}

export default Suggest;