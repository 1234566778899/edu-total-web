import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Card,
    CardContent,
    CardActions,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    Grid,
    CircularProgress,
    Divider,
    FormControl,
    FormLabel,
    Select,
    MenuItem,
    InputLabel,
    Switch,
    FormControlLabel,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    RadioGroup,
    Radio,
    Pagination
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Quiz as QuizIcon,
    AccessTime as TimeIcon,
    School as SchoolIcon,
    ExpandMore as ExpandMoreIcon,
    Visibility as VisibilityIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { CONFIG } from '../../config';

const ExamenAdmin = () => {
    const [examenes, setExamenes] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creando, setCreando] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filtros, setFiltros] = useState({
        activo: '',
        curso: '',
        busqueda: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Estado del formulario
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        curso: '',
        preguntas: [],
        duracionMinutos: 60,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        intentosPermitidos: 1,
        puntuacionMinima: 60,
        mostrarResultados: true,
        mezclarPreguntas: false,
        activo: true
    });

    // Función para convertir Date a formato datetime-local
    const formatDateTimeLocal = (date) => {
        if (!date) return '';
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    // Función para convertir string datetime-local a Date
    const parseDateTimeLocal = (dateString) => {
        return dateString ? new Date(dateString) : new Date();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Cargar datos iniciales
    useEffect(() => {
        loadExamenes();
        loadCursos();
    }, [pagination.page, filtros]);

    const loadExamenes = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(filtros.activo && { activo: filtros.activo }),
                ...(filtros.curso && { curso: filtros.curso }),
                ...(filtros.busqueda && { busqueda: filtros.busqueda })
            });

            const response = await axios.get(`${CONFIG.url}/api/examenes?${params}`);
            if (response.data.ok) {
                setExamenes(response.data.examenes);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total_items,
                    totalPages: response.data.pagination.total_pages
                }));
            }
        } catch (error) {
            setError('Error al cargar exámenes');
        } finally {
            setLoading(false);
        }
    };

    const loadCursos = async () => {
        try {
            const response = await axios.get(`${CONFIG.url}/api/cursos`);
            if (response.data.ok) {
                setCursos(response.data.cursos);
            }
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setCreando(true);

            // Validaciones básicas
            if (!formData.titulo || !formData.descripcion || !formData.curso || formData.preguntas.length === 0) {
                setError('Todos los campos obligatorios deben ser completados');
                return;
            }

            // Calcular puntuación total
            const puntuacionTotal = formData.preguntas.reduce((total, pregunta) => total + (pregunta.puntos || 1), 0);

            const dataToSend = {
                ...formData,
                puntuacionTotal,
                preguntas: formData.preguntas.map((p, index) => ({
                    ...p,
                    orden: p.orden || index + 1
                }))
            };

            let response;
            if (editando) {
                response = await axios.put(`${CONFIG.url}/api/examenes/${editando._id}`, dataToSend);
            } else {
                response = await axios.post(`${CONFIG.url}/api/examenes`, dataToSend);
            }

            if (response.data.ok) {
                setSuccess(editando ? 'Examen actualizado exitosamente' : 'Examen creado exitosamente');
                setDialogOpen(false);
                resetForm();
                loadExamenes();
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error al guardar examen');
        } finally {
            setCreando(false);
        }
    };

    const resetForm = () => {
        setFormData({
            titulo: '',
            descripcion: '',
            curso: '',
            preguntas: [],
            duracionMinutos: 60,
            fechaInicio: new Date(),
            fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            intentosPermitidos: 1,
            puntuacionMinima: 60,
            mostrarResultados: true,
            mezclarPreguntas: false,
            activo: true
        });
        setEditando(null);
        setError(null);
    };

    const handleEdit = (examen) => {
        setFormData({
            ...examen,
            fechaInicio: new Date(examen.fechaInicio),
            fechaFin: new Date(examen.fechaFin),
            curso: examen.curso._id || examen.curso
        });
        setEditando(examen);
        setDialogOpen(true);
    };

    const handleDelete = async (examenId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este examen?')) {
            try {
                await axios.delete(`${CONFIG.url}/examenes/${examenId}`);
                setSuccess('Examen eliminado exitosamente');
                loadExamenes();
            } catch (error) {
                setError('Error al eliminar examen');
            }
        }
    };

    // Funciones para manejar preguntas
    const addPregunta = () => {
        const nuevaPregunta = {
            pregunta: '',
            tipo: 'multiple',
            opciones: [
                { texto: '', esCorrecta: true },
                { texto: '', esCorrecta: false }
            ],
            respuestaCorrecta: '',
            puntos: 1,
            explicacion: '',
            orden: formData.preguntas.length + 1
        };
        setFormData(prev => ({
            ...prev,
            preguntas: [...prev.preguntas, nuevaPregunta]
        }));
    };

    const updatePregunta = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
            )
        }));
    };

    const removePregunta = (index) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.filter((_, i) => i !== index)
        }));
    };

    const addOpcion = (preguntaIndex) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) =>
                i === preguntaIndex ? {
                    ...p,
                    opciones: [...p.opciones, { texto: '', esCorrecta: false }]
                } : p
            )
        }));
    };

    const updateOpcion = (preguntaIndex, opcionIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) =>
                i === preguntaIndex ? {
                    ...p,
                    opciones: p.opciones.map((o, j) =>
                        j === opcionIndex ? { ...o, [field]: value } :
                            field === 'esCorrecta' && value ? { ...o, esCorrecta: false } : o
                    )
                } : p
            )
        }));
    };

    const removeOpcion = (preguntaIndex, opcionIndex) => {
        setFormData(prev => ({
            ...prev,
            preguntas: prev.preguntas.map((p, i) =>
                i === preguntaIndex ? {
                    ...p,
                    opciones: p.opciones.filter((_, j) => j !== opcionIndex)
                } : p
            )
        }));
    };

    const getEstadoExamen = (examen) => {
        const ahora = new Date();
        const inicio = new Date(examen.fechaInicio);
        const fin = new Date(examen.fechaFin);

        if (!examen.activo) return { texto: 'Inactivo', color: 'default' };
        if (ahora < inicio) return { texto: 'Programado', color: 'info' };
        if (ahora >= inicio && ahora <= fin) return { texto: 'Activo', color: 'success' };
        if (ahora > fin) return { texto: 'Finalizado', color: 'error' };
        return { texto: 'Desconocido', color: 'default' };
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Gestión de Exámenes
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        resetForm();
                        setDialogOpen(true);
                    }}
                >
                    Crear Examen
                </Button>
            </Box>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Buscar"
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                            placeholder="Título, descripción..."
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Curso</InputLabel>
                            <Select
                                value={filtros.curso}
                                onChange={(e) => setFiltros(prev => ({ ...prev, curso: e.target.value }))}
                                label="Curso"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {cursos.map((curso) => (
                                    <MenuItem key={curso._id} value={curso._id}>
                                        {curso.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filtros.activo}
                                onChange={(e) => setFiltros(prev => ({ ...prev, activo: e.target.value }))}
                                label="Estado"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="true">Activos</MenuItem>
                                <MenuItem value="false">Inactivos</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setFiltros({ activo: '', curso: '', busqueda: '' })}
                        >
                            Limpiar Filtros
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Alertas */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* Lista de exámenes */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {examenes.map((examen) => {
                            const estado = getEstadoExamen(examen);
                            return (
                                <Grid item xs={12} key={examen._id}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="h6" gutterBottom>
                                                        {examen.titulo}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        {examen.descripcion}
                                                    </Typography>
                                                    <Chip
                                                        label={estado.texto}
                                                        color={estado.color}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Chip
                                                        label={examen.curso?.nombre || 'Sin curso'}
                                                        variant="outlined"
                                                        size="small"
                                                        icon={<SchoolIcon />}
                                                    />
                                                </Box>
                                            </Box>

                                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                                <Grid item xs={6} md={3}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <QuizIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                                        <Typography variant="body2">
                                                            {examen.preguntas?.length || 0} preguntas
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6} md={3}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <TimeIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                                        <Typography variant="body2">
                                                            {examen.duracionMinutos} min
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6} md={3}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Inicio: {formatDate(examen.fechaInicio)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} md={3}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Fin: {formatDate(examen.fechaFin)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>

                                            <Divider sx={{ my: 1 }} />

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Puntuación mínima: {examen.puntuacionMinima} |
                                                    Intentos: {examen.intentosPermitidos} |
                                                    Total: {examen.puntuacionTotal || 0} pts
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                        <CardActions>
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleEdit(examen)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => window.open(`/examen/${examen._id}`, '_blank')}
                                            >
                                                Ver
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<AssignmentIcon />}
                                                onClick={() => window.open(`/examen/${examen._id}/resultados`, '_blank')}
                                            >
                                                Resultados
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDelete(examen._id)}
                                            >
                                                Eliminar
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={pagination.totalPages}
                                page={pagination.page}
                                onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Dialog para crear/editar examen */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editando ? 'Editar Examen' : 'Crear Nuevo Examen'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Información básica */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Título del Examen"
                                value={formData.titulo}
                                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Descripción"
                                value={formData.descripcion}
                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Curso</InputLabel>
                                <Select
                                    value={formData.curso}
                                    onChange={(e) => setFormData(prev => ({ ...prev, curso: e.target.value }))}
                                    label="Curso"
                                >
                                    {cursos.map((curso) => (
                                        <MenuItem key={curso._id} value={curso._id}>
                                            {curso.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Duración (minutos)"
                                value={formData.duracionMinutos}
                                onChange={(e) => setFormData(prev => ({ ...prev, duracionMinutos: Number(e.target.value) }))}
                                inputProps={{ min: 1 }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Fecha de Inicio"
                                value={formatDateTimeLocal(formData.fechaInicio)}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    fechaInicio: parseDateTimeLocal(e.target.value)
                                }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Fecha de Fin"
                                value={formatDateTimeLocal(formData.fechaFin)}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    fechaFin: parseDateTimeLocal(e.target.value)
                                }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Intentos Permitidos"
                                value={formData.intentosPermitidos}
                                onChange={(e) => setFormData(prev => ({ ...prev, intentosPermitidos: Number(e.target.value) }))}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Puntuación Mínima"
                                value={formData.puntuacionMinima}
                                onChange={(e) => setFormData(prev => ({ ...prev, puntuacionMinima: Number(e.target.value) }))}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ pt: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.activo}
                                            onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                                        />
                                    }
                                    label="Activo"
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.mostrarResultados}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mostrarResultados: e.target.checked }))}
                                    />
                                }
                                label="Mostrar Resultados"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.mezclarPreguntas}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mezclarPreguntas: e.target.checked }))}
                                    />
                                }
                                label="Mezclar Preguntas"
                            />
                        </Grid>

                        {/* Sección de preguntas */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Preguntas ({formData.preguntas.length})
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={addPregunta}
                                >
                                    Agregar Pregunta
                                </Button>
                            </Box>

                            {formData.preguntas.map((pregunta, preguntaIndex) => (
                                <Accordion key={preguntaIndex} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>
                                            Pregunta {preguntaIndex + 1}: {pregunta.pregunta || 'Sin título'}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Pregunta"
                                                    value={pregunta.pregunta}
                                                    onChange={(e) => updatePregunta(preguntaIndex, 'pregunta', e.target.value)}
                                                    multiline
                                                    rows={2}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Tipo de Pregunta</InputLabel>
                                                    <Select
                                                        value={pregunta.tipo}
                                                        onChange={(e) => updatePregunta(preguntaIndex, 'tipo', e.target.value)}
                                                        label="Tipo de Pregunta"
                                                    >
                                                        <MenuItem value="multiple">Opción Múltiple</MenuItem>
                                                        <MenuItem value="verdadero_falso">Verdadero/Falso</MenuItem>
                                                        <MenuItem value="texto_corto">Texto Corto</MenuItem>
                                                        <MenuItem value="texto_largo">Texto Largo</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Puntos"
                                                    value={pregunta.puntos}
                                                    onChange={(e) => updatePregunta(preguntaIndex, 'puntos', Number(e.target.value))}
                                                    inputProps={{ min: 1 }}
                                                />
                                            </Grid>

                                            {/* Opciones para pregunta de opción múltiple */}
                                            {pregunta.tipo === 'multiple' && (
                                                <Grid item xs={12}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            Opciones de Respuesta
                                                        </Typography>
                                                        {pregunta.opciones?.map((opcion, opcionIndex) => (
                                                            <Box key={opcionIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <Radio
                                                                    checked={opcion.esCorrecta}
                                                                    onChange={(e) => updateOpcion(preguntaIndex, opcionIndex, 'esCorrecta', e.target.checked)}
                                                                    name={`pregunta-${preguntaIndex}-correcta`}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    placeholder={`Opción ${opcionIndex + 1}`}
                                                                    value={opcion.texto}
                                                                    onChange={(e) => updateOpcion(preguntaIndex, opcionIndex, 'texto', e.target.value)}
                                                                    sx={{ mx: 1 }}
                                                                />
                                                                <IconButton
                                                                    color="error"
                                                                    onClick={() => removeOpcion(preguntaIndex, opcionIndex)}
                                                                    disabled={pregunta.opciones.length <= 2}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>
                                                        ))}
                                                        <Button
                                                            size="small"
                                                            onClick={() => addOpcion(preguntaIndex)}
                                                            startIcon={<AddIcon />}
                                                        >
                                                            Agregar Opción
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            )}

                                            {/* Respuesta para verdadero/falso */}
                                            {pregunta.tipo === 'verdadero_falso' && (
                                                <Grid item xs={12}>
                                                    <FormControl component="fieldset">
                                                        <FormLabel component="legend">Respuesta Correcta</FormLabel>
                                                        <RadioGroup
                                                            value={pregunta.respuestaCorrecta || ''}
                                                            onChange={(e) => updatePregunta(preguntaIndex, 'respuestaCorrecta', e.target.value)}
                                                            row
                                                        >
                                                            <FormControlLabel value="verdadero" control={<Radio />} label="Verdadero" />
                                                            <FormControlLabel value="falso" control={<Radio />} label="Falso" />
                                                        </RadioGroup>
                                                    </FormControl>
                                                </Grid>
                                            )}

                                            {/* Respuesta para texto */}
                                            {(pregunta.tipo === 'texto_corto' || pregunta.tipo === 'texto_largo') && (
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Respuesta Correcta"
                                                        value={pregunta.respuestaCorrecta || ''}
                                                        onChange={(e) => updatePregunta(preguntaIndex, 'respuestaCorrecta', e.target.value)}
                                                        multiline={pregunta.tipo === 'texto_largo'}
                                                        rows={pregunta.tipo === 'texto_largo' ? 3 : 1}
                                                    />
                                                </Grid>
                                            )}

                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Explicación (opcional)"
                                                    value={pregunta.explicacion || ''}
                                                    onChange={(e) => updatePregunta(preguntaIndex, 'explicacion', e.target.value)}
                                                    multiline
                                                    rows={2}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Button
                                                    color="error"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => removePregunta(preguntaIndex)}
                                                >
                                                    Eliminar Pregunta
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setDialogOpen(false);
                        resetForm();
                    }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={creando || !formData.titulo || !formData.descripcion || !formData.curso || formData.preguntas.length === 0}
                    >
                        {creando ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                        {editando ? 'Actualizar' : 'Crear'} Examen
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExamenAdmin;