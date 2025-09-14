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
    Grid,
    TablePagination,
    Tooltip,
    Alert,
    Snackbar,
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Close as CloseIcon,
    Event as EventIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { CONFIG } from '../../config';

export const EventAdmin = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalEventos, setTotalEventos] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Configuración de react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm({
        defaultValues: {
            nombre: '',
            descripcion: '',
            url: '',
            active: false
        }
    });

    // Función para mostrar notificaciones
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Función para obtener eventos
    const getEventos = async (currentPage = 0) => {
        try {
            setLoading(true);
            const params = {
                page: currentPage + 1,
                limit: rowsPerPage
            };

            const response = await axios.get(`${CONFIG.url}/api/eventos`, { params });

            if (response.data.ok) {
                setEventos(response.data.eventos);
                setTotalEventos(response.data.pagination.total_items);
            } else {
                showSnackbar('Error al cargar eventos', 'error');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            showSnackbar('Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cargar eventos al montar el componente
    useEffect(() => {
        getEventos(page);
    }, [page, rowsPerPage]);

    // Función para crear/actualizar evento
    const onSubmit = async (data) => {
        try {
            const eventoData = {
                nombre: data.nombre,
                descripcion: data.descripcion,
                url: data.url || null,
                active: data.active
            };

            let response;
            if (isEditMode && selectedEvento) {
                response = await axios.put(`${CONFIG.url}/api/eventos/${selectedEvento._id}`, eventoData);
            } else {
                response = await axios.post(`${CONFIG.url}/api/eventos`, eventoData);
            }

            if (response.data.ok) {
                showSnackbar(
                    isEditMode ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente'
                );
                handleCloseModal();
                getEventos(page);
            } else {
                showSnackbar(response.data.message || 'Error al guardar evento', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            const errorMessage = error.response?.data?.message || 'Error de conexión';
            showSnackbar(errorMessage, 'error');
        }
    };

    // Función para eliminar evento
    const handleDeleteEvento = async (eventoId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            try {
                const response = await axios.delete(`${CONFIG.url}/api/eventos/${eventoId}`);

                if (response.data.ok) {
                    showSnackbar('Evento eliminado exitosamente');
                    getEventos(page);
                } else {
                    showSnackbar('Error al eliminar evento', 'error');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                showSnackbar('Error de conexión', 'error');
            }
        }
    };

    // Función para cambiar estado del evento
    const handleToggleStatus = async (eventoId) => {
        try {
            const response = await axios.patch(`${CONFIG.url}/api/eventos/${eventoId}/toggle-status`);

            if (response.data.ok) {
                showSnackbar(response.data.message);
                getEventos(page);
            } else {
                showSnackbar('Error al cambiar estado', 'error');
            }
        } catch (error) {
            console.error('Error toggling event status:', error);
            showSnackbar('Error de conexión', 'error');
        }
    };

    const handleOpenModal = (evento = null) => {
        if (evento) {
            setIsEditMode(true);
            setSelectedEvento(evento);
            setValue('nombre', evento.nombre);
            setValue('descripcion', evento.descripcion);
            setValue('url', evento.url || '');
            setValue('active', evento.active);
        } else {
            setIsEditMode(false);
            setSelectedEvento(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setSelectedEvento(null);
        reset();
    };

    const getStatusChip = (active) => {
        return (
            <Chip
                label={active ? 'Activo' : 'Inactivo'}
                color={active ? 'success' : 'error'}
                size="small"
                variant="outlined"
            />
        );
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const stats = {
        total: eventos.length,
        activos: eventos.filter(e => e.active).length,
        inactivos: eventos.filter(e => !e.active).length
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Gestión de Eventos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{ minWidth: 150 }}
                >
                    Nuevo Evento
                </Button>
            </Box>

            {/* Estadísticas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary" gutterBottom>
                                {totalEventos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Eventos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" gutterBottom>
                                {stats.activos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Eventos Activos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="error.main" gutterBottom>
                                {stats.inactivos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Eventos Inactivos
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabla de eventos */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Evento</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>URL</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Fecha de Creación</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : eventos.length > 0 ? (
                            eventos.map((evento) => (
                                <TableRow key={evento._id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon color="primary" />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                                {evento.nombre}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {evento.descripcion}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {evento.url ? (
                                            <Tooltip title="Abrir enlace">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => window.open(evento.url, '_blank')}
                                                >
                                                    <LinkIcon />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Sin URL
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={evento.active ? 'Activo' : 'Inactivo'}
                                            color={evento.active ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleToggleStatus(evento._id)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(evento.createdAt).toLocaleDateString('es-ES')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenModal(evento)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteEvento(evento._id)}
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
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <EventIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                                        <Typography variant="h6" color="text.secondary">
                                            No hay eventos registrados
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Comienza creando tu primer evento
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
                    count={totalEventos}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                />
            </TableContainer>
            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 2 } }}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
                            {isEditMode ? 'Editar Evento' : 'Crear Nuevo Evento'}
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
                                    label="Nombre del Evento"
                                    {...register('nombre', {
                                        required: 'El nombre del evento es requerido',
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
                                    rows={4}
                                    {...register('descripcion', {
                                        required: 'La descripción es requerida',
                                        minLength: { value: 10, message: 'Mínimo 10 caracteres' }
                                    })}
                                    error={!!errors.descripcion}
                                    helperText={errors.descripcion?.message}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="URL del Evento"
                                    placeholder="https://ejemplo.com/evento"
                                    {...register('url', {
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: 'Debe ser una URL válida (http:// o https://)'
                                        }
                                    })}
                                    error={!!errors.url}
                                    helperText={errors.url?.message || 'URL opcional para el evento'}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TextField
                                        select
                                        label="Estado"
                                        {...register('active')}
                                        SelectProps={{ native: true }}
                                        sx={{ minWidth: 120 }}
                                    >
                                        <option value={false}>Inactivo</option>
                                        <option value={true}>Activo</option>
                                    </TextField>
                                    <Typography variant="body2" color="text.secondary">
                                        Los eventos activos serán visibles para los estudiantes
                                    </Typography>
                                </Box>
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
                            {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Evento')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
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