import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Badge,
    Button,
    Paper,
    Container,
    useTheme,
    useMediaQuery,
    Snackbar,
    Alert,

} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Book as BookIcon,
    Description as DescriptionIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Add as AddIcon,
    Notifications as NotificationsIcon,
    ChevronLeft as ChevronLeftIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContextApp';

const AdminLayout = ({ children, currentPage = 'dashboard' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(true);
    const navigate = useNavigate();
    const drawerWidth = 280;
    const collapsedWidth = 73;

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
        { id: 'courses', label: 'Cursos', icon: BookIcon, path: '/admin/courses' },
        { id: 'students', label: 'Estudiantes', icon: PeopleIcon, path: '/admin/students' },
        { id: 'events', label: 'Eventos', icon: PeopleIcon, path: '/admin/eventos' },
        { id: 'exams', label: 'Examenes', icon: PeopleIcon, path: '/admin/examenes' },
    ];

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setDesktopOpen(!desktopOpen);
        }
    };

    const getPageInfo = () => {
        const pageMap = {
            dashboard: { title: 'Dashboard', description: 'Resumen general del sistema' },
            courses: { title: 'Gestión de Cursos', description: 'Administra todos los cursos disponibles' },
            materials: { title: 'Gestión de Materiales', description: 'Gestiona materiales y recursos educativos' },
            students: { title: 'Estudiantes', description: 'Administra estudiantes registrados' },
            settings: { title: 'Configuración', description: 'Configuración del sistema' }
        };
        return pageMap[currentPage] || { title: 'Panel de Administración', description: 'Gestiona tu plataforma educativa' };
    };
    const { user } = useContext(AuthContext);
    useEffect(() => {
        if (!user || !['ordazhoyos2001@gmail.com', 'huberjuanillo@gmail.com'].includes(user.email)) {
            navigate('/login')
        }
    }, [user])
    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header del Drawer */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {(desktopOpen || isMobile) && (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            EduAdmin
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Sistema de Cursos
                        </Typography>
                    </Box>
                )}
                {!isMobile && (
                    <IconButton onClick={handleDrawerToggle} size="small">
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Box>

            <Divider />

            {/* Navegación */}
            <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                selected={isActive}
                                sx={{
                                    borderRadius: 2,
                                    minHeight: 48,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'primary.contrastText',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: isActive ? 'inherit' : 'text.secondary',
                                    minWidth: desktopOpen || isMobile ? 56 : 40,
                                }}>
                                    <Icon />
                                </ListItemIcon>
                                {(desktopOpen || isMobile) && (
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontSize: '0.95rem',
                                            fontWeight: isActive ? 600 : 400
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider />

            {/* Usuario */}
            <Box sx={{ p: 2 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: desktopOpen || isMobile ? 'flex-start' : 'center'
                }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        A
                    </Avatar>
                    {(desktopOpen || isMobile) && (
                        <Box sx={{ ml: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Admin User
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                admin@ejemplo.com
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );

    const currentWidth = desktopOpen ? drawerWidth : collapsedWidth;
    const pageInfo = getPageInfo();

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { lg: `calc(100% - ${isMobile ? 0 : currentWidth}px)` },
                    ml: { lg: `${isMobile ? 0 : currentWidth}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Toolbar>
                    {/* Botón de menú móvil */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { lg: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Información de la página */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {pageInfo.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {pageInfo.description}
                        </Typography>
                    </Box>

                    {/* Acciones del header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>


                        <IconButton color="inherit">
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer de navegación */}
            <Box
                component="nav"
                sx={{ width: { lg: currentWidth }, flexShrink: { lg: 0 } }}
            >
                {/* Drawer móvil */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Mejor performance en móviles
                    }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            bgcolor: 'background.paper'
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Drawer escritorio */}
                <Drawer
                    variant="permanent"
                    open={desktopOpen}
                    sx={{
                        display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: currentWidth,
                            bgcolor: 'background.paper',
                            borderRight: 1,
                            borderColor: 'divider',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { lg: `calc(100% - ${currentWidth}px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;