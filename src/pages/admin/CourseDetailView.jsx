import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Card,
    CardContent,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    VideoLibrary as VideoIcon,
    Description as DocumentIcon,
    AudioFile as AudioIcon,
    Quiz as QuizIcon,
    Assignment as AssignmentIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { CONFIG } from '../../config';
const CourseDetailView = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch
    } = useForm({
        defaultValues: {
            titulo: '',
            descripcion: '',
            tipo: 'video',
            url: '',
            duracion: '',
            orden: 1
        }
    });

    const materialTypes = [
        { value: 'video', label: 'Video', icon: VideoIcon },
        { value: 'document', label: 'Documento', icon: DocumentIcon },
        { value: 'audio', label: 'Audio', icon: AudioIcon },
        { value: 'quiz', label: 'Quiz', icon: QuizIcon },
        { value: 'assignment', label: 'Tarea', icon: AssignmentIcon }
    ];

    // Función para mostrar notificaciones
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Función para obtener el curso por ID
    const getCourse = async () => {
        console.log('hola')
        try {
            setLoading(true);
            const response = await axios.get(`${CONFIG.url}/api/cursos/${courseId}`);

            if (response.data.ok) {
                setCourse(response.data.curso);
            } else {
                showSnackbar('Curso no encontrado', 'error');
                navigate('/admin/courses');
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            showSnackbar('Error al cargar el curso', 'error');
            navigate('/admin/courses');
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener materiales del curso
    const getMaterials = async () => {
        try {
            setMaterialsLoading(true);
            const response = await axios.get(`${CONFIG.url}/api/materiales/cursos/${courseId}`);
            if (response.data.ok) {
                setMaterials(response.data.materiales);
            } else {
                showSnackbar('Error al cargar materiales', 'error');
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            showSnackbar('Error de conexión', 'error');
        } finally {
            setMaterialsLoading(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        if (courseId) {
            getCourse();
            getMaterials();
        }
    }, [courseId]);

    // Función para crear un nuevo material
    const onSubmitMaterial = async (data) => {
        try {
            const materialData = {
                titulo: data.titulo,
                descripcion: data.descripcion,
                tipo: data.tipo,
                url: data.url,
                duracion: data.duracion || null,
                orden: parseInt(data.orden),
                cursoId: courseId
            };

            const response = await axios.post(`${CONFIG.url}/api/materiales`, materialData);

            if (response.data.ok) {
                showSnackbar('Material creado exitosamente');
                handleCloseModal();
                getMaterials(); // Recargar la lista
            } else {
                showSnackbar(response.data.message || 'Error al crear material', 'error');
            }
        } catch (error) {
            console.error('Error creating material:', error);
            const errorMessage = error.response?.data?.message || 'Error de conexión';
            showSnackbar(errorMessage, 'error');
        }
    };

    // Función para eliminar material
    const handleDeleteMaterial = async (materialId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este material?')) {
            try {
                const response = await axios.delete(`${CONFIG.url}/materiales/${materialId}`);

                if (response.data.ok) {
                    showSnackbar('Material eliminado exitosamente');
                    getMaterials(); // Recargar la lista
                } else {
                    showSnackbar('Error al eliminar material', 'error');
                }
            } catch (error) {
                console.error('Error deleting material:', error);
                showSnackbar('Error de conexión', 'error');
            }
        }
    };

    // Función para cambiar estado del material
    const handleToggleMaterialStatus = async (materialId) => {
        try {
            const response = await axios.patch(`${CONFIG.url}/materiales/${materialId}/toggle-status`);

            if (response.data.ok) {
                showSnackbar(response.data.message);
                getMaterials(); // Recargar la lista
            } else {
                showSnackbar('Error al cambiar estado', 'error');
            }
        } catch (error) {
            console.error('Error toggling material status:', error);
            showSnackbar('Error de conexión', 'error');
        }
    };

    const handleOpenModal = () => {
        // Establecer el orden por defecto como el siguiente disponible
        const nextOrder = materials.length > 0 ? Math.max(...materials.map(m => m.orden)) + 1 : 1;
        reset({
            titulo: '',
            descripcion: '',
            tipo: 'video',
            url: '',
            duracion: '',
            orden: nextOrder
        });
        setIsMaterialModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsMaterialModalOpen(false);
        reset();
    };

    const getStatusColor = (activo) => {
        return activo ? 'success' : 'warning';
    };

    const getTypeIcon = (type) => {
        const typeConfig = materialTypes.find(t => t.value === type);
        const IconComponent = typeConfig ? typeConfig.icon : DocumentIcon;
        return <IconComponent />;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    No se pudo cargar la información del curso.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, backgroundColor: '#fafafa', minHeight: '100vh' }}>
            {/* Header con botón de regreso */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin/courses')}
                    sx={{ mb: 2 }}
                >
                    Volver a Cursos
                </Button>
            </Box>

            {/* Información del curso */}
            <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h3" component="h1" gutterBottom>
                            {course.nombre}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {course.descripcion}
                        </Typography>

                        {/* Chips de información */}
                        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip label={`Profesor: ${course.profesor}`} variant="outlined" />
                            {course.categoria && (
                                <Chip label={course.categoria} color="primary" variant="outlined" />
                            )}
                            {course.duracion && (
                                <Chip label={course.duracion} variant="outlined" />
                            )}
                            <Chip
                                label={course.active ? 'Activo' : 'Inactivo'}
                                color={course.active ? 'success' : 'error'}
                                variant="outlined"
                            />
                            <Chip label={`${materials.length} materiales`} color="secondary" variant="outlined" />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" color="info.main" gutterBottom>
                                    {materials.filter(m => m.activo).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Materiales activos
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h5" color="warning.main" gutterBottom>
                                    {materials.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total de materiales
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Box sx={{ mt: 4 }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                        <Tab label="Materiales" />
                        <Tab label="Información" />
                    </Tabs>
                </Box>

                {/* Contenido de las tabs */}
                {tabValue === 0 && (
                    <Box sx={{ mt: 3 }}>
                        {/* Header de materiales */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="h2">
                                Materiales del Curso
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenModal}
                            >
                                Agregar Material
                            </Button>
                        </Box>

                        {/* Lista de materiales */}
                        {materialsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <List>
                                {materials.length > 0 ? materials.map((material) => (
                                    <React.Fragment key={material._id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                {getTypeIcon(material.tipo)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle1">
                                                            {material.orden}. {material.titulo}
                                                        </Typography>
                                                        <Chip
                                                            label={material.activo ? 'Activo' : 'Inactivo'}
                                                            size="small"
                                                            color={getStatusColor(material.activo)}
                                                            onClick={() => handleToggleMaterialStatus(material._id)}
                                                            sx={{ cursor: 'pointer' }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {material.descripcion}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                                            {material.duracion && (
                                                                <Typography variant="caption">
                                                                    ⏱️ {material.duracion}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="caption">
                                                                📁 {material.tamaño || '0 MB'}
                                                            </Typography>
                                                            <Typography variant="caption">
                                                                👀 {material.vistas || 0} vistas
                                                            </Typography>
                                                            <Typography variant="caption">
                                                                📅 {new Date(material.createdAt).toLocaleDateString('es-ES')}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Ver material">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => window.open(material.url, '_blank')}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton size="small" color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteMaterial(material._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                )) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No hay materiales disponibles
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Comienza agregando el primer material a este curso.
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        )}
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box sx={{ mt: 3 }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Información del Curso
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemText
                                            primary="ID del Curso"
                                            secondary={course._id}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Fecha de Creación"
                                            secondary={new Date(course.createdAt).toLocaleDateString('es-ES')}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Última Actualización"
                                            secondary={new Date(course.updatedAt).toLocaleDateString('es-ES')}
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Estadísticas
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemText
                                            primary="Total de Materiales"
                                            secondary={`${materials.length} materiales`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Materiales Activos"
                                            secondary={`${materials.filter(m => m.activo).length} activos`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Materiales Inactivos"
                                            secondary={`${materials.filter(m => !m.activo).length} inactivos`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Total de Visualizaciones"
                                            secondary={`${materials.reduce((sum, m) => sum + (m.vistas || 0), 0)} vistas`}
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>

            {/* Modal para agregar material */}
            <Dialog
                open={isMaterialModalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
            >
                <form onSubmit={handleSubmit(onSubmitMaterial)}>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Agregar Nuevo Material</Typography>
                            <IconButton onClick={handleCloseModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <DialogContent dividers>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Título del Material"
                                    {...register('titulo', {
                                        required: 'El título es requerido',
                                        minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                                    })}
                                    error={!!errors.titulo}
                                    helperText={errors.titulo?.message}
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
                                    select
                                    label="Tipo de Material"
                                    {...register('tipo', { required: 'Selecciona un tipo' })}
                                    error={!!errors.tipo}
                                    helperText={errors.tipo?.message}
                                    defaultValue="video"
                                >
                                    {materialTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Orden"
                                    type="number"
                                    {...register('orden', {
                                        required: 'El orden es requerido',
                                        min: { value: 1, message: 'El orden debe ser mayor a 0' }
                                    })}
                                    error={!!errors.orden}
                                    helperText={errors.orden?.message}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="URL del Material"
                                    {...register('url', {
                                        required: 'La URL es requerida',
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: 'Debe ser una URL válida (http:// o https://)'
                                        }
                                    })}
                                    error={!!errors.url}
                                    helperText={errors.url?.message}
                                    placeholder="https://ejemplo.com/material"
                                />
                            </Grid>

                            {(watch('tipo') === 'video' || watch('tipo') === 'audio') && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Duración"
                                        {...register('duracion')}
                                        placeholder="ej: 15 min, 2 horas"
                                        helperText="Opcional para videos y audios"
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleCloseModal} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creando...' : 'Agregar Material'}
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

export default CourseDetailView;