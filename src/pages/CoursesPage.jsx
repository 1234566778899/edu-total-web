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
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CONFIG } from '../config';

const AulaVirtualPage = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');

  // Función para obtener cursos activos
  const getCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${CONFIG.url}/api/cursos?active=true`);

      if (response.data.ok) {
        setCursos(response.data.cursos);
        setError(null);
      } else {
        setError('Error al cargar los cursos');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = [...new Set(cursos.map(c => c.categoria).filter(Boolean))];
    return cats.sort();
  }, [cursos]);

  // Filtrar cursos
  const cursosFiltrados = useMemo(() => {
    return cursos.filter(curso => {
      const matchesSearch = curso.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.profesor?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'todas' || curso.categoria === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [cursos, searchTerm, categoryFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Componente de curso para aula virtual
  const CursoCard = ({ curso }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 2,
              width: 56,
              height: 56,
              fontSize: '1.5rem'
            }}
          >
            <SchoolIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1 }}
            >
              {curso.nombre}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Prof. {curso.profesor}
              </Typography>
            </Box>
            {curso.categoria && (
              <Chip
                label={curso.categoria}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ mb: 1 }}
              />
            )}
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2
          }}
        >
          {curso.descripcion}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {curso.duracion && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {curso.duracion}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MenuBookIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Material disponible
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Último acceso: {formatDate(curso.createdAt)}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="medium"
          onClick={() => navigate(`/cursos/${curso._id}`)}
          sx={{ py: 1 }}
        >
          Acceder al curso
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={getCourses}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
            <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
              {cursos.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cursos Disponibles
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
            <Typography variant="h4" color="info.main" gutterBottom sx={{ fontWeight: 600 }}>
              {categories.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Áreas de Estudio
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
            <Typography variant="h4" color="success.main" gutterBottom sx={{ fontWeight: 600 }}>
              24/7
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acceso Disponible
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
            <Typography variant="h4" color="warning.main" gutterBottom sx={{ fontWeight: 600 }}>
              Online
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Modalidad
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'white' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar cursos por nombre o profesor..."
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

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Área de Estudio"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="todas">Todas las áreas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de Cursos */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Mis Cursos
        </Typography>

        {cursosFiltrados.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'white' }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No se encontraron cursos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || categoryFilter !== 'todas'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No tienes cursos asignados en este momento'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {cursosFiltrados.map((curso) => (
              <Grid item xs={12} sm={6} lg={4} key={curso._id}>
                <CursoCard curso={curso} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Sección de Acceso Rápido */}
      <Paper sx={{ mt: 4, p: 3, bgcolor: 'white' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Acceso Rápido
        </Typography>
        <List>
          <ListItem button onClick={() => navigate('/biblioteca')}>
            <ListItemIcon>
              <MenuBookIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Biblioteca Digital"
              secondary="Accede a recursos y materiales complementarios"
            />
          </ListItem>
          <Divider />
          <ListItem button onClick={() => navigate('/evaluaciones')}>
            <ListItemIcon>
              <QuizIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Evaluaciones"
              secondary="Consulta tus calificaciones y evaluaciones pendientes"
            />
          </ListItem>
          <Divider />
          <ListItem button onClick={() => navigate('/recursos')}>
            <ListItemIcon>
              <VideoIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Recursos Multimedia"
              secondary="Videos, audios y contenido interactivo"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default AulaVirtualPage;