import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Link from "next/link";


const useStyles = makeStyles(theme => ({
  link: {
    marginTop: 15,
    marginBottom: 20,
    '& span': {
      color: [theme.palette.primary.lighter],
      marginLeft: 5
    }
  }
}));

export default ({ href, text, span }) => {
  const classes = useStyles();
  return (
    < Link href={href} >
      <Typography variant='body1' className={classes.link}>
        {text} <span> {span}</span>
      </Typography>
    </Link >
  )
}

