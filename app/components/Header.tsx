"use client";

import { useEffect, useState } from "react";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { logout } from "../store/authSlice";
import { getLoggedInUser } from "../services/auth.service";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive?: boolean;
  employee?: {
    _id?: string;
    userId?: string;
    phone?: string;
    departmentId?: {
      _id?: string;
      name?: string;
    };
    salary?: number;
  };
}

export default function Header() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    setOpenProfile(true);
  };

  const handleCloseProfile = () => {
    setOpenProfile(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const getProfile = async () => {
    try {
      const user = await getLoggedInUser();
      setLoggedInUser(user);
    } catch (error) {}
  };

  useEffect(() => {
    getProfile();
  }, []);
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="h-12 bg-gray-800 shadow flex items-center justify-between px-6 border-b border-gray-700 relative">
      <h1 className="font-semibold text-white">Welcome, {user?.firstName}</h1>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar sx={{ width: 32, height: 32 }}>
            {user?.firstName?.charAt(0).toUpperCase()}
            {user?.lastName?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            handleOpenProfile();
          }}
        >
          <Avatar sx={{ mr: 1 }}>
            {user?.firstName?.charAt(0).toUpperCase()}
          </Avatar>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <LockOpenIcon fontSize="small" />
          </ListItemIcon>
          Change Password
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <Dialog
        open={openProfile}
        onClose={handleCloseProfile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Profile</DialogTitle>

        <DialogContent dividers>
          <div className="flex items-center gap-4 mb-4">
            <Avatar sx={{ width: 60, height: 60 }}>
              {user?.firstName?.charAt(0).toUpperCase()}
            </Avatar>

            <div>
              <Typography variant="h6">
                {loggedInUser?.firstName} {loggedInUser?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loggedInUser?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role: {loggedInUser?.role}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {loggedInUser ? "Active" : "Inactive"}
              </Typography>
            </div>
          </div>

          {/* ✅ Conditional Employee Details */}
          {user?.role === "employee" && (
            <div className="mt-4 border-t pt-4">
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Employee Details
              </Typography>

              <Typography variant="body2">
                📞 Phone: {loggedInUser?.employee?.phone}
              </Typography>

              <Typography variant="body2">
                🏢 Department: {loggedInUser?.employee?.departmentId?.name}
              </Typography>

              <Typography variant="body2">
                💰 Salary: ₹{loggedInUser?.employee?.salary}
              </Typography>
            </div>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseProfile}>Close</Button>
        </DialogActions>
      </Dialog>
    </header>
  );
}
