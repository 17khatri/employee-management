"use client";

import { useEffect, useState } from "react";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
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
import { logout, setAuth } from "../store/authSlice";
import {
  getLoggedInUser,
  changePassword,
  updateLoggedInUser,
  updateEmployeeProfile,
} from "../services/auth.service";
import TextField from "@mui/material/TextField";
import toast from "react-hot-toast";

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
    profilePhoto?: string;
  };
}

export default function Header() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loggedInUser) return;

    // ✅ ADMIN UPDATE (JSON)
    if (loggedInUser.role === "admin") {
      const formData = new FormData(e.currentTarget);

      const payload = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
      };

      try {
        const updatedUser = await updateLoggedInUser(payload);
        console.log(updatedUser, "updated user in header");
        // update redux
        dispatch(
          setAuth({
            token: localStorage.getItem("token")!,
            user: updatedUser.user,
          }),
        );

        // update localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // update local state
        setLoggedInUser(updatedUser);

        handleCloseProfile();
        toast.success("Profile updated successfully");
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to update user");
      }

      return;
    }

    // ✅ EMPLOYEE UPDATE (FormData with image)
    if (loggedInUser.role === "employee") {
      const formData = new FormData(e.currentTarget);

      if (selectedFile) {
        formData.set("profilePhoto", selectedFile);
      }

      const updatedUser = await updateEmployeeProfile(formData);

      dispatch(
        setAuth({
          token: localStorage.getItem("token")!,
          user: updatedUser,
        }),
      );

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setLoggedInUser(updatedUser);
      setSelectedFile(null);
      handleCloseProfile();

      toast.success("Profile updated successfully");
    }
  };

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePasswordSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setPasswordError("");

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      alert("Password changed successfully");

      setOpenChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setPasswordError(
        error?.response?.data?.message || "password is not matching",
      );
    }
  };

  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="h-12 bg-gray-800 shadow flex items-center justify-between px-6 border-b border-gray-700 relative">
      <h1 className="font-semibold text-white">
        Welcome, {user?.firstName} {user?.lastName}{" "}
      </h1>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            src={loggedInUser?.employee?.profilePhoto}
            sx={{ width: 32, height: 32 }}
          >
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
            getProfile();
            handleClose();
            handleOpenProfile();
          }}
        >
          <Avatar sx={{ mr: 1 }}>
            {user?.firstName?.charAt(0).toUpperCase()}
            {user?.lastName?.charAt(0).toUpperCase()}
          </Avatar>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            setOpenChangePassword(true);
          }}
        >
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
        <DialogTitle>Update Profile</DialogTitle>

        <DialogContent dividers>
          <form onSubmit={handleProfileUpdate}>
            <div className="flex items-center gap-4 mb-4">
              <Avatar
                src={previewImage || loggedInUser?.employee?.profilePhoto}
                sx={{ width: 80, height: 80 }}
              >
                {loggedInUser?.firstName?.charAt(0).toUpperCase()}
                {loggedInUser?.lastName?.charAt(0).toUpperCase()}
              </Avatar>
              {user?.role === "employee" && (
                <Button variant="outlined" component="label">
                  Change Photo
                  <input
                    type="file"
                    name="profilePhoto"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              )}
            </div>

            {/* 🔹 Common Fields (Admin + Employee) */}
            <TextField
              fullWidth
              margin="normal"
              label="First Name"
              name="firstName"
              defaultValue={loggedInUser?.firstName}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Last Name"
              name="lastName"
              defaultValue={loggedInUser?.lastName}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              defaultValue={loggedInUser?.email}
            />

            {/* 🔹 Employee Only Fields */}
            {loggedInUser?.role === "employee" && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Phone"
                  name="phone"
                  defaultValue={loggedInUser?.employee?.phone}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Salary"
                  name="salary"
                  type="number"
                  defaultValue={loggedInUser?.employee?.salary}
                />
              </>
            )}

            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={handleCloseProfile}>Cancel</Button>
              <Button type="submit" variant="contained">
                Update
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>

        <DialogContent dividers>
          <form onSubmit={handleChangePasswordSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Current Password"
              name="currentPassword"
              type={showPassword.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                      edge="end"
                    >
                      {showPassword.current ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              name="newPassword"
              type={showPassword.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                      edge="end"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                      edge="end"
                    >
                      {showPassword.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {passwordError && (
              <Typography color="error" mt={1}>
                {passwordError}
              </Typography>
            )}

            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setOpenChangePassword(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Update Password
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
