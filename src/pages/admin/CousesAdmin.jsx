import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    InputAdornment,
    Fab,
    Card,
    CardContent,
    TablePagination,
    Tooltip,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Close as CloseIcon,
    Book as BookIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { CONFIG } from '../../config';


const CoursesAdmin = () => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCourses, setTotalCourses] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();

    // Configuración de react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        defaultValues: {
            nombre: '',
            descripcion: '',
            profesor: '',
            categoria: '',
            active: false
        }
    });

    const categories = [
        'Programación',
        'Diseño',
        'Marketing',
        'Negocios',
        'Idiomas',
        'Música'
    ];

    const statusOptions = [
        { value: true, label: 'Activo', color: 'success' },
        { value: false, label: 'Inactivo', color: 'error' }
    ];

    // Función para mostrar notificaciones
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Función para obtener cursos de la API
    const getCourses = async (currentPage = 0) => {
        try {
            setLoading(true);
            const params = {
                page: currentPage + 1, // La API usa páginas basadas en 1
                limit: rowsPerPage
            };

            // Agregar filtros si existen
            if (statusFilter !== '') {
                params.active = statusFilter;
            }

            const response = await axios.get(`${CONFIG.url}/api/cursos`, { params });

            if (response.data.ok) {
                setCourses(response.data.cursos);
                setTotalCourses(response.data.pagination.total_items);
            } else {
                showSnackbar('Error al cargar cursos', 'error');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            showSnackbar('Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cargar cursos al montar el componente y cuando cambien los filtros
    useEffect(() => {
        getCourses(page);
    }, [page, rowsPerPage, statusFilter]);

    // Función para crear un nuevo curso
    const onSubmit = async (data) => {
        try {
            const courseData = {
                nombre: data.nombre,
                descripcion: data.descripcion,
                profesor: data.profesor,
                categoria: data.categoria,
                active: data.active
            };

            const response = await axios.post(`${CONFIG.url}/api/cursos`, courseData);

            if (response.data.ok) {
                showSnackbar('Curso creado exitosamente');
                handleCloseModal();
                getCourses(page); // Recargar la lista
            } else {
                showSnackbar(response.data.message || 'Error al crear curso', 'error');
            }
        } catch (error) {
            console.error('Error creating course:', error);
            const errorMessage = error.response?.data?.message || 'Error de conexión';
            showSnackbar(errorMessage, 'error');
        }
    };

    // Función para eliminar curso
    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este curso?')) {
            try {
                const response = await axios.delete(`${CONFIG.url}/api/cursos/${courseId}`);

                if (response.data.ok) {
                    showSnackbar('Curso eliminado exitosamente');
                    getCourses(page); // Recargar la lista
                } else {
                    showSnackbar('Error al eliminar curso', 'error');
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                showSnackbar('Error de conexión', 'error');
            }
        }
    };

    // Función para cambiar estado del curso
    const handleToggleStatus = async (courseId) => {
        try {
            const response = await axios.patch(`${CONFIG.url}/cursos/${courseId}/toggle-status`);

            if (response.data.ok) {
                showSnackbar(response.data.message);
                getCourses(page); // Recargar la lista
            } else {
                showSnackbar('Error al cambiar estado', 'error');
            }
        } catch (error) {
            console.error('Error toggling course status:', error);
            showSnackbar('Error de conexión', 'error');
        }
    };

    const handleOpenModal = () => setOpen(true);

    const handleCloseModal = () => {
        setOpen(false);
        reset(); // Limpiar el formulario
    };

    const getStatusChip = (active) => {
        const statusConfig = statusOptions.find(s => s.value === active);
        return (
            <Chip
                label={statusConfig?.label}
                color={statusConfig?.color}
                size="small"
                variant="outlined"
            />
        );
    };

    // Filtrar cursos localmente (búsqueda por texto)
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.profesor?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || course.categoria === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Gestión de Cursos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                    sx={{ minWidth: 150 }}
                >
                    Nuevo Curso
                </Button>
            </Box>

            {/* Filtros */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Buscar cursos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3} md={2}>
                            <TextField
                                fullWidth
                                select
                                label="Estado"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="true">Activo</MenuItem>
                                <MenuItem value="false">Inactivo</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3} md={2}>
                            <TextField
                                fullWidth
                                select
                                label="Categoría"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabla de cursos */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Curso</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Profesor</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <TableRow key={course._id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                                                {course.nombre}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {course.descripcion}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{course.profesor}</TableCell>
                                    <TableCell>
                                        <Chip label={course.categoria || 'Sin categoría'} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={course.active ? 'Activo' : 'Inactivo'}
                                            color={course.active ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleToggleStatus(course._id)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(course.createdAt).toLocaleDateString('es-ES')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Ver detalles">
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    onClick={() => navigate(`/admin/courses/${course._id}`)}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <IconButton size="small" color="primary">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <BookIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                                        <Typography variant="h6" color="text.secondary">
                                            No se encontraron cursos
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {searchTerm || statusFilter || categoryFilter
                                                ? 'Intenta ajustar los filtros de búsqueda'
                                                : 'Comienza creando tu primer curso'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalCourses}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                />
            </TableContainer>

            {/* FAB para móvil */}
            <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpenModal}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', sm: 'none' }
                }}
            >
                <AddIcon />
            </Fab>

            {/* Modal de registro */}
            <Dialog
                open={open}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
                            Registrar Nuevo Curso
                        </Typography>
                        <IconButton onClick={handleCloseModal} size="small">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre del Curso"
                                    {...register('nombre', {
                                        required: 'El nombre del curso es requerido',
                                        minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                                    })}
                                    error={!!errors.nombre}
                                    helperText={errors.nombre?.message}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Descripción"
                                    multiline
                                    rows={3}
                                    {...register('descripcion', {
                                        required: 'La descripción es requerida',
                                        minLength: { value: 10, message: 'Mínimo 10 caracteres' }
                                    })}
                                    error={!!errors.descripcion}
                                    helperText={errors.descripcion?.message}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Profesor"
                                    {...register('profesor', {
                                        required: 'El profesor es requerido'
                                    })}
                                    error={!!errors.profesor}
                                    helperText={errors.profesor?.message}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Categoría"
                                    {...register('categoria')}
                                    defaultValue=""
                                >
                                    <MenuItem value="">Sin categoría</MenuItem>
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>



                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Estado"
                                    {...register('active')}
                                    defaultValue={false}
                                >
                                    <MenuItem value={false}>Inactivo</MenuItem>
                                    <MenuItem value={true}>Activo</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleCloseModal} color="inherit" disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={isSubmitting && <CircularProgress size={20} />}
                        >
                            {isSubmitting ? 'Creando...' : 'Crear Curso'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CoursesAdmin;