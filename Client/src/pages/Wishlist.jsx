import React, { useEffect, useState } from 'react';
import { Card, Chip, CardContent, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Function to retrieve the wishlist data from cookies
const setMultiCookie = (name, data, days) => {
  const jsonData = JSON.stringify(data);
  const chunkSize = 3800; // Slightly less than 4 KB to account for encoding and metadata
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

  // Add metadata for tracking chunks
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

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  
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


  useEffect(() => {
    const wishlistData = getMultiCookie('wishlist');
    setWishlist(wishlistData);
  }, []);

  return (
    <Box 
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        padding: 2,
        marginLeft: 10,
        marginRight: 10
      }}
    >
      {wishlist.map((item, index) => (
        <Box key={index} 
            sx={{ 
                width: 200, 
                minHeight: 355,
                marginBottom: 2
            }}
        >
            <Card sx={{
                backgroundColor: 'transparent', 
                borderRadius: "25px", 
                boxShadow: 5, 
                color: 'white',
                minHeight: 355,
            }}>
                <Box
                    component="img"
                    src={item.image}
                    alt={item.title}
                    sx={{
                        height: 140,
                        width: '100%',
                    }}
                />
                <CardContent>
                <Typography variant="h6">
                    {item.title.length > 40 ? `${item.title.slice(0, 40)}...` : item.title}
                </Typography>
                <Typography variant="body2">
                    <Chip
                        label="View Product"
                        component="a"
                        href={item.link}
                        clickable
                        sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            color: 'white',
                            marginTop: 1,
                            padding: '2px 10px',
                        }}
                    />
                </Typography>
                <FavoriteIcon
                        onClick={() => toggleWishlist(item.name, item.image, item.link)}
                        color={getMultiCookie('wishlist')?.some(item => item.link === item.link) ? 'error' : 'disabled'}
                        sx={{ cursor: 'pointer', marginTop: 1, marginLeft: 'auto', marginRight: 'auto' }}
                      />
                </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
};

export default Wishlist;
