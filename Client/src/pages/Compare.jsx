import React, { useState } from 'react';
import axios from 'axios';
import { Table, TableHead, TableCell, TableRow, TableBody, CircularProgress, TextField, Button, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const setCookie = (name, value, days) => {
    const expires = days ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}` : '';
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value)) || ''}${expires}; path=/`;
};
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? JSON.parse(decodeURIComponent(match[2])) : null;
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
        setLoading(true);  // Set loading to true when the request starts
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/compare`, { link1, link2 });
            setLoading(false);  // Set loading to false once the response is received
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
            setLoading(false);  // Set loading to false in case of error
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            {/* Show form if not loading or there is an error */}
            {!loading && !comparisonData && (
                <form onSubmit={handleSubmit} style={{ margin: 'auto', maxWidth: '400px', marginTop: 100 }}>
                    <TextField
                        type="text"
                        label="1st Link"
                        value={link1}
                        onChange={(e) => setLink1(e.target.value)}
                        placeholder="Enter first product link"
                        variant="outlined"
                        sx={{
                            width: { xs: 250, md: 400 },
                            marginBottom: '20px',
                            input: {
                                color: 'white',
                                fontWeight: 'bold',
                                backgroundColor: 'transparent',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'white',
                                    borderWidth: 2,
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
                    <TextField
                        type="text"
                        label="2nd Link"
                        value={link2}
                        onChange={(e) => setLink2(e.target.value)}
                        placeholder="Enter second product link"
                        variant="outlined"
                        sx={{
                            width: { xs: 250, md: 400 },
                            marginBottom: '20px',
                            input: {
                                color: 'white',
                                fontWeight: 'bold',
                                backgroundColor: 'transparent',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'white',
                                    borderWidth: 2,
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
                            fontSize: '18px'
                        }} 
                    >
                        Compare
                    </Button>
                </form>
            )}

            {/* Show loading spinner while fetching data */}
            {loading && <CircularProgress style={{ marginTop: 180, color: 'white' }} size={60} thickness={5} />}

            {/* Show error message */}
            {error && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '20px' }}>{error}</p>}

            {/* Show Table if comparison data is available */}
            {comparisonData && (
                <Table sx={{
                    width: 700,
                    height: 600,
                    margin: 'auto',
                    backgroundColor: 'transparent',
                    borderCollapse: 'collapse',
                    textAlign: 'center',
                    border: 5,
                    borderColor: 'white',
                    borderRadius: 10,
                    fontWeight: 'bold'
                }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ color: 'white' }}>Feature</TableCell>
                            <TableCell align="center" sx={{ color: 'white' }}>Product 1</TableCell>
                            <TableCell align="center" sx={{ color: 'white' }}>Product 2</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {comparisonData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell align="center" sx={{ color: 'white' }}>
                                    {index === 1 ? (
                                        <span>Product Image</span>
                                    ) : (
                                        row[0]
                                    )}
                                </TableCell>
                                <TableCell align="center" sx={{ color: 'white' }}>
                                    {index === 1 ? (
                                        <img src={row[1]} width={170} height={150} style={{ borderRadius: 16 }} />
                                    ) : (
                                        row[1]
                                    )}
                                </TableCell>
                                <TableCell align="center" sx={{ color: 'white' }}>
                                    {index === 1 ? (
                                        <img src={row[2]} width={170} height={150} style={{ borderRadius: 16 }} />
                                    ) : (
                                        row[2]
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell align="center" sx={{ color: 'white' }}>Tools</TableCell>
                            <TableCell align="center" sx={{ color: 'white' }}>
                                <Chip
                                    label="Product Link"
                                    component="a"
                                    href={link1}
                                    target="_blank"
                                    clickable
                                    color="primary"
                                />
                                <br />
                                <FavoriteIcon
                                    onClick={() => toggleWishlist(title1, img1, link1)}
                                    color={getCookie('wishlist')?.some(item => item.link === link1) ? 'error' : 'disabled'}
                                    sx={{ cursor: 'pointer', marginTop: 1, marginLeft: 'auto', marginRight: 'auto' }}
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
                                />
                                <br />
                                <FavoriteIcon
                                    onClick={() => toggleWishlist(title2, img2, link2)}
                                    color={getCookie('wishlist')?.some(item => item.link === link2) ? 'error' : 'disabled'}
                                    sx={{ cursor: 'pointer', marginTop: 1, marginLeft: 'auto', marginRight: 'auto' }}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

export default Compare;
