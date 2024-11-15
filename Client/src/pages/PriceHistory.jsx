import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, CircularProgress, Box, Typography} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip } from 'chart.js';
import FavoriteIcon from '@mui/icons-material/Favorite';

const setCookie = (name, value, days) => {
    const expires = days ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}` : '';
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value)) || ''}${expires}; path=/`;
};
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? JSON.parse(decodeURIComponent(match[2])) : null;
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
        if (!inputValue || !allowedPrefixes.some(prefix => inputValue.startsWith(prefix))) {
            setError('Please enter a valid link from Flipkart or Amazon.');
            return;
        }
        setSubmitted(true);
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/phistory`, { inputValue });
            console.error(response)
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
                    if (previousPrice === null || Math.abs(price - previousPrice) > 1) { // Threshold can be adjusted
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
            console.error('Error sending data to server:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {submitted ? (
                loading ? (
                    <Box sx={{ marginTop: 25 }}>
                        <CircularProgress sx={{ color: 'white' }} size={60} thickness={5} />
                    </Box>
                ) : (
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
                        }}>
                            <Box sx={{
                                width: '20%',
                                margin: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                borderRadius: 5,
                                backgroundColor: 'rgba(0,0,0,0.1)'
                            }}>
                                <br />
                                <br />
                                <br />
                                <br />
                                <Box sx={{
                                    width: 'cover',
                                    height: 'auto',
                                    margin: 1,
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                    borderRadius: 10,
                                    display: 'flex',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    alignItems: 'center',
                                }}>
                                    {title}
                                </Box>
                                <br />
                                <Box sx={{
                                    width: 'cover',
                                    height: 'auto',
                                    margin: 1,
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                    borderRadius: 5,
                                    display: 'flex',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    alignItems: 'center',
                                    padding: 2,
                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                }}>
                                    Min Price: ₹{minPrice}
                                </Box>
                                <br />
                                <Box sx={{
                                    width: 'cover',
                                    height: 'auto',
                                    margin: 1,
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                    borderRadius: 5,
                                    display: 'flex',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    alignItems: 'center',
                                    padding: 2,
                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                }}>
                                    Max Price: ₹{maxPrice}
                                </Box>
                                <br />
                                <FavoriteIcon
                                    onClick={() => toggleWishlist(title, prodimage, inputValue)}
                                    color={getCookie('wishlist')?.some(item => item.link === inputValue) ? 'error' : 'disabled'}
                                    sx={{ cursor: 'pointer', marginTop: 1, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto' }}
                                />
                            </Box>
                            <Box sx={{
                                width: '30%',
                                background: 'white',
                                margin: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                borderRadius: 10,
                                backgroundColor: 'rgba(0,0,0,0.1)'
                            }}>
                               <Box sx={{
                                    width: 'cover',
                                    height: '50%',
                                    background: 'transparent',
                                    margin: 2
                               }}>
                                    <img src={prodimage} style={{width: '60%', height: '100%', borderRadius: 10}} />
                               </Box>
                               <Box sx={{
                                    width: '50%',
                                    height: '25%',
                                    margin: 2,
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                    borderRadius: 5,
                                    display: 'flex',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.1)'
                               }}>
                                    Current Price: {curPrice}
                               </Box>
                            </Box>
                            <Box sx={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                alignItems: 'right',
                                width: '50%',
                                height: 'cover',
                                margin: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                padding: 3,
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
                )
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 150 }}>
                    <TextField
                        label="Enter your link"
                        variant="outlined"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
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
                    />
                    {error && (
                        <Typography variant="body2" sx={{ color: 'red', marginBottom: '10px' }}>
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
        </div>
    );
}

export default PriceHistory;
