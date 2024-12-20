import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, CircularProgress, Box, Typography, Fade } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip } from 'chart.js';
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
  
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

function PriceHistory() {
    const [inputValue, setInputValue] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [minPrice, setMinPrice] = useState(null);
    const [error, setError] = useState('');
    const [dataError, setDataError] = useState('');
    const [maxPrice, setMaxPrice] = useState(null);
    const [title, setTitle] = useState(null);
    const [prodimage, setProdImage] = useState(null);
    const [curPrice, setCurPrice] = useState(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Price History',
                data: [],
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: 'white',
                pointBorderColor: 'white',
            },
        ],
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
        if (!inputValue || !allowedPrefixes.some(prefix => inputValue.startsWith(prefix))) {
            setError('Please enter a valid link from Flipkart or Amazon.');
            return;
        }
        setSubmitted(true);
        setLoading(true);
        try {
            const url = inputValue.split('?pid=')[0]
            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/phistory`, { url });
            const { dates, prices, title, image, currentprice } = response.data;
            setTitle(title)
            setProdImage(image)
            setCurPrice(currentprice)
            // Filtering logic: only keep values with noticeable changes
            var filteredDates = [];
            var filteredPrices = [];
            let previousPrice = null;

            if(dates === null || prices === null) {
                setDataError('Some data not available. The product is new or we do not have enough data to show.');
                const max = "NA";
                const min = "NA";
                setMaxPrice(max);
                setMinPrice(min);
                filteredDates = "NA";
                filteredPrices = "NA";
            } else {
                dates.forEach((date, index) => {
                    const price = prices[index];
                    if (previousPrice === null || Math.abs(price - previousPrice) > 1) {
                        filteredDates.push(date);
                        filteredPrices.push(price);
                        previousPrice = price;
                    }
                });
                const max = Math.max(...filteredPrices);
                const min = Math.min(...filteredPrices);
                setMaxPrice(max);
                setMinPrice(min);    
            }

            setChartData({
                labels: filteredDates,
                datasets: [
                    {
                        ...chartData.datasets[0],
                        data: filteredPrices,
                    },
                ],
            });
        } catch (error) {
            setLoading(false);
            setSubmitted(false)
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fade in={true} timeout={1000}>
            <Box sx={{ height: '100%', width: '100%' }}>
                {submitted ? (
                    loading ? (
                        <Box sx={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress sx={{ color: 'white' }} size={60} thickness={5} />
                        </Box>
                    ) : (
                        <Fade in={true} timeout={1000}>
                            <div>
                                {dataError && (
                                    <Typography variant="body2" sx={{ color: 'red', marginTop: 1, marginBottom: -1 }}>
                                        {dataError}
                                    </Typography>
                                )}
                                <Box sx={{
                                    background: 'transparent',
                                    width: 'cover',
                                    height: 400,
                                    margin: 5,
                                    display: 'flex',
                                    flexDirection: {md: 'row', xs: 'column' }
                                }}>
                                    <Box sx={{
                                        width: { xs: '90%', md: '20%' },
                                        margin: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        borderRadius: 5,
                                        padding: 1,
                                        backgroundColor: 'rgba(0,0,0,0.1)'
                                    }}>
                                        <Box sx={{
                                            width: 'auto',
                                            height: 'auto',
                                            margin: 1,
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            borderRadius: 10,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1.3rem',
                                            textAlign: 'center'
                                        }}>
                                            {title}
                                        </Box>
                                        <Box sx={{
                                            width: 'auto',
                                            height: 'auto',
                                            margin: 1,
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            borderRadius: 5,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1.3rem',
                                            textAlign: 'center',
                                            padding: 2,
                                            backgroundColor: 'rgba(0,0,0,0.1)'
                                        }}>
                                            Min Price: ₹{minPrice}
                                        </Box>
                                        <Box sx={{
                                            width: 'auto',
                                            height: 'auto',
                                            margin: 1,
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            borderRadius: 5,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1.3rem',
                                            textAlign: 'center',
                                            padding: 2,
                                            backgroundColor: 'rgba(0,0,0,0.1)'
                                        }}>
                                            Max Price: ₹{maxPrice}
                                        </Box>
                                        <FavoriteIcon
                                            onClick={() => toggleWishlist(title, prodimage, inputValue)}
                                            color={getMultiCookie('wishlist')?.some(item => item.link === inputValue) ? 'error' : 'disabled'}
                                            sx={{ cursor: 'pointer', marginTop: {md: 5, xs: 1}, marginLeft: 'auto', marginRight: 'auto' }}
                                        />
                                    </Box>
                                    <Box sx={{
                                        width: {md: '30%', xs: '90%'},
                                        background: 'white',
                                        margin: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        borderRadius: 10,
                                        padding: 1,
                                        backgroundColor: 'rgba(0,0,0,0.1)'
                                    }}>
                                    <Box sx={{
                                            height: '45%',
                                            background: 'transparent',
                                            margin: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                    }}>
                                            <img src={prodimage} style={{width: '60%', height: '100%', borderRadius: 10}} />
                                    </Box>
                                    <Box sx={{
                                            width: '50%',
                                            height: 'auto',
                                            margin: 2,
                                            padding: 2,
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            borderRadius: 5,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1.3rem',
                                            textAlign: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.1)'
                                    }}>
                                            Current Price: {curPrice}
                                    </Box>
                                    </Box>
                                    <Box sx={{
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        alignItems: 'right',
                                        width: {md: '50%', xs: '90%'},
                                        height: 'cover',
                                        margin: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        padding: 1,
                                        borderRadius: 5,
                                    }}>
                                        <Line
                                            data={chartData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    tooltip: {
                                                        enabled: true,
                                                        callbacks: {
                                                            label: function (context) {
                                                                const date = context.label;
                                                                const price = context.raw;
                                                                return `Date: ${date} | Price: ₹${price}`;
                                                            },
                                                        },
                                                        titleFont: {
                                                            size: 16,
                                                        },
                                                        bodyFont: {
                                                            size: 14,
                                                        },
                                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                        titleColor: 'white',
                                                        bodyColor: 'white',
                                                    },
                                                    legend: {
                                                        labels: {
                                                            color: 'white',
                                                            font: {
                                                                size: 16,
                                                                weight: 'bold',
                                                            },
                                                        },
                                                    },
                                                },
                                                scales: {
                                                    x: {
                                                        display: true,
                                                        grid: {
                                                            display: false,
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: 'Date',
                                                            color: 'white',
                                                            font: {
                                                                size: 16,
                                                                weight: 'bold',
                                                            },
                                                        },
                                                        ticks: {
                                                            display: false,
                                                        },
                                                    },
                                                    y: {
                                                        display: true,
                                                        grid: {
                                                            display: false,
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: 'Price',
                                                            color: 'white',
                                                            font: {
                                                                size: 16,
                                                                weight: 'bold',
                                                            },
                                                        },
                                                        ticks: {
                                                            display: false,
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>                        
                                </Box>
                            </div>
                        </Fade>
                    )
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <TextField
                            label="Enter your link"
                            variant="outlined"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
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
                        />
                        {error && (
                            <Typography variant="body2" sx={{ color: 'red', marginTop: 2 }}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                color: 'white',
                                height: '50px',
                                width: '150px',
                                marginTop: 2,
                                borderRadius: '20px',
                                padding: '10px 30px',
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }}
                        >
                            Submit
                        </Button>
                    </form>
                )}
            </Box>
        </Fade>
    );
}

export default PriceHistory;
