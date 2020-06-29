import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > *': {
      margin: theme.spacing(1),
      height: theme.spacing(16),
      width: '80%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
  },
}));

export default function SimplePaper({ text }) {
  const classes = useStyles();

  return (
    <div className={classes.root} style={{ marginTop: 20 }}>
      <Paper elevation={3} >
        <h2>{text}</h2>
      </Paper>
    </div>
  );
}