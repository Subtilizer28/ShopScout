import React, { useState } from 'react';
import axios from 'axios';
import { Table, TableHead, TableCell, TableRow, TableBody, CircularProgress, TextField, Button, Chip } from '@mui/material';

function Compare() {
    const [link1, setLink1] = useState('');
    const [link2, setLink2] = useState('');
    const [error, setError] = useState('');
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setComparisonData(null);
        setLoading(true);  // Set loading to true when the request starts
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/compare`, { link1, link2 });
            console.log(response.data.comparisonResult);
            setLoading(false);  // Set loading to false once the response is received
            if (response.data === "notsimilar") {
                setError("Products are not similar. Please enter similar products.");
            } else {
                setComparisonData(response.data.comparisonResult);
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
                            <TableCell sx={{ color: 'white' }}>Feature</TableCell>
                            <TableCell sx={{ color: 'white' }}>Product 1</TableCell>
                            <TableCell sx={{ color: 'white' }}>Product 2</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {comparisonData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ color: 'white' }}>{row[0]}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{row[1]}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{row[2]}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell sx={{ color: 'white' }}>Product Link</TableCell>
                            <TableCell sx={{ color: 'white' }}>
                            <Chip
                                label="Product Link"
                                component="a"
                                href={link1}
                                target="_blank"
                                clickable
                                color="primary"
                            />
                            </TableCell>
                            <TableCell sx={{ color: 'white' }}>
                            <Chip
                                label="Product Link"
                                component="a"
                                href={link2}
                                target="_blank"
                                clickable
                                color="primary"
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
