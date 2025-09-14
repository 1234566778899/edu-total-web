import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContextApp';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  Divider,
  Pagination,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Quiz as QuizIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { CONFIG } from '../config';

const ExamenesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados principales
  const [examenes, setExamenes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [cursoFilter, setCursoFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('fecha');

  // Paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Cargar datos
  useEffect(() => {
    loadExamenes();
    loadCursos();
  }, [pagination.page]);

  const loadExamenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        activo: 'true'
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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCursos = async () => {
    try {
      const response = await axios.get(`${CONFIG.url}/cursos`);
      if (response.data.ok) {
        setCursos(response.data.cursos);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  // Obtener estado del examen basado en fechas
  const getEstadoExamen = (examen) => {
    const ahora = new Date();
    const inicio = new Date(examen.fechaInicio);
    const fin = new Date(examen.fechaFin);

    if (!examen.activo) return 'inactivo';
    if (ahora < inicio) return 'proximo';
    if (ahora >= inicio && ahora <= fin) return 'disponible';
    if (ahora > fin) return 'vencido';
    return 'desconocido';
  };

  // Filtrar y ordenar exámenes
  const examenesFiltrados = useMemo(() => {
    let filtered = examenes.filter(examen => {
      const matchesSearch =
        examen.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        examen.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (examen.curso?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCurso = cursoFilter === 'todos' || examen.curso?._id === cursoFilter;

      const estadoExamen = getEstadoExamen(examen);
      const matchesEstado = estadoFilter === 'todos' || estadoExamen === estadoFilter;

      return matchesSearch && matchesCurso && matchesEstado;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fecha':
          return new Date(b.fechaInicio) - new Date(a.fechaInicio);
        case 'nombre':
          return a.titulo.localeCompare(b.titulo);
        case 'curso':
          return (a.curso?.nombre || '').localeCompare(b.curso?.nombre || '');
        case 'duracion':
          return b.duracionMinutos - a.duracionMinutos;
        default:
          return 0;
      }
    });

    return filtered;
  }, [examenes, searchTerm, cursoFilter, estadoFilter, sortBy]);

  // Configuración de estados
  const getEstadoConfig = (estado) => {
    const configs = {
      'disponible': { color: 'success', nombre: 'Disponible', icon: <CheckCircleIcon /> },
      'proximo': { color: 'warning', nombre: 'Próximo', icon: <ScheduleIcon /> },
      'vencido': { color: 'error', nombre: 'Vencido', icon: <CancelIcon /> },
      'inactivo': { color: 'default', nombre: 'Inactivo', icon: <CancelIcon /> }
    };
    return configs[estado] || { color: 'default', nombre: 'Desconocido', icon: <InfoIcon /> };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const disponibles = examenes.filter(e => getEstadoExamen(e) === 'disponible').length;
    const proximos = examenes.filter(e => getEstadoExamen(e) === 'proximo').length;
    const vencidos = examenes.filter(e => getEstadoExamen(e) === 'vencido').length;

    return {
      total: examenes.length,
      disponibles,
      proximos,
      vencidos
    };
  }, [examenes]);

  const handleIniciarExamen = (examen) => {
    navigate(`/examenes/${examen._id}`);
  };

  const handleVerDetalles = (examen) => {
    console.log('Ver detalles:', examen._id);
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando exámenes...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header con estadísticas */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mis Exámenes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Gestiona y realiza tus evaluaciones académicas
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2">Total</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h4">{stats.disponibles}</Typography>
              <Typography variant="body2">Disponibles</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h4">{stats.proximos}</Typography>
              <Typography variant="body2">Próximos</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
              <Typography variant="h4">{stats.vencidos}</Typography>
              <Typography variant="body2">Vencidos</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Error mensaje */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <IconButton color="inherit" size="small" onClick={loadExamenes}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Controles de filtrado */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar exámenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Curso</InputLabel>
              <Select
                value={cursoFilter}
                onChange={(e) => setCursoFilter(e.target.value)}
                label="Curso"
              >
                <MenuItem value="todos">Todos</MenuItem>
                {cursos.map(curso => (
                  <MenuItem key={curso._id} value={curso._id}>
                    {curso.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="disponible">Disponibles</MenuItem>
                <MenuItem value="proximo">Próximos</MenuItem>
                <MenuItem value="vencido">Vencidos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ordenar</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Ordenar"
              >
                <MenuItem value="fecha">Por fecha</MenuItem>
                <MenuItem value="nombre">Por nombre</MenuItem>
                <MenuItem value="curso">Por curso</MenuItem>
                <MenuItem value="duracion">Por duración</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setCursoFilter('todos');
                setEstadoFilter('todos');
                setSortBy('fecha');
              }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Resultados */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Mostrando {examenesFiltrados.length} de {stats.total} exámenes
      </Typography>

      {/* Lista de exámenes */}
      {examenesFiltrados.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No se encontraron exámenes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || cursoFilter !== 'todos' || estadoFilter !== 'todos'
              ? 'Intenta cambiar los filtros o términos de búsqueda'
              : 'No hay exámenes disponibles en este momento'
            }
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {examenesFiltrados.map((examen) => {
              const estado = getEstadoExamen(examen);
              const estadoConfig = getEstadoConfig(estado);

              return (
                <Grid item xs={12} sm={6} md={4} key={examen._id}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { elevation: 4 }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header del Card */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip
                          icon={estadoConfig.icon}
                          label={estadoConfig.nombre}
                          color={estadoConfig.color}
                          variant="filled"
                        />
                      </Box>

                      {/* Título */}
                      <Typography variant="h6" gutterBottom noWrap>
                        {examen.titulo}
                      </Typography>

                      {/* Curso */}
                      <Box display="flex" alignItems="center" mb={1}>
                        <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {examen.curso?.nombre || 'Sin curso'}
                        </Typography>
                      </Box>

                      {/* Descripción */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {examen.descripcion}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      {/* Metadatos */}
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center">
                          <QuizIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {examen.preguntas?.length || 0} preguntas
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <TimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {examen.duracionMinutos} min
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Intentos: {examen.intentosPermitidos}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mínimo: {examen.puntuacionMinima}%
                        </Typography>
                      </Box>

                      {examen.puntuacionTotal && (
                        <Typography variant="body2" color="text.secondary">
                          Total: {examen.puntuacionTotal} puntos
                        </Typography>
                      )}

                      <Divider sx={{ my: 1 }} />

                      {/* Fechas */}
                      <Typography variant="caption" display="block" color="text.secondary">
                        Disponible: {formatDateTime(examen.fechaInicio)}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Límite: {formatDateTime(examen.fechaFin)}
                      </Typography>

                      {/* Información adicional según estado */}
                      {estado === 'proximo' && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <Typography variant="caption">
                            Se abre: {formatDateTime(examen.fechaInicio)}
                          </Typography>
                        </Alert>
                      )}

                      {estado === 'vencido' && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          <Typography variant="caption">
                            Este examen ya no está disponible
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      {estado === 'disponible' && (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleIniciarExamen(examen)}
                          fullWidth
                        >
                          Iniciar Examen
                        </Button>
                      )}

                      {estado === 'proximo' && (
                        <Button variant="outlined" disabled fullWidth>
                          No Disponible Aún
                        </Button>
                      )}

                      {estado === 'vencido' && (
                        <Button variant="outlined" disabled fullWidth>
                          Vencido
                        </Button>
                      )}

                      <Tooltip title="Ver más información">
                        <IconButton
                          onClick={() => handleVerDetalles(examen)}
                          size="small"
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ExamenesPage;