import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Paper,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Avatar,
  Rating,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  AudioFile as AudioIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Bookmark as BookmarkIcon,
  OpenInNew as OpenIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CONFIG } from '../config';

const MaterialesPage = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursoFilter, setCursoFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('fecha');
  const [viewMode, setViewMode] = useState('grid');

  // Función para obtener cursos
  const getCursos = async () => {
    try {
      const response = await axios.get(`${CONFIG.url}/api/cursos?active=true`);
      if (response.data.ok) {
        setCursos(response.data.cursos);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const getMateriales = async () => {
    try {
      setLoading(true);
      const materialesPromises = cursos.map(curso =>
        axios.get(`${CONFIG.url}/api/materiales/cursos/${curso._id}`)
      );

      const responses = await Promise.all(materialesPromises);
      const todosMateriales = responses.flatMap(response =>
        response.data.ok ? response.data.materiales : []
      );

      setMateriales(todosMateriales);
      setError(null);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Error al cargar los materiales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCursos();
  }, []);

  useEffect(() => {
    if (cursos.length > 0) {
      getMateriales();
    }
  }, [cursos]);

  // Tipos de materiales disponibles
  const tiposMateriales = [
    { value: 'video', label: 'Videos', icon: VideoIcon, color: '#f57c00' },
    { value: 'document', label: 'Documentos', icon: DocumentIcon, color: '#d32f2f' },
    { value: 'audio', label: 'Audio', icon: AudioIcon, color: '#7b1fa2' },
    { value: 'quiz', label: 'Quiz', icon: QuizIcon, color: '#388e3c' },
    { value: 'assignment', label: 'Tareas', icon: AssignmentIcon, color: '#1976d2' }
  ];

  // Filtrar y ordenar materiales
  const materialesFiltrados = useMemo(() => {
    let filtered = materiales.filter(material => {
      const matchesSearch =
        material.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCurso = cursoFilter === 'todos' || material.curso === cursoFilter;
      const matchesTipo = tipoFilter === 'todos' || material.tipo === tipoFilter;

      return matchesSearch && matchesCurso && matchesTipo;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fecha':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'nombre':
          return a.titulo.localeCompare(b.titulo);
        case 'curso':
          return a.curso.localeCompare(b.curso);
        case 'orden':
          return a.orden - b.orden;
        default:
          return 0;
      }
    });

    return filtered;
  }, [materiales, searchTerm, cursoFilter, tipoFilter, sortBy]);

  // Obtener información del curso
  const getCursoInfo = (cursoId) => {
    return cursos.find(c => c._id === cursoId);
  };

  // Obtener configuración del tipo
  const getTipoConfig = (tipo) => {
    return tiposMateriales.find(t => t.value === tipo) ||
      { icon: DocumentIcon, color: '#666666', label: 'Documento' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleMaterialAction = (material) => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  // Estadísticas
  const stats = useMemo(() => ({
    total: materiales.length,
    cursos: cursos.length,
    activos: materiales.filter(m => m.activo).length,
    tipos: [...new Set(materiales.map(m => m.tipo))].length
  }), [materiales, cursos]);

  // Componente de tarjeta de material
  const MaterialCard = ({ material }) => {
    const cursoInfo = getCursoInfo(material.curso);
    const tipoConfig = getTipoConfig(material.tipo);
    const IconComponent = tipoConfig.icon;

    return (
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}>
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Avatar sx={{ bgcolor: tipoConfig.color, mr: 2 }}>
              <IconComponent />
            </Avatar>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Chip
                label={material.activo ? 'Activo' : 'Inactivo'}
                color={material.activo ? 'success' : 'default'}
                size="small"
              />
              <IconButton size="small">
                <BookmarkIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            {material.titulo}
          </Typography>

          {cursoInfo && (
            <Chip
              label={cursoInfo.nombre}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ mb: 2 }}
            />
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            paragraph
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {material.descripcion}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Chip label={tipoConfig.label} size="small" />
            <Chip label={`Orden: ${material.orden}`} size="small" variant="outlined" />
            {material.duracion && (
              <Chip label={material.duracion} size="small" variant="outlined" />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(material.createdAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {material.vistas || 0} visualizaciones
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ViewIcon />}
            onClick={() => handleMaterialAction(material)}
          >
            Ver Material
          </Button>
        </CardActions>
      </Card>
    );
  };

  // Componente de lista de material
  const MaterialListItem = ({ material }) => {
    const cursoInfo = getCursoInfo(material.curso);
    const tipoConfig = getTipoConfig(material.tipo);
    const IconComponent = tipoConfig.icon;

    return (
      <Paper sx={{ p: 3, mb: 2, '&:hover': { boxShadow: 2 } }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar sx={{ bgcolor: tipoConfig.color, width: 48, height: 48 }}>
            <IconComponent />
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                {material.titulo}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={material.activo ? 'Activo' : 'Inactivo'}
                  color={material.activo ? 'success' : 'default'}
                  size="small"
                />
                <IconButton size="small">
                  <BookmarkIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {cursoInfo && (
              <Chip
                label={cursoInfo.nombre}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ mb: 1 }}
              />
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {material.descripcion}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={tipoConfig.label} size="small" />
              <Chip label={`Orden: ${material.orden}`} size="small" variant="outlined" />
              {material.duracion && (
                <Chip label={material.duracion} size="small" variant="outlined" />
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Creado: {formatDate(material.createdAt)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<ViewIcon />}
                  onClick={() => handleMaterialAction(material)}
                >
                  Ver Material
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Biblioteca de Materiales
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Accede a todos los recursos de aprendizaje
        </Typography>
      </Paper>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Materiales
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" gutterBottom sx={{ fontWeight: 600 }}>
              {stats.cursos}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cursos
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" gutterBottom sx={{ fontWeight: 600 }}>
              {stats.activos}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Materiales Activos
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" gutterBottom sx={{ fontWeight: 600 }}>
              {stats.tipos}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tipos de Material
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controles de filtrado */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar materiales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextField
              fullWidth
              select
              label="Curso"
              value={cursoFilter}
              onChange={(e) => setCursoFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="todos">Todos los cursos</MenuItem>
              {cursos.map((curso) => (
                <MenuItem key={curso._id} value={curso._id}>
                  {curso.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextField
              fullWidth
              select
              label="Tipo"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="todos">Todos los tipos</MenuItem>
              {tiposMateriales.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextField
              fullWidth
              select
              label="Ordenar por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="small"
            >
              <MenuItem value="fecha">Fecha</MenuItem>
              <MenuItem value="nombre">Nombre</MenuItem>
              <MenuItem value="curso">Curso</MenuItem>
              <MenuItem value="orden">Orden</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={8} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newViewMode) => newViewMode && setViewMode(newViewMode)}
              size="small"
              fullWidth
            >
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Resultados */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Mostrando {materialesFiltrados.length} de {stats.total} materiales
      </Typography>

      {/* Contenido de materiales */}
      <Box>
        {materialesFiltrados.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No se encontraron materiales
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intenta cambiar los filtros o términos de búsqueda
            </Typography>
          </Paper>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {materialesFiltrados.map((material) => (
                  <Grid item xs={12} sm={6} lg={4} key={material._id}>
                    <MaterialCard material={material} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box>
                {materialesFiltrados.map((material) => (
                  <MaterialListItem key={material._id} material={material} />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default MaterialesPage;