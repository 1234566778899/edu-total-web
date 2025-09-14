import { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../contexts/AuthContextApp";

const drawerWidth = 260;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { auth, user } = useContext(AuthContext);

  const menuItems = [
    {
      text: "Dashboard",
      icon: "🏠",
      path: "/dashboard",
      color: "#1976d2",
    },
    {
      text: "Mis Cursos",
      icon: "🎓",
      path: "/cursos",
      color: "#2e7d32",
    },
    {
      text: "Exámenes",
      icon: "📝",
      path: "/examenes",
      color: "#9c27b0",
    },
    {
      text: "Calendario",
      icon: "📅",
      path: "/calendario",
      color: "#d32f2f",
    },
  ];

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(
      (item) => item.path === location.pathname
    );
    return currentItem ? currentItem.text : "Aula Virtual";
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="h6">📚 Aula Virtual</Typography>
        <Typography variant="body2" color="text.secondary">
          Plataforma Educativa
        </Typography>
      </Box>
      <Divider />

      {/* User info */}
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>JP</Avatar>
        <Box>
          <Typography variant="subtitle1">Juan Pérez</Typography>
          <Typography variant="body2" color="text.secondary">
            Estudiante
          </Typography>
        </Box>
      </Box>
      <Divider />

      {/* Menu */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleMenuItemClick(item.path)}
            >
              <ListItemIcon>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{
                fontSize: '0.95rem',

              }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* Footer menu */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === "/perfil"}
            onClick={() => handleMenuItemClick("/perfil")}
          >
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Mi Perfil" primaryTypographyProps={{
              fontSize: '0.95rem'
            }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === "/configuracion"}
            onClick={() => handleMenuItemClick("/configuracion")}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configuración" primaryTypographyProps={{
              fontSize: '0.95rem',
            }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => auth.signOut()}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{
              fontSize: '0.95rem'
            }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { sm: "none" } }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {getCurrentPageTitle()}
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>JP</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer para escritorio */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Drawer para móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawer}
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
