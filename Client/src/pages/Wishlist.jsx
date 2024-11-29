import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Box, Fade } from '@mui/material';
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

  const [wishlistEmpty, setWishlistEmpty] = useState(false);

  useEffect(() => {
    const wishlistData = getMultiCookie('wishlist');
    if (wishlistData == null) {
      setWishlistEmpty(true);
    }
    setWishlist(wishlistData);
  }, []);

  return (
    <>
    {wishlistEmpty ? (
      <Fade in={true} timeout={1000}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            textAlign: 'center',
          }}
        >
          <Typography sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            color: 'white',
            mb: 3,
            fontSize: '2.2rem',
            fontWeight: 'bold',
          }}>
            Wishlist is empty. Add some products!!
          </Typography>
        </Box>
      </Fade>
    ) : (
      <Fade in={true} timeout={1000}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            margin: 2,
            height: 'auto',
            marginLeft: {md: 10, xs: 2},
            marginRight: {md: 10, xs: 2}
          }}
        >
          {wishlist.map((item, index) => (
            <Card
              key={index}
              sx={{
                width: { xs: '85%', sm: '45%', md: '15%' }, 
                height: 300,
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
                image={item.image}
                alt={item.name}
                sx={{
                  height: 150,
                  width: '100%',
                  objectFit: 'cover',
                  borderRadius: '16px 16px 0 0',
                }}
              />

              {/* Product Content */}
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" noWrap>
                  {item.title.length > 40 ? `${item.title.slice(0, 40)}...` : item.title}
                </Typography>

                {/* Links and Wishlist */}
                <Box sx={{ marginTop: 1 }}>
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
                  <FavoriteIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item.title, item.image, item.link);
                    }}
                    color={getMultiCookie('wishlist')?.some((it) => it.link === item.link) ? 'error' : 'disabled'}
                    sx={{
                      cursor: 'pointer',
                      marginTop: 1,
                      display: 'block',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Fade>
      )}
    </>
  );
};

export default Wishlist;
