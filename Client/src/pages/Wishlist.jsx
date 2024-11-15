import React, { useEffect, useState } from 'react';
import { Card, Chip, CardContent, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Function to retrieve the wishlist data from cookies
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? JSON.parse(decodeURIComponent(match[2])) : [];
};
const setCookie = (name, value, days) => {
  const expires = days ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}` : '';
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value)) || ''}${expires}; path=/`;
};

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  
  const toggleWishlist = (title, image, link) => {
    const wishlist = getCookie('wishlist') || [];
    const itemIndex = wishlist.findIndex(item => item.link === link);

    let updatedWishlist;
    if (itemIndex !== -1) {
        // Remove item if it already exists
        updatedWishlist = wishlist.filter((item) => item.link !== link);
    } else {
        // Add new item if it doesn't exist
        updatedWishlist = [...wishlist, { title, image, link }];
    }

    setCookie('wishlist', updatedWishlist, 7); // Expires in 7 days
  };

  useEffect(() => {
    const wishlistData = getCookie('wishlist');
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
                minHeight: 320,
                marginBottom: 2
            }}
        >
            <Card sx={{
                backgroundColor: 'transparent', 
                borderRadius: "25px", 
                boxShadow: 5, 
                color: 'white',
                minHeight: 320,
            }}>
                <Box
                    component="img"
                    src={item.image}
                    alt={item.title}
                    sx={{
                        height: 140,
                        width: '100%',
                        objectFit: 'cover',
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
                        color={getCookie('wishlist')?.some(item => item.link === item.link) ? 'error' : 'disabled'}
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
