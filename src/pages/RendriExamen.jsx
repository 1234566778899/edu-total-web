import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContextApp';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Container,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Snackbar
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Save as SaveIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { CONFIG } from '../config';

const RendirExamenPage = () => {
  const { examenId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Estados principales
  const [examen, setExamen] = useState(null);
  const [respuestaExamen, setRespuestaExamen] = useState(null);
  const [examenIniciado, setExamenIniciado] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [examenEnviado, setExamenEnviado] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Estados de UI
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const [marcadas, setMarcadas] = useState(new Set());
  const [autoSaveMessage, setAutoSaveMessage] = useState('');

  const intervalRef = useRef(null);
  const autosaveRef = useRef(null);

  // Cargar examen
  useEffect(() => {
    loadExamen();
  }, [examenId]);

  // Timer del examen
  useEffect(() => {
    if (examenIniciado && !examenEnviado && tiempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            enviarExamenAutomatico();
            return 0;
          }
          if (prev <= 300 && !mostrarAdvertencia) {
            setMostrarAdvertencia(true);
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(intervalRef.current);
    }
  }, [examenIniciado, examenEnviado, tiempoRestante, mostrarAdvertencia]);

  // Auto-guardado
  useEffect(() => {
    if (examenIniciado && !examenEnviado) {
      autosaveRef.current = setInterval(() => {
        guardarProgreso();
      }, 30000);

      return () => clearInterval(autosaveRef.current);
    }
  }, [examenIniciado, examenEnviado, respuestas]);

  const loadExamen = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${CONFIG.url}/api/examenes/${examenId}`);
      if (response.data.ok) {
        setExamen(response.data.examen);

        // Verificar disponibilidad
        const ahora = new Date();
        const inicio = new Date(response.data.examen.fechaInicio);
        const fin = new Date(response.data.examen.fechaFin);

        if (ahora < inicio || ahora > fin) {
          setError('Este examen no está disponible en este momento');
        }
      } else {
        setError('Examen no encontrado');
      }
    } catch (error) {
      setError('Error al cargar el examen');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarExamen = async () => {
    try {
      const response = await axios.post(`${CONFIG.url}/api/examenes/${examenId}/iniciar`, {
        estudiante: user?.email || user?.id
      });

      if (response.data.ok) {
        setRespuestaExamen(response.data.respuestaExamen);
        setTiempoRestante(examen.duracionMinutos * 60);
        setExamenIniciado(true);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al iniciar examen');
    }
  };

  const manejarRespuesta = (preguntaId, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  const guardarProgreso = () => {
    setAutoSaveMessage('Progreso guardado automáticamente');
    setTimeout(() => setAutoSaveMessage(''), 3000);
  };

  const enviarExamen = async () => {
    setEnviando(true);
    try {
      const respuestasArray = Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
        preguntaId,
        respuesta
      }));

      const response = await axios.post(`${CONFIG.url}/api/examenes/${examenId}/enviar`, {
        respuestaExamenId: respuestaExamen._id,
        respuestas: respuestasArray
      });

      if (response.data.ok) {
        setResultado(response.data.resultado);
        setExamenEnviado(true);
        setMostrarConfirmacion(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (autosaveRef.current) clearInterval(autosaveRef.current);
      } else {
        setError('Error al enviar respuestas');
      }
    } catch (error) {
      setError('Error al enviar el examen');
    } finally {
      setEnviando(false);
    }
  };

  const enviarExamenAutomatico = () => {
    enviarExamen();
  };

  const formatearTiempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const getProgresoRespuestas = () => {
    const totalPreguntas = examen?.preguntas?.length || 0;
    const respondidas = Object.keys(respuestas).length;
    return totalPreguntas > 0 ? (respondidas / totalPreguntas) * 100 : 0;
  };

  const marcarPregunta = () => {
    const nuevasMarcadas = new Set(marcadas);
    const preguntaId = examen.preguntas[preguntaActual]._id;

    if (nuevasMarcadas.has(preguntaId)) {
      nuevasMarcadas.delete(preguntaId);
    } else {
      nuevasMarcadas.add(preguntaId);
    }
    setMarcadas(nuevasMarcadas);
  };

  const navegarPregunta = (indice) => {
    setPreguntaActual(indice);
  };

  const renderPregunta = (pregunta, index) => {
    const preguntaId = pregunta._id;
    const respuestaActual = respuestas[preguntaId] || '';

    return (
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Pregunta {index + 1} de {examen.preguntas.length}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip label={`${pregunta.puntos} puntos`} size="small" color="primary" />
                <Chip
                  icon={marcadas.has(preguntaId) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  label={marcadas.has(preguntaId) ? "Marcada" : "Marcar"}
                  variant={marcadas.has(preguntaId) ? "filled" : "outlined"}
                  onClick={marcarPregunta}
                  clickable
                />
              </Box>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            {pregunta.pregunta}
          </Typography>

          {/* Renderizar según tipo de pregunta */}
          {pregunta.tipo === 'multiple' && (
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={respuestaActual}
                onChange={(e) => manejarRespuesta(preguntaId, e.target.value)}
              >
                {pregunta.opciones?.map((opcion) => (
                  <FormControlLabel
                    key={opcion._id}
                    value={opcion._id}
                    control={<Radio />}
                    label={opcion.texto}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {pregunta.tipo === 'verdadero_falso' && (
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={respuestaActual}
                onChange={(e) => manejarRespuesta(preguntaId, e.target.value)}
              >
                <FormControlLabel
                  value="verdadero"
                  control={<Radio />}
                  label="Verdadero"
                />
                <FormControlLabel
                  value="falso"
                  control={<Radio />}
                  label="Falso"
                />
              </RadioGroup>
            </FormControl>
          )}

          {pregunta.tipo === 'texto_corto' && (
            <TextField
              fullWidth
              value={respuestaActual}
              onChange={(e) => manejarRespuesta(preguntaId, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              variant="outlined"
              inputProps={{ maxLength: 200 }}
            />
          )}

          {pregunta.tipo === 'texto_largo' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={respuestaActual}
              onChange={(e) => manejarRespuesta(preguntaId, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              variant="outlined"
              inputProps={{ maxLength: 1000 }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando examen...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/examenes')}>
          Volver a Exámenes
        </Button>
      </Container>
    );
  }

  // Pantalla de examen completado
  if (examenEnviado && resultado) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            Examen Completado
          </Typography>
          <Typography variant="h5" color={resultado.aprobado ? 'success.main' : 'error.main'} gutterBottom>
            {resultado.aprobado ? 'Aprobado' : 'No Aprobado'}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="h4" color="primary">
                {resultado.porcentaje}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Puntuación
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h4">
                {resultado.puntuacionObtenida}/{resultado.puntuacionTotal}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Puntos
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Tiempo utilizado: {formatearTiempo(resultado.tiempoTranscurrido * 60)}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/examenes')}
          >
            Volver a Exámenes
          </Button>
        </Paper>
      </Container>
    );
  }

  // Pantalla de introducción
  if (!examenIniciado) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <QuizIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              {examen.titulo}
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>Curso:</strong> {examen.curso?.nombre}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>Duración:</strong> {examen.duracionMinutos} minutos
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <QuizIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>Preguntas:</strong> {examen.preguntas?.length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Intentos permitidos:</strong> {examen.intentosPermitidos}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Puntuación mínima:</strong> {examen.puntuacionMinima}%
              </Typography>
              <Typography variant="body1">
                <strong>Total de puntos:</strong> {examen.puntuacionTotal || 0}
              </Typography>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instrucciones Importantes
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {examen.descripcion}
            </Typography>
            <Typography variant="body2">
              • Una vez iniciado, el cronómetro no se puede pausar<br />
              • Tus respuestas se guardan automáticamente<br />
              • Puedes navegar entre preguntas libremente<br />
              • Revisa tus respuestas antes de enviar
            </Typography>
          </Alert>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Importante:</strong> Asegúrate de tener una conexión estable a internet
              y un ambiente adecuado para concentrarte antes de comenzar.
            </Typography>
          </Alert>

          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={iniciarExamen}
              sx={{ px: 4, py: 1.5 }}
            >
              Iniciar Examen
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Pantalla principal del examen
  const preguntaActualData = examen.preguntas[preguntaActual];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header fijo */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {examen.titulo}
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2">
              {Object.keys(respuestas).length}/{examen.preguntas.length} respondidas
            </Typography>

            <Chip
              icon={<TimeIcon />}
              label={formatearTiempo(tiempoRestante)}
              color={tiempoRestante <= 300 ? 'error' : 'default'}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />

            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveIcon />}
              onClick={guardarProgreso}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Guardar
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Grid container spacing={3}>
          {/* Panel de navegación */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 80 }}>
              <Typography variant="h6" gutterBottom>
                Navegación
              </Typography>

              <LinearProgress
                variant="determinate"
                value={getProgresoRespuestas()}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Progreso: {Math.round(getProgresoRespuestas())}%
              </Typography>

              <Grid container spacing={1} sx={{ mb: 2 }}>
                {examen.preguntas.map((pregunta, index) => {
                  const isAnswered = respuestas.hasOwnProperty(pregunta._id);
                  const isMarked = marcadas.has(pregunta._id);
                  const isCurrent = index === preguntaActual;

                  return (
                    <Grid item xs={3} key={index}>
                      <Button
                        variant={isCurrent ? "contained" : "outlined"}
                        size="small"
                        onClick={() => navegarPregunta(index)}
                        sx={{
                          minWidth: 0,
                          width: '100%',
                          backgroundColor: isAnswered ? 'success.light' :
                            isMarked ? 'warning.light' : 'transparent',
                          color: isCurrent ? 'white' :
                            isAnswered ? 'success.dark' :
                              isMarked ? 'warning.dark' : 'text.primary'
                        }}
                      >
                        {index + 1}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'success.light', mr: 1 }} />
                  <Typography variant="caption">Respondida</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'warning.light', mr: 1 }} />
                  <Typography variant="caption">Marcada</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box sx={{ width: 12, height: 12, border: '1px solid', borderColor: 'text.secondary', mr: 1 }} />
                  <Typography variant="caption">Sin responder</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>{Object.keys(respuestas).length}</strong> respondidas
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>{marcadas.size}</strong> marcadas
              </Typography>
              <Typography variant="body2">
                <strong>{examen.preguntas.length - Object.keys(respuestas).length}</strong> pendientes
              </Typography>
            </Paper>
          </Grid>

          {/* Área principal */}
          <Grid item xs={12} md={9}>
            {renderPregunta(preguntaActualData, preguntaActual)}

            {/* Controles de navegación */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Button
                variant="outlined"
                startIcon={<PrevIcon />}
                disabled={preguntaActual === 0}
                onClick={() => navegarPregunta(preguntaActual - 1)}
              >
                Anterior
              </Button>

              <Box>
                {preguntaActual === examen.preguntas.length - 1 ? (
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<SendIcon />}
                    onClick={() => setMostrarConfirmacion(true)}
                  >
                    Enviar Examen
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    endIcon={<NextIcon />}
                    onClick={() => navegarPregunta(preguntaActual + 1)}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Dialog de confirmación */}
      <Dialog open={mostrarConfirmacion} onClose={() => setMostrarConfirmacion(false)}>
        <DialogTitle>
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
          Confirmar envío del examen
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Una vez enviado el examen, no podrás modificar las respuestas.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Preguntas respondidas:</strong> {Object.keys(respuestas).length} de {examen.preguntas.length}
            </Typography>
            <Typography variant="body2">
              <strong>Tiempo restante:</strong> {formatearTiempo(tiempoRestante)}
            </Typography>
          </Box>

          {Object.keys(respuestas).length < examen.preguntas.length && (
            <Alert severity="warning">
              Tienes {examen.preguntas.length - Object.keys(respuestas).length} preguntas sin responder.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMostrarConfirmacion(false)}>
            Cancelar
          </Button>
          <Button
            onClick={enviarExamen}
            variant="contained"
            disabled={enviando}
            startIcon={enviando ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {enviando ? 'Enviando...' : 'Confirmar Envío'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Advertencia de tiempo */}
      <Snackbar
        open={mostrarAdvertencia && tiempoRestante > 0}
        autoHideDuration={null}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          <WarningIcon sx={{ mr: 1 }} />
          Quedan menos de 5 minutos para finalizar el examen
        </Alert>
      </Snackbar>

      {/* Mensaje de auto-guardado */}
      <Snackbar
        open={!!autoSaveMessage}
        autoHideDuration={3000}
        onClose={() => setAutoSaveMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {autoSaveMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RendirExamenPage;