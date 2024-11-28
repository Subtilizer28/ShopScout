import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
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
    
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [currentPage, setCurrentPage] = useState('Home');

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = (page) => {
        setAnchorElNav(null);
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
        <div>
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
                            onClick={handleOpenNavMenu}
                            color="inherit"
                            sx={{
                                left: "25px"                        
                            }}
                        ></IconButton>
                        <MenuIcon />
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}

                            open={Boolean(anchorElNav)}
                            onClose={() => setAnchorElNav(null)}
                            sx={{ 
                                display: { xs: 'block', md: 'none' },
                                '& .MuiPaper-root': {
                                    background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%);',
                                    color: 'white', 
                                }
                            }}
                        >
                        {pages.map((page) => (
                            <MenuItem key={page} onClick={() => handleCloseNavMenu(page)}>
                            <Typography 
                                sx={{ 
                                    textAlign: 'center' 
                                }}>{page}</Typography>
                            </MenuItem>
                        ))}
                        </Menu>
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
                                    onClick={() => handleCloseNavMenu(page)}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
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
            {renderPage()}</Box>
        </div>
    );
}

export default Index;