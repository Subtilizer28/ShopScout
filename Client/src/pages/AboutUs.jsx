import React, { useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, IconButton, Select, MenuItem } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import MailIcon from '@mui/icons-material/Mail';

function About() {
    const people = [
        {
            name: 'Arlin Riya Dsouza',
            role: 'Frontend Developer',
            image: '/images/arlin.jpg',
            memeLine: '"It is what it is 🙂."',
            linkedin: 'https://www.linkedin.com/in/arlin-riya-dsouza-268b42320/',
            github: 'https://github.com/ArlinDsouza',
            email: 'mailto:riyaarlin03@gmail.com',
        },
        {
            name: 'Ashton Prince Mathias',
            role: 'Lead Developer',
            image: '/images/ashton.jpg',
            memeLine: '"Your Phone Linging ☎️."',
            linkedin: 'https://www.linkedin.com/in/ashtonmths/',
            github: 'https://github.com/Subtilizer28',
            email: 'mailto:ashtonmths@outlook.com',
        },
        {
            name: 'Aman Marian Cutinha',
            role: 'Backend Developer',
            image: '/images/aman.jpg',
            memeLine: '"Just a Chill Guy 🙂‍↕️."',
            linkedin: 'https://www.linkedin.com/in/aman-cutinha-b75588288/',
            github: 'https://github.com/AmanCutinha',
            email: 'mailto:amancutinha@gmail.com',
        }
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                padding: 2,
            }}
        >
            <Typography 
                variant="h5"
                sx={{
                    color: 'white',
                    mb: 3,
                    fontWeight: 'bold',
                    marginTop: { xs: 1, sm: 1, md: 1 },
                }}
            gutterBottom>
                About Us
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 4,
                }}
            >
                {people.map((person, index) => (
                    <Card
                        key={index}
                        sx={{
                            width: {md: '300px', xs: '230px'},
                            height: '370px',
                            textAlign: 'center',
                            borderRadius: 2,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                        }}
                    >
                        <CardMedia
                            component="img"
                            height="150"
                            image={person.image}
                            alt={person.name}
                            sx={{ width: '120px', margin: 'auto', marginTop: 2, borderRadius: 5 }}
                        />
                        <CardContent>
                            <Typography variant="h6" color='white' sx={{ fontWeight: 'bold' }}>
                                {person.name}
                            </Typography>
                            <Typography variant="subtitle1" color="white">
                                {person.role}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ mt: 1, fontStyle: 'italic', color: 'white' }}
                            >
                                {person.memeLine}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <IconButton href={person.linkedin} target="_blank">
                                    <LinkedInIcon sx={{ color: 'white' }} />
                                </IconButton>
                                <IconButton href={person.github} target="_blank">
                                    <GitHubIcon sx={{ color: 'white' }} />
                                </IconButton>
                                <IconButton href={person.email}>
                                    <MailIcon sx={{ color: 'white' }} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export default About;