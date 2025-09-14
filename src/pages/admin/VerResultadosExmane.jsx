import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Container,
    Paper,
    Grid,
    Chip,
    Divider,
    LinearProgress,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    School as SchoolIcon,
    AccessTime as TimeIcon,
    Quiz as QuizIcon,
    Grade as GradeIcon,
    TrendingUp as TrendingUpIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    ExpandMore as ExpandMoreIcon,
    Home as HomeIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { CONFIG } from '../../config';
import { AuthContext } from '../../contexts/AuthContextApp';

const VerResultadosExamen = () => {
    const { examenId, resultadoId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [resultado, setResultado] = useState(null);
    const [examen, setExamen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadResultado();
    }, [examenId, resultadoId]);

    const loadResultado = async () => {
        try {
            setLoading(true);
            setError(null);

            // Si tenemos resultadoId específico, usarlo; sino buscar por estudiante
            let response;
            if (resultadoId) {
                response = await axios.get(`${CONFIG.url}/api/resultados/${resultadoId}`);
            } else {
                // Buscar resultados del estudiante para este examen
                response = await axios.get(`${CONFIG.url}/api/estudiantes/${user?.email || user?.id}/resultados`);

                if (response.data.ok) {
                    const resultadoExamen = response.data.resultados.find(r => r.examen._id === examenId);
                    if (resultadoExamen) {
                        setResultado(resultadoExamen);
                        setExamen(resultadoExamen.examen);
                    } else {
                        setError('No se encontraron resultados para este examen');
                    }
                    return;
                }
            }

            if (response.data.ok) {
                setResultado(response.data.resultado);
                setExamen(response.data.resultado.examen);
            } else {
                setError('No se encontraron resultados');
            }
        } catch (error) {
            setError('Error al cargar los resultados');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins} minutos`;
    };

    const getCalificacionColor = (porcentaje) => {
        if (porcentaje >= 90) return 'success';
        if (porcentaje >= 80) return 'info';
        if (porcentaje >= 70) return 'warning';
        return 'error';
    };

    const calcularEstadisticasPorTema = () => {
        if (!resultado?.respuestas || !examen?.preguntas) return {};

        const temas = {};

        resultado.respuestas.forEach(respuesta => {
            const pregunta = examen.preguntas.find(p => p._id === respuesta.preguntaId);
            if (pregunta && pregunta.tema) {
                if (!temas[pregunta.tema]) {
                    temas[pregunta.tema] = {
                        correctas: 0,
                        total: 0,
                        puntos: 0,
                        puntosObtenidos: 0
                    };
                }

                temas[pregunta.tema].total++;
                temas[pregunta.tema].puntos += pregunta.puntos;

                if (respuesta.esCorrecta) {
                    temas[pregunta.tema].correctas++;
                    temas[pregunta.tema].puntosObtenidos += respuesta.puntosObtenidos;
                }
            }
        });

        return temas;
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <Box textAlign="center">
                        <CircularProgress size={60} />
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Cargando resultados...
                        </Typography>
                    </Box>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={loadResultado}>
                            <RefreshIcon sx={{ mr: 1 }} />
                            Reintentar
                        </Button>
                    }
                >
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => navigate('/examenes')}>
                    Volver a Exámenes
                </Button>
            </Container>
        );
    }

    if (!resultado || !examen) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    No se encontraron resultados para mostrar
                </Alert>
                <Button variant="contained" onClick={() => navigate('/examenes')}>
                    Volver a Exámenes
                </Button>
            </Container>
        );
    }

    const estadisticasTemas = calcularEstadisticasPorTema();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <AssignmentIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" gutterBottom>
                                Resultados del Examen
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {examen.titulo}
                            </Typography>
                        </Box>
                    </Box>

                    <Box textAlign="right">
                        <Chip
                            icon={resultado.aprobado ? <CheckIcon /> : <CancelIcon />}
                            label={resultado.aprobado ? 'APROBADO' : 'NO APROBADO'}
                            color={resultado.aprobado ? 'success' : 'error'}
                            size="large"
                            sx={{ fontSize: '1rem', px: 2 }}
                        />
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box display="flex" alignItems="center">
                            <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                                <strong>Curso:</strong> {examen.curso?.nombre}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box display="flex" alignItems="center">
                            <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                                <strong>Estudiante:</strong> {resultado.estudiante}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box display="flex" alignItems="center">
                            <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                                <strong>Fecha:</strong> {formatDate(resultado.fechaFin)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                            <strong>Intento:</strong> {resultado.numeroIntento} de {examen.intentosPermitidos}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                {/* Puntuación General */}
                <Grid item xs={12} md={4}>
                    <Card elevation={2} sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <GradeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h3" color="primary" gutterBottom>
                                {resultado.porcentaje}%
                            </Typography>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Puntuación Final
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={resultado.porcentaje}
                                    color={getCalificacionColor(resultado.porcentaje)}
                                    sx={{ height: 10, borderRadius: 5 }}
                                />
                            </Box>

                            <Typography variant="body1" sx={{ mt: 2 }}>
                                {resultado.puntuacionObtenida} de {resultado.puntuacionTotal} puntos
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Mínimo requerido: {examen.puntuacionMinima}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Estadísticas Generales */}
                <Grid item xs={12} md={4}>
                    <Card elevation={2} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Estadísticas del Examen
                            </Typography>

                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <QuizIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Total de preguntas"
                                        secondary={`${examen.preguntas?.length || 0} preguntas`}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <CheckIcon color="success" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Respuestas correctas"
                                        secondary={`${resultado.respuestas?.filter(r => r.esCorrecta).length || 0} correctas`}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <CancelIcon color="error" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Respuestas incorrectas"
                                        secondary={`${resultado.respuestas?.filter(r => !r.esCorrecta).length || 0} incorrectas`}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <TimeIcon color="info" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Tiempo utilizado"
                                        secondary={formatDuration(resultado.tiempoTranscurrido)}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Estado del Resultado */}
                <Grid item xs={12} md={4}>
                    <Card elevation={2} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Información del Resultado
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Estado del examen
                                </Typography>
                                <Chip
                                    label={resultado.estado === 'completado' ? 'Completado' :
                                        resultado.estado === 'tiempo_agotado' ? 'Tiempo Agotado' :
                                            resultado.estado}
                                    color={resultado.estado === 'completado' ? 'success' : 'warning'}
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Fecha de inicio
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(resultado.fechaInicio)}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Fecha de finalización
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(resultado.fechaFin)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Duración permitida
                                </Typography>
                                <Typography variant="body1">
                                    {formatDuration(examen.duracionMinutos)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Análisis por Temas */}
                {Object.keys(estadisticasTemas).length > 0 && (
                    <Grid item xs={12}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Rendimiento por Tema
                                </Typography>

                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Tema</TableCell>
                                                <TableCell align="center">Correctas</TableCell>
                                                <TableCell align="center">Total</TableCell>
                                                <TableCell align="center">Porcentaje</TableCell>
                                                <TableCell align="center">Puntos</TableCell>
                                                <TableCell align="right">Progreso</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Object.entries(estadisticasTemas).map(([tema, stats]) => {
                                                const porcentaje = Math.round((stats.correctas / stats.total) * 100);
                                                return (
                                                    <TableRow key={tema}>
                                                        <TableCell component="th" scope="row">
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {tema}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={stats.correctas}
                                                                color="success"
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">{stats.total}</TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                variant="body2"
                                                                color={porcentaje >= 70 ? 'success.main' : 'error.main'}
                                                                fontWeight="medium"
                                                            >
                                                                {porcentaje}%
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {stats.puntosObtenidos}/{stats.puntos}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ width: 120 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={porcentaje}
                                                                color={porcentaje >= 70 ? 'success' : 'error'}
                                                                sx={{ height: 8, borderRadius: 4 }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Detalle de Respuestas */}
                <Grid item xs={12}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Detalle de Respuestas
                            </Typography>

                            {resultado.respuestas?.map((respuesta, index) => {
                                const pregunta = examen.preguntas?.find(p => p._id === respuesta.preguntaId);
                                if (!pregunta) return null;

                                return (
                                    <Accordion key={respuesta.preguntaId} sx={{ mb: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box display="flex" alignItems="center" width="100%">
                                                <Box display="flex" alignItems="center" mr={2}>
                                                    {respuesta.esCorrecta ? (
                                                        <CheckIcon color="success" />
                                                    ) : (
                                                        <CancelIcon color="error" />
                                                    )}
                                                </Box>

                                                <Box flexGrow={1}>
                                                    <Typography variant="body1">
                                                        Pregunta {index + 1}: {pregunta.pregunta.substring(0, 80)}
                                                        {pregunta.pregunta.length > 80 ? '...' : ''}
                                                    </Typography>
                                                </Box>

                                                <Box display="flex" gap={1}>
                                                    <Chip
                                                        label={`${respuesta.puntosObtenidos}/${pregunta.puntos} pts`}
                                                        color={respuesta.esCorrecta ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                        </AccordionSummary>

                                        <AccordionDetails>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    <strong>Pregunta completa:</strong>
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 2 }}>
                                                    {pregunta.pregunta}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    <strong>Tu respuesta:</strong>
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 2,
                                                        p: 1,
                                                        bgcolor: respuesta.esCorrecta ? 'success.light' : 'error.light',
                                                        borderRadius: 1,
                                                        color: respuesta.esCorrecta ? 'success.dark' : 'error.dark'
                                                    }}
                                                >
                                                    {pregunta.tipo === 'multiple' && pregunta.opciones ?
                                                        pregunta.opciones.find(o => o._id === respuesta.respuesta)?.texto || respuesta.respuesta :
                                                        respuesta.respuesta
                                                    }
                                                </Typography>

                                                {!respuesta.esCorrecta && (
                                                    <>
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            <strong>Respuesta correcta:</strong>
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                mb: 2,
                                                                p: 1,
                                                                bgcolor: 'success.light',
                                                                borderRadius: 1,
                                                                color: 'success.dark'
                                                            }}
                                                        >
                                                            {pregunta.tipo === 'multiple' && pregunta.opciones ?
                                                                pregunta.opciones.find(o => o.esCorrecta)?.texto || 'No disponible' :
                                                                pregunta.respuestaCorrecta || 'No disponible'
                                                            }
                                                        </Typography>
                                                    </>
                                                )}

                                                {pregunta.explicacion && (
                                                    <>
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            <strong>Explicación:</strong>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                            {pregunta.explicacion}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Acciones */}
            <Box display="flex" justifyContent="center" gap={2} sx={{ mt: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/examenes')}
                >
                    Volver a Exámenes
                </Button>

                {examen.mostrarResultados && (
                    <Button
                        variant="contained"
                        startIcon={<TrendingUpIcon />}
                        onClick={() => window.print()}
                    >
                        Imprimir Resultados
                    </Button>
                )}
            </Box>
        </Container>
    );
};

export default VerResultadosExamen;