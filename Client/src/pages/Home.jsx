import { Box, Typography, Button } from '@mui/material';

function Home({ onPageChange }) {
    return (
        <div style={{ height: '100%' }}>
            <Box sx={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
            }}>
                <Box sx={{
                    display: 'flex',
                    height: '100%',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: 2,
                }}>
                    {/* Text Content */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: { xs: 'center', md: 'flex-start' },
                        textAlign: { xs: 'center', md: 'left' },
                        padding: { xs: '20px 0', md: 3 },
                    }}>
                        <Typography 
                            variant="h2" 
                            sx={{ 
                                color: 'white', 
                                fontWeight: 700, 
                                textAlign: 'center',
                                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                            }}
                        >
                            SHOPSCOUT
                        </Typography>
                        <Box sx={{
                            width: '60px',
                            height: '10px',
                            background: 'white',
                            borderRadius: '5px',
                            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                            margin: 1,
                            marginTop: 2,
                            marginBottom: 2
                        }} />
                        <Typography variant="h6" sx={{ color: 'white', mb: 3, padding: '0 10px' }}>
                            Smart shopping made easy with product suggestions, price tracking, and seamless comparisons.
                        </Typography>

                        {/* Buttons */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: 2,
                            width: { xs: '60%', md: '73%' },
                            alignItems: 'center',
                        }}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'white',
                                    borderRadius: '20px',
                                    padding: 1.5,
                                    fontSize: '16px',
                                }}
                                onClick={() => onPageChange('Suggest')}>
                                Suggest Me
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'white',
                                    borderRadius: '20px',
                                    padding: 1.5,
                                    fontSize: '16px',
                                }}
                                onClick={() => onPageChange('Compare')}>
                                Compare
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'white',
                                    borderRadius: '20px',
                                    padding: 1.5,
                                    fontSize: '16px',
                                }}
                                onClick={() => onPageChange('Wishlist')}>
                                Wishlist
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'white',
                                    borderRadius: '20px',
                                    padding: 1.5,
                                    fontSize: '16px',
                                }}
                                onClick={() => onPageChange('Price History')}>
                                Price History
                            </Button>
                        </Box>
                    </Box>

                    {/* Image Box */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: { xs: '100%', md: '50%' },
                        marginTop: { xs: '20px', md: '0' },
                    }}>
                        <Box sx={{
                            width: { xs: '250px', md: '325px' },
                            height: { xs: '300px', md: '350px' },
                        }}>
                            <img
                                src="/images/image.png"
                                alt="ShopScout Image"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5, }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </div>
    );
}

export default Home;