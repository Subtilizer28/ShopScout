import React, { useState } from 'react';
import axios from 'axios';
import { Table, TableHead, TableCell, TableRow, TableBody, CircularProgress, TextField, Button, Chip, Box, Fade } from '@mui/material';
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

function Compare() {
    const [link1, setLink1] = useState('');
    const [link2, setLink2] = useState('');
    const [error, setError] = useState('');
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [title1, setTitle1] = useState(null);
    const [title2, setTitle2] = useState(null);
    const [img1, setImg1] = useState(null);
    const [img2, setImg2] = useState(null);
    
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

    const allowedPrefixes = [
        'https://www.flipkart.com/',
        'https://dl.flipkart.com/',
        'https://amazon.in/',
        'https://www.amazon.in/',
        'https://amzn.in/',
        'https://www.amzn.in/'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!link1 || !link2) || (!allowedPrefixes.some(prefix => link1.startsWith(prefix)) || !allowedPrefixes.some(prefix => link2.startsWith(prefix)))) {
            setError('Please enter a valid link from Flipkart or Amazon.');
            return;
        }
        setError('');
        setComparisonData(null);
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/compare`, { link1, link2 });
            setLoading(false);
            if (response.data === "notsimilar") {
                setError("Products are not similar. Please enter similar products.");
            } else {
                setComparisonData(response.data.comparisonResult);
                setTitle1(response.data.comparisonResult[0][1]);
                setTitle2(response.data.comparisonResult[0][2])
                setImg1(response.data.comparisonResult[1][1])
                setImg2(response.data.comparisonResult[1][2])
            }
        } catch (err) {
            setLoading(false);
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <Fade in={true} timeout={1000}>
            <div style={{ textAlign: 'center', height: '100%' }}>
            {/* Show form if not loading or there is an error */}
                {!loading && !comparisonData && (
                    <form onSubmit={handleSubmit} style={{ margin: 'auto', maxWidth: '90%', height: '100%' }}>
                    <Box sx={{
                        display: 'flex',
                        height: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
                        <TextField
                            type="text"
                            label="1st Link"
                            value={link1}
                            onChange={(e) => setLink1(e.target.value)}
                            placeholder="Enter first product link"
                            variant="outlined"
                            sx={{
                                width: {md: '60%', xs: '90%'},
                                input: {
                                    color: 'white',
                                    fontWeight: 'bold',
                                    backgroundColor: 'transparent',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                    borderColor: 'white',
                                    borderWidth: '0.125rem',
                                    },
                                    '&:hover fieldset': {
                                    borderColor: 'white',
                                    },
                                    '&.Mui-focused fieldset': {
                                    borderColor: 'white',
                                    },
                                },
                                label: {
                                    color: 'white',
                                    fontWeight: 'bold',
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'white',
                                },
                            }}
                            required
                        />
                        <br />
                        <TextField
                            type="text"
                            label="2nd Link"
                            value={link2}
                            onChange={(e) => setLink2(e.target.value)}
                            placeholder="Enter second product link"
                            variant="outlined"
                            sx={{
                                width: {md: '60%', xs: '90%'},
                                input: {
                                    color: 'white',
                                    fontWeight: 'bold',
                                    backgroundColor: 'transparent',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                    borderColor: 'white',
                                    borderWidth: '0.125rem',
                                    },
                                    '&:hover fieldset': {
                                    borderColor: 'white',
                                    },
                                    '&.Mui-focused fieldset': {
                                    borderColor: 'white',
                                    },
                                },
                                label: {
                                    color: 'white',
                                    fontWeight: 'bold',
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'white',
                                },
                            }}
                            required
                        />
                        <br />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                color: 'white',
                                height: '3rem',
                                width: '10rem',
                                borderRadius: '1.25rem',
                                padding: '0.625rem 1.875rem',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                            }}
                        >
                            Compare
                        </Button>
                    </Box>
                    </form>
                )}

                {/* Show loading spinner while fetching data */}
                {loading && 
                    <Box sx={{
                        display: 'flex',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <CircularProgress sx={{ color: 'white' }} size={60} thickness={5} />
                    </Box>            
                }
                {/* Show Table if comparison data is available */}
                {comparisonData && (
                    <Fade in={true} timeout={1000}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: { xs: '0 1rem', md: '0' },
                            }}
                        >
                            <Table
                                sx={{
                                    width: { xs: '100%', md: '90%' },
                                    backgroundColor: 'transparent',
                                    borderCollapse: 'collapse',
                                    textAlign: 'center',
                                    border: '0.3125rem solid white',
                                    borderRadius: '0.625rem',
                                    fontWeight: 'bold',
                                    marginTop: '2rem',
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" sx={{ color: 'white', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                            Feature
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'white', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                            Product 1
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'white', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                            Product 2
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {comparisonData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell align="center" sx={{ color: 'white', fontSize: { xs: '0.75rem', md: '1rem' } }}>
                                                {index === 1 ? <span>Product Image</span> : row[0]}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: 'white', fontSize: { xs: '0.75rem', md: '1rem' } }}>
                                                {index === 1 ? (
                                                    <img
                                                        src={row[1]}
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '10rem',
                                                            borderRadius: '1rem',
                                                        }}
                                                    />
                                                ) : (
                                                    row[1]
                                                )}
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: 'white', fontSize: { xs: '0.75rem', md: '1rem' } }}>
                                                {index === 1 ? (
                                                    <img
                                                        src={row[2]}
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '10rem',
                                                            borderRadius: '1rem',
                                                        }}
                                                    />
                                                ) : (
                                                    row[2]
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell align="center" sx={{ color: 'white', fontSize: { xs: '0.75rem', md: '1rem' } }}>
                                            Tools
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'white' }}>
                                            <Chip
                                                label="Product Link"
                                                component="a"
                                                href={link1}
                                                target="_blank"
                                                clickable
                                                color="primary"
                                                sx={{ margin: '0.5rem 0', fontSize: { xs: '0.75rem', md: '1rem' } }}
                                            />
                                            <br />
                                            <FavoriteIcon
                                                onClick={() => toggleWishlist(title1, img1, link1)}
                                                color={
                                                    getMultiCookie('wishlist')?.some(item => item.link === link1) ? 'error' : 'disabled'
                                                }
                                                sx={{ cursor: 'pointer', marginTop: '0.5rem', fontSize: { xs: '1.5rem', md: '2rem' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'white' }}>
                                            <Chip
                                                label="Product Link"
                                                component="a"
                                                href={link2}
                                                target="_blank"
                                                clickable
                                                color="primary"
                                                sx={{ margin: '0.5rem 0', fontSize: { xs: '0.75rem', md: '1rem' } }}
                                            />
                                            <br />
                                            <FavoriteIcon
                                                onClick={() => toggleWishlist(title2, img2, link2)}
                                                color={
                                                    getMultiCookie('wishlist')?.some(item => item.link === link2) ? 'error' : 'disabled'
                                                }
                                                sx={{ cursor: 'pointer', marginTop: '0.5rem', fontSize: { xs: '1.5rem', md: '2rem' } }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Fade>
                )}
            </div>
        </Fade>        
    );
}

export default Compare;
