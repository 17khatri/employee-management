import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import CommonButton from "./Button";

interface Props {
  open: boolean;
  handleClose: () => void;
  handleDelete: () => void;
}

export default function DeletePopup({
  open,
  handleClose,
  handleDelete,
}: Props) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: "12px" },
        }}
      >
        <DialogTitle sx={{ fontSize: "16px" }} id="alert-dialog-title">
          {"Are you sure you want to delete?"}
        </DialogTitle>

        <DialogActions>
          <CommonButton variant="outline" onClick={handleClose}>
            Cancel
          </CommonButton>
          <CommonButton onClick={handleDelete}>Delete</CommonButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
