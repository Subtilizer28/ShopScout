import { useState, useEffect } from 'react'
import { AppBar, Box, Toolbar, Container, Typography, Button, IconButton, Fade, MenuItem } from '@mui/material'; 
import { Menu as MenuIcon, ShoppingCart as ShoppingCartIcon, HighlightOff as HighlightOffIcon } from '@mui/icons-material';
import Home from './pages/Home';
import Suggest from './pages/Suggest'
import Compare from './pages/Compare'
import Wishlist from './pages/Wishlist'
import PriceHistory from './pages/PriceHistory'
import About from './pages/AboutUs'
const pages = ['Home', 'Suggest', 'Compare', 'Wishlist', 'Price History', 'About Us'];

function Index() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event) => {
        setMousePosition({
            x: event.clientX,
            y: event.clientY,
        });
    };

    useEffect(() => {
        // Add event listener to track mouse movement
        window.addEventListener('mousemove', handleMouseMove);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);
    
    const [currentPage, setCurrentPage] = useState('Home');
    const [hamburgMenu, setHamburgMenu] = useState(false);

    const handleOpenHamburgMenu = () => {
        setHamburgMenu(true)
    }

    const handleHamburgClick = (page) => {
        setHamburgMenu(false);
        setCurrentPage(page)
    };

    function renderPage() {
        switch (currentPage) {
            case 'Home': return <Home onPageChange={setCurrentPage} />;
            case 'Suggest': return <Suggest />;
            case 'Compare': return <Compare />;
            case 'Wishlist': return <Wishlist />;
            case 'Price History': return <PriceHistory />;
            case 'About Us': return <About />
        }
    }
    return (
        <>
            {hamburgMenu ? (
                <Fade in={hamburgMenu} timeout={1000}>
                    <Box sx={{
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }}>
                        <Fade in={hamburgMenu} timeout={1000}>
                            <Box sx={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {pages.map((page) => (
                                    <MenuItem key={page} onClick={() => handleHamburgClick(page)}>
                                    <Typography
                                        sx={{
                                            textAlign: 'center',
                                            color: 'white',
                                            fontSize: '1.3rem',
                                            fontWeight: 'bold', 
                                            transition: 'transform 0.3s ease, color 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.3)',
                                            },
                                        }}
                                    >
                                        {page}
                                    </Typography>
                                    </MenuItem>
                                ))}
                                <br />
                                <MenuItem onClick={() => handleHamburgClick(currentPage)}><HighlightOffIcon sx={{ fontSize: '3rem', color: 'white' }} /></MenuItem>
                            </Box>
                        </Fade>
                    </Box>
                </Fade>
            ) : (
                <Fade in={!hamburgMenu} timeout={1000}>
                    <Box sx={{
                        maxWidth: '1280px',
                        margin: '8px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        padding: '2rem',
                    }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: `${mousePosition.y - 100}px`,
                                left: `${mousePosition.x - 100}px`,
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                boxShadow: '0 0 100px 30px rgba(5, 255, 200, 1)',
                                zIndex: -1,
                                filter: "blur(60px)",
                                pointerEvents: 'none', // Make sure it doesn't interfere with mouse events
                            }}
                        />

                    <AppBar position="static" sx={{
                        borderRadius: "15px", 
                        background: "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)",
                    }}>
                        <Container maxWidth="xl">
                            <Toolbar disableGutters>
                            <ShoppingCartIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                            <Typography
                                variant="h6"
                                noWrap
                                component="a"
                                href="#"
                                sx={{
                                    mr: 2,
                                    display: { xs: 'none', md: 'flex' },
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.3rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                            SHOPSCOUT
                            </Typography>

                            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                                <IconButton
                                    size="large"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleOpenHamburgMenu}
                                    color="inherit"
                                    sx={{
                                        left: "25px"                        
                                    }}
                                ></IconButton>
                                <MenuIcon />
                            </Box>
                            <ShoppingCartIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                            <Typography
                                variant="h5"
                                noWrap
                                component="a"
                                href="#"
                                sx={{
                                    mr: 2,
                                    display: { xs: 'flex', md: 'none' },
                                    flexGrow: 1,
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.1rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                            SHOPSCOUT
                            </Typography>
                                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                                    {pages.map((page) => (
                                        <Button
                                            key={page}
                                            onClick={() => handleHamburgClick(page)}
                                            sx={{ my: 2, color: 'white', display: 'block' }}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </Box>
                            </Toolbar>
                        </Container>
                    </AppBar>
                    <Fade in={true} timeout={1000}>
                        <Box sx={{
                            marginTop: 2,
                            height: 'calc(100vh - 185px)',
                            borderRadius: 5,
                            zIndex: 1, // Keep content above the neon dot
                            position: 'relative',
                            overflowY: 'auto',     // Enables vertical scrolling
                            overflowX: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                            background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
                            '&::-webkit-scrollbar': {
                                width: '12px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'white',
                                borderRadius: '10px', // Pill shape
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: '#ccc',
                            },
                        }}>
                        {renderPage()}
                        </Box>
                    </Fade>
                </Box>
            </Fade>
            )}
        </>
    );
}

export default Index;