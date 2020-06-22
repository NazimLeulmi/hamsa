import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


export default function FormDialog({ open, close, add, name, setName, error }) {

  function handleChange(e) {
    setName(e.target.value);
  }
  return (
    <Dialog open={open} onClose={close} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Add contact</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add a new contact,enter the contact's name. A request
          will be sent to the contact
        </DialogContentText>
        <TextField
          autoFocus id="name"
          label="Contact Name"
          type="text" fullWidth
          autoComplete="off" required
          value={name} onChange={handleChange}
          helperText={error === "" ? null : error}
          error={error === "" ? false : true}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="primary">
          CANCEL
        </Button>
        <Button onClick={add} color="primary">
          SUBMIT
        </Button>
      </DialogActions>
    </Dialog>
  );
}