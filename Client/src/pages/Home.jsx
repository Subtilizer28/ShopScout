import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

function Home({ onPageChange }) {
    return (
        <div>
            <Box sx={{ 
                height: '100%',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',

            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' }, // Column on small screens, row on large
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '1200px',
                    padding: '20px',
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: { xs: 'center', md: 'flex-start' }, // Centered on mobile
                        textAlign: { xs: 'center', md: 'left' },
                        padding: { xs: '20px 0', md: '0' },
                    }}>
                        <br />
                        <Typography variant="h2" sx={{ color: 'white', fontWeight: 700 }}>
                            SHOPSCOUT
                        </Typography>
                        <br />
                        <Box sx={{
                            width: '60px',
                            height: '10px',
                            background: 'white',
                            borderRadius: '5px'
                        }}></Box>
                        <br />
                        <Typography variant="h6" sx={{ color: 'white', mb: 4 }}>
                            Smart shopping made easy with product suggestions, price tracking, and seamless comparisons. 
                        </Typography>
                        <Box sx={{
                            height: "190px",
                            width: "calc(100% - 50px)",
                            display: 'grid',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gridTemplateRows: '1fr 1fr',
                            gridTemplateColumns: '1fr 1fr',
                        }}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'white',
                                    height: '60%',
                                    width: {md: '60%', xs: '70%'},
                                    borderRadius: '20px',
                                    padding: '10px 30px',
                                    fontWeight: 'bold',
                                    fontSize: '18px'
                                }}
                                onClick={() => onPageChange('Suggest')}>
                                Suggest Me
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'white',
                                    height: '60%',
                                    width: {md: '60%', xs: '70%'},
                                    borderRadius: '20px',
                                    padding: '10px 30px',
                                    fontWeight: 'bold',
                                    fontSize: '18px',
                                    marginLeft: { xs: '0', md: '-90px' },
                                }}
                                onClick={() => onPageChange('Compare')}>
                                Compare
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'white',
                                    height: '60%',
                                    width: {md: '60%', xs: '70%'},
                                    borderRadius: '20px',
                                    padding: '10px 30px',
                                    fontWeight: 'bold',
                                    fontSize: '18px'
                                }}
                                onClick={() => onPageChange('Wishlist')}>
                                Wishlist
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    color: 'white',
                                    height: '60%',
                                    width: {md: '60%', xs: '70%'},
                                    borderRadius: '20px',
                                    padding: '10px 30px',
                                    fontWeight: 'bold',
                                    fontSize: '18px',
                                    marginLeft: { xs: '0', md: '-90px' },
                                }}
                                onClick={() => onPageChange('Price History')}>
                                Price History
                            </Button>
                        </Box>
                    </Box>

                    {/* Right side: Image Box */}
                    <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: { xs: '100%', md: '50%' },
                        marginTop: { xs: '30px', md: '0' }
                    }}>
                        <Box sx={{ 
                            width: '325px', 
                            height: '350px',
                            borderRadius: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <img src='/images/image.png' alt="Image" width="325px" height="350px" />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </div>
    )
}

export default Home;