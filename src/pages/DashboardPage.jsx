import React, { useState, useEffect, useContext } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress
} from "@mui/material";
import { AuthContext } from '../contexts/AuthContextApp';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CONFIG } from '../config';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usuario con datos del contexto
  const usuario = {
    nombre: user?.name || "Estudiante",
    avatar: user?.name ? user.name.slice(0, 2).toUpperCase() : "ES",
    email: user?.email || "estudiante@universidad.edu",
    ultimoAcceso: new Date().toISOString(),
  };

  // Función para obtener cursos activos
  const getCursos = async () => {
    try {
      const response = await axios.get(`${CONFIG.url}/api/cursos?active=true`);
      if (response.data.ok) {
        setCursos(response.data.cursos);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Error al cargar cursos');
    }
  };

  // Función para obtener eventos acce
  const getEventos = async () => {
    try {
      const response = await axios.get(`${CONFIG.url}/api/eventos?active=true`);
      if (response.data.ok) {
        setEventos(response.data.eventos);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Error al cargar eventos');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([getCursos(), getEventos()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Estadísticas calculadas basadas en datos reales
  const estadisticas = {
    cursosActivos: cursos.length,
    eventosActivos: eventos.length,
    cursosConCategoria: cursos.filter(c => c.categoria).length,
    totalMateriales: 0, // Se podría calcular obteniendo materiales de cada curso
  };

  // Obtener categorías únicas para mostrar diversidad
  const categorias = [...new Set(cursos.map(c => c.categoria).filter(Boolean))];

  // Función para obtener color aleatorio para cursos
  const getCursoColor = (index) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#607D8B'];
    return colors[index % colors.length];
  };

  // Función para obtener icono por categoría
  const getCategoriaIcon = (categoria) => {
    const iconos = {
      'Programación': '💻',
      'Diseño': '🎨',
      'Marketing': '📢',
      'Negocios': '💼',
      'Idiomas': '🌍',
      'Música': '🎵'
    };
    return iconos[categoria] || '📚';
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Bienvenida */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64, fontSize: '1.5rem' }}>
            {usuario.avatar}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              ¡Bienvenido, {usuario.nombre}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.5 }}>
              Aula Virtual - Plataforma Educativa
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Último acceso: {new Date(usuario.ultimoAcceso).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                {estadisticas.cursosActivos}
              </Typography>
              <Typography variant="body1">Cursos Disponibles</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                {estadisticas.eventosActivos}
              </Typography>
              <Typography variant="body1" color="text.secondary">Eventos Activos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                {categorias.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">Áreas de Estudio</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
                24/7
              </Typography>
              <Typography variant="body1" color="text.secondary">Acceso Disponible</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grid principal */}
      <Grid container spacing={3}>
        {/* Cursos Disponibles */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Mis Cursos
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/cursos')}
                sx={{ textTransform: 'none' }}
              >
                Ver Todos
              </Button>
            </Box>

            {cursos.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="h2" sx={{ mb: 2 }}>📚</Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay cursos disponibles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Los cursos aparecerán aquí cuando estén activos
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {cursos.slice(0, 4).map((curso, index) => (
                  <Grid item xs={12} sm={6} key={curso._id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                      onClick={() => navigate(`/aula/${curso._id}`)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Typography sx={{ fontSize: 32 }}>
                            {getCategoriaIcon(curso.categoria)}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {curso.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Prof. {curso.profesor}
                            </Typography>
                          </Box>
                        </Box>

                        {curso.categoria && (
                          <Chip
                            label={curso.categoria}
                            size="small"
                            sx={{
                              mb: 2,
                              bgcolor: getCursoColor(index) + '20',
                              color: getCursoColor(index)
                            }}
                          />
                        )}

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2
                          }}
                        >
                          {curso.descripcion}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Creado: {new Date(curso.createdAt).toLocaleDateString('es-ES')}
                          </Typography>
                          {curso.duracion && (
                            <Chip label={curso.duracion} size="small" variant="outlined" />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Eventos y Accesos Rápidos */}
        <Grid item xs={12} md={4}>
          {/* Eventos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Eventos Activos
              </Typography>
              <Chip label={eventos.length} color="primary" />
            </Box>

            {eventos.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="h3" sx={{ mb: 1 }}>📅</Typography>
                <Typography variant="body2" color="text.secondary">
                  No hay eventos programados
                </Typography>
              </Box>
            ) : (
              eventos.slice(0, 3).map((evento) => (
                <Paper
                  key={evento._id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderLeft: '4px solid #2196F3',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => evento.url && window.open(evento.url, '_blank')}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {evento.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {evento.descripcion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Creado: {new Date(evento.createdAt).toLocaleDateString('es-ES')}
                  </Typography>
                </Paper>
              ))
            )}
          </Paper>


        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;