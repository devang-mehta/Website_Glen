import { React, useEffect, useState } from 'react';
import { PDFMap } from './utils/PDFMap';
import { MessageMap } from './utils/MessageMap';
import { Typography, Grid, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    button: {
        padding: theme.spacing(1),
        textAlign: 'center',
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));
let interval;

export const ViewPDF = () => {
    const url = window.location.pathname;
    const [images, setImages] = useState([]);
    const [displayImages, setDisplayImages] = useState(false)
    const [currentMessage, setCurrentMessage] = useState("")
    const [messages, setMessages] = useState([]);
    const [progress, setProgress] = useState(0);
    const [showProgressBar, setShowProgressBar] = useState(false)
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);
    const classes = useStyles();

    let history = useHistory();
    let uid = url.split("/view-results/")[1];

    function goToHome() {
        history.push('/')
    }
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        interval = setInterval(() => {
            fetch('/api/images/' + uid).then(response =>
                response.json().then(data => {
                    if (data.hasOwnProperty('images')) {
                        setImages(data.images);
                    }
                    else {
                        if (data.failed === 'null') {
                            alert("Oh dear, we don't seem to have any information under that ID. Please try again.");
                            setFailed(true);
                        }
                        else if (data.failed === -1) {
                            alert("Oh dear, this attempt failed. Please double-check your data and try running ProDoPlot again.");
                            setFailed(true);
                            try {
                                if (data.info.length > 0) {
                                    setCurrentMessage(data.info);
                                }
                            } catch {
                                console.log("No message was found with this cookie: Cookie -1.")
                            }
                        }
                        else if (data.failed < 100) {
                            setShowProgressBar(true);
                            setProgress(data.failed);
                            try {
                                if (data.info.length > 0) {
                                    setCurrentMessage(data.info);
                                }
                            } catch {
                                console.log("No message was found with this cookie: Cookie " + data.failed + ".")
                            }
                        }
                    }
                })
            );
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        if (images.length > 0) {
            setDisplayImages(true);
            setShowProgressBar(false);
            clearInterval(interval);
        }
        if (failed) {
            clearInterval(interval);
        }
        if (!messages.includes(currentMessage) && currentMessage.length > 0) {
            setMessages(currentMessages => [...currentMessages, currentMessage]);
        }
    }, [images, failed, currentMessage]);

    return (
        <>
            <Grid container spacing={3}>
                <Grid style={{ marginTop: "90px" }} item xs={12}></Grid>

                <Grid item xs={12}>
                    <Paper className={classes.paper} variant='outlined'>
                        <Typography variant='h5'>{"Result id: " + uid}</Typography>
                    </Paper>
                </Grid>
                {(displayImages && !showProgressBar && !failed) &&
                    <PDFMap images={images} uid={uid} />
                }
                {(!displayImages && showProgressBar && !failed) &&
                    <>
                        <Grid item xs={12}>
                            <Paper className={classes.paper} variant='outlined'>
                                {(messages.length) //If the message only contains whitespace, display the loading text
                                    ? <MessageMap messages={messages}></MessageMap>
                                    : <Typography variant='h5'>Loading, this may take a while, please wait...</Typography>
                                }
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <CircularProgress variant='static' value={progress}></CircularProgress>
                        </Grid>
                    </>
                }
                <Grid item xs={12}>
                    <Paper className={classes.paper} variant='outlined'>
                        {(!displayImages && !showProgressBar && failed) &&
                            <>
                                <Typography variant='h5'>Something went wrong. Please try again.</Typography>
                                {(messages.length) //If the message has information, display the message
                                    ? <MessageMap messages={messages}></MessageMap>
                                    : <Typography variant='h5'>There was no information from this run.</Typography>
                                }
                            </>
                        }
                        {(!displayImages && !showProgressBar && !failed) &&
                            <Typography variant='h5'>Loading, please wait...</Typography>
                        }
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Button variant='contained' color='primary' component='span' className={classes.button} onClick={handleClickOpen}>Exit</Button>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Have you saved your result id?"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                If you want to return to view your results again, you must save your result id.
                                If you do not save your result id, YOU WILL NOT BE ABLE TO VIEW THIS PAGE AGAIN
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                No
                            </Button>
                            <Button onClick={goToHome} color="primary" autoFocus>
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </Grid>
        </>
    );
}
