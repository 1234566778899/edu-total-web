import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoCallIcon,
  Upload as UploadIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const CalendarioPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterCourse, setFilterCourse] = useState('todos');
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Datos de cursos
  const cursos = [
    { id: 'frontend', nombre: 'Desarrollo Web Frontend', color: '#4CAF50' },
    { id: 'backend', nombre: 'Programación Backend', color: '#2196F3' },
    { id: 'database', nombre: 'Base de Datos', color: '#FF9800' },
    { id: 'ux', nombre: 'Diseño UX/UI', color: '#E91E63' },
    { id: 'mobile', nombre: 'Desarrollo Móvil', color: '#9C27B0' }
  ];

  // Eventos del calendario
  const eventos = [
    {
      id: 1,
      tipo: 'clase',
      titulo: 'Introducción a React Hooks',
      curso: 'frontend',
      fecha: '2024-09-16',
      horaInicio: '09:00',
      horaFin: '11:30',
      instructor: 'María González',
      aula: 'Aula Virtual A',
      descripcion: 'Aprenderemos sobre useState, useEffect y hooks personalizados',
      estado: 'programada',
      asistentes: 28,
      maxAsistentes: 35,
      materiales: ['Slides React Hooks.pdf', 'Código de ejemplos'],
      grabacion: true,
      zoom: 'https://zoom.us/j/123456789'
    },
    {
      id: 2,
      tipo: 'clase',
      titulo: 'API REST con Express.js',
      curso: 'backend',
      fecha: '2024-09-16',
      horaInicio: '14:00',
      horaFin: '16:30',
      instructor: 'Carlos Rodríguez',
      aula: 'Lab Programación 1',
      descripcion: 'Desarrollo de APIs RESTful utilizando Node.js y Express',
      estado: 'programada',
      asistentes: 22,
      maxAsistentes: 30,
      materiales: ['Manual Express.js', 'Proyecto base'],
      grabacion: true
    },
    {
      id: 3,
      tipo: 'examen',
      titulo: 'Evaluación Parcial - JavaScript',
      curso: 'frontend',
      fecha: '2024-09-17',
      horaInicio: '10:00',
      horaFin: '12:00',
      instructor: 'María González',
      aula: 'Aula Virtual B',
      descripcion: 'Examen teórico-práctico sobre fundamentos de JavaScript',
      estado: 'programada',
      duracion: '2 horas',
      tipo_examen: 'parcial',
      intentos: 1
    },
    {
      id: 4,
      tipo: 'tarea',
      titulo: 'Proyecto E-commerce Frontend',
      curso: 'frontend',
      fecha: '2024-09-18',
      horaFin: '23:59',
      descripcion: 'Entrega del proyecto final de e-commerce usando React',
      estado: 'pendiente',
      peso: '25%',
      formato: 'Código + Documentación'
    },
    {
      id: 5,
      tipo: 'clase',
      titulo: 'CSS Grid y Flexbox Avanzado',
      curso: 'frontend',
      fecha: '2024-09-18',
      horaInicio: '09:00',
      horaFin: '11:30',
      instructor: 'María González',
      aula: 'Aula Virtual A',
      descripcion: 'Técnicas avanzadas de layout con CSS moderno',
      estado: 'programada',
      asistentes: 31,
      maxAsistentes: 35,
      materiales: ['Guía CSS Layout.pdf', 'Ejemplos prácticos'],
      grabacion: true
    },
    {
      id: 6,
      tipo: 'evento',
      titulo: 'Conferencia: Tendencias en UX 2024',
      curso: 'ux',
      fecha: '2024-09-20',
      horaInicio: '18:00',
      horaFin: '19:30',
      instructor: 'Laura Vega + Invitados',
      aula: 'Auditorio Principal',
      descripcion: 'Conferencia magistral sobre las últimas tendencias en experiencia de usuario',
      estado: 'programada',
      asistentes: 67,
      maxAsistentes: 100,
      tipo_evento: 'conferencia',
      invitados: ['Designer de Google', 'UX Lead de Spotify']
    }
  ];

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayEvents = getEventosDelDia(dateKey);

      days.push({
        date: new Date(currentDate),
        dateKey,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isSelected: dateKey === selectedDate,
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Obtener eventos del día
  const getEventosDelDia = (fecha) => {
    return eventos.filter(evento => {
      const matchesFecha = evento.fecha === fecha;
      const matchesCurso = filterCourse === 'todos' || evento.curso === filterCourse;
      return matchesFecha && matchesCurso;
    });
  };

  // Obtener información del curso
  const getCursoInfo = (cursoId) => {
    return cursos.find(c => c.id === cursoId) || { nombre: 'General', color: '#6c757d' };
  };

  // Configuración de tipos de eventos
  const getTipoConfig = (tipo) => {
    const configs = {
      'clase': { icon: <SchoolIcon />, color: '#4CAF50', nombre: 'Clase' },
      'examen': { icon: <QuizIcon />, color: '#f44336', nombre: 'Examen' },
      'tarea': { icon: <AssignmentIcon />, color: '#ff9800', nombre: 'Tarea' },
      'evento': { icon: <EventIcon />, color: '#9c27b0', nombre: 'Evento' },
      'tutoria': { icon: <PersonIcon />, color: '#2196f3', nombre: 'Tutoría' }
    };
    return configs[tipo] || { icon: <CalendarIcon />, color: '#6c757d', nombre: 'Evento' };
  };

  // Navegar meses
  const navegarMes = (direccion) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direccion);
    setCurrentMonth(newMonth);
  };

  const formatTime = (time) => {
    return time ? time.substring(0, 5) : '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const eventosDelDiaSeleccionado = getEventosDelDia(selectedDate);
  const eventosHoy = getEventosDelDia(new Date().toISOString().split('T')[0]);

  // Estadísticas del día de hoy
  const statsHoy = {
    clases: eventosHoy.filter(e => e.tipo === 'clase').length,
    examenes: eventosHoy.filter(e => e.tipo === 'examen').length,
    tareas: eventosHoy.filter(e => e.tipo === 'tarea').length,
    eventos: eventosHoy.filter(e => e.tipo === 'evento' || e.tipo === 'tutoria').length
  };

  const handleEventoClick = (evento) => {
    setEventoSeleccionado(evento);
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header con estadísticas */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Calendario Académico
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Gestiona tu horario de clases, exámenes y eventos
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
              <SchoolIcon sx={{ mb: 1 }} />
              <Typography variant="h4">{statsHoy.clases}</Typography>
              <Typography variant="body2">Clases</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
              <QuizIcon sx={{ mb: 1 }} />
              <Typography variant="h4">{statsHoy.examenes}</Typography>
              <Typography variant="body2">Exámenes</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
              <AssignmentIcon sx={{ mb: 1 }} />
              <Typography variant="h4">{statsHoy.tareas}</Typography>
              <Typography variant="body2">Tareas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
              <EventIcon sx={{ mb: 1 }} />
              <Typography variant="h4">{statsHoy.eventos}</Typography>
              <Typography variant="body2">Eventos</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Controles del calendario */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={() => navegarMes(-1)}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </Typography>
              <IconButton onClick={() => navegarMes(1)}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por curso</InputLabel>
              <Select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                label="Filtrar por curso"
              >
                <MenuItem value="todos">Todos los cursos</MenuItem>
                {cursos.map(curso => (
                  <MenuItem key={curso.id} value={curso.id}>
                    {curso.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Vista del calendario */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {/* Días de la semana */}
            <Grid container>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                <Grid item xs key={dia}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      textAlign: 'center',
                      p: 1,
                      fontWeight: 'bold',
                      color: 'text.secondary'
                    }}
                  >
                    {dia}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Días del mes */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {generateCalendarDays().map((day, index) => (
                <Paper
                  key={index}
                  elevation={day.isSelected ? 3 : 1}
                  sx={{
                    p: 1,
                    minHeight: 80,
                    cursor: 'pointer',
                    backgroundColor:
                      day.isToday ? 'primary.light' :
                        day.isSelected ? 'primary.main' :
                          !day.isCurrentMonth ? 'grey.100' : 'white',
                    color:
                      day.isToday || day.isSelected ? 'white' :
                        !day.isCurrentMonth ? 'text.disabled' : 'text.primary',
                    '&:hover': {
                      backgroundColor: day.isSelected ? 'primary.main' : 'grey.50'
                    }
                  }}
                  onClick={() => setSelectedDate(day.dateKey)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {day.date.getDate()}
                  </Typography>

                  {day.events.slice(0, 2).map((evento, i) => {
                    const cursoInfo = getCursoInfo(evento.curso);
                    return (
                      <Chip
                        key={i}
                        label={formatTime(evento.horaInicio)}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.7rem',
                          bgcolor: cursoInfo.color,
                          color: 'white',
                          mb: 0.5,
                          display: 'block'
                        }}
                      />
                    );
                  })}

                  {day.events.length > 2 && (
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                      +{day.events.length - 2} más
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Panel lateral con eventos */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {formatDate(selectedDate)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {eventosDelDiaSeleccionado.length} evento{eventosDelDiaSeleccionado.length !== 1 ? 's' : ''}
            </Typography>

            {eventosDelDiaSeleccionado.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay eventos programados para este día
                </Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%' }}>
                {eventosDelDiaSeleccionado
                  .sort((a, b) => (a.horaInicio || '00:00').localeCompare(b.horaInicio || '00:00'))
                  .map(evento => {
                    const tipoConfig = getTipoConfig(evento.tipo);
                    const cursoInfo = getCursoInfo(evento.curso);

                    return (
                      <Card key={evento.id} sx={{ mb: 2 }}>
                        <CardContent sx={{ pb: 1 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Chip
                              icon={tipoConfig.icon}
                              label={tipoConfig.nombre}
                              size="small"
                              sx={{ bgcolor: tipoConfig.color, color: 'white' }}
                            />
                            {evento.horaInicio && (
                              <Typography variant="body2" color="text.secondary">
                                {formatTime(evento.horaInicio)}
                                {evento.horaFin && ` - ${formatTime(evento.horaFin)}`}
                              </Typography>
                            )}
                          </Box>

                          <Typography variant="subtitle1" gutterBottom>
                            {evento.titulo}
                          </Typography>

                          <Chip
                            label={cursoInfo.nombre}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 1, borderColor: cursoInfo.color, color: cursoInfo.color }}
                          />

                          {evento.instructor && (
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {evento.instructor}
                              </Typography>
                            </Box>
                          )}

                          {evento.aula && (
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {evento.aula}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>

                        <CardActions sx={{ pt: 0 }}>
                          {evento.tipo === 'clase' && evento.zoom && (
                            <Button
                              size="small"
                              startIcon={<VideoCallIcon />}
                              variant="contained"
                              sx={{ mr: 1 }}
                            >
                              Unirse
                            </Button>
                          )}
                          {evento.tipo === 'examen' && (
                            <Button
                              size="small"
                              startIcon={<QuizIcon />}
                              variant="contained"
                              sx={{ mr: 1 }}
                            >
                              Iniciar
                            </Button>
                          )}
                          {evento.tipo === 'tarea' && (
                            <Button
                              size="small"
                              startIcon={<UploadIcon />}
                              variant="contained"
                              sx={{ mr: 1 }}
                            >
                              Entregar
                            </Button>
                          )}
                          <Button
                            size="small"
                            startIcon={<InfoIcon />}
                            onClick={() => handleEventoClick(evento)}
                          >
                            Detalles
                          </Button>
                        </CardActions>
                      </Card>
                    );
                  })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de detalles del evento */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {eventoSeleccionado && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                {getTipoConfig(eventoSeleccionado.tipo).icon}
                {eventoSeleccionado.titulo}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {eventoSeleccionado.descripcion}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Curso
                  </Typography>
                  <Typography variant="body1">
                    {getCursoInfo(eventoSeleccionado.curso).nombre}
                  </Typography>
                </Grid>

                {eventoSeleccionado.instructor && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Instructor
                    </Typography>
                    <Typography variant="body1">
                      {eventoSeleccionado.instructor}
                    </Typography>
                  </Grid>
                )}

                {eventoSeleccionado.aula && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Aula
                    </Typography>
                    <Typography variant="body1">
                      {eventoSeleccionado.aula}
                    </Typography>
                  </Grid>
                )}

                {eventoSeleccionado.horaInicio && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Horario
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(eventoSeleccionado.horaInicio)}
                      {eventoSeleccionado.horaFin && ` - ${formatTime(eventoSeleccionado.horaFin)}`}
                    </Typography>
                  </Grid>
                )}

                {/* Información específica por tipo */}
                {eventoSeleccionado.tipo === 'clase' && (
                  <>
                    {eventoSeleccionado.asistentes && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Asistencia
                        </Typography>
                        <Typography variant="body1">
                          {eventoSeleccionado.asistentes}/{eventoSeleccionado.maxAsistentes} estudiantes
                        </Typography>
                      </Grid>
                    )}

                    {eventoSeleccionado.materiales && eventoSeleccionado.materiales.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Materiales
                        </Typography>
                        {eventoSeleccionado.materiales.map((material, index) => (
                          <Chip key={index} label={material} sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Grid>
                    )}
                  </>
                )}

                {eventoSeleccionado.tipo === 'examen' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Duración
                      </Typography>
                      <Typography variant="body1">
                        {eventoSeleccionado.duracion}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Intentos permitidos
                      </Typography>
                      <Typography variant="body1">
                        {eventoSeleccionado.intentos}
                      </Typography>
                    </Grid>
                  </>
                )}

                {eventoSeleccionado.tipo === 'tarea' && (
                  <>
                    {eventoSeleccionado.peso && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Peso en la nota
                        </Typography>
                        <Typography variant="body1">
                          {eventoSeleccionado.peso}
                        </Typography>
                      </Grid>
                    )}
                    {eventoSeleccionado.formato && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Formato de entrega
                        </Typography>
                        <Typography variant="body1">
                          {eventoSeleccionado.formato}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Cerrar
              </Button>
              {eventoSeleccionado.tipo === 'clase' && eventoSeleccionado.zoom && (
                <Button variant="contained" startIcon={<VideoCallIcon />}>
                  Unirse a la clase
                </Button>
              )}
              {eventoSeleccionado.tipo === 'examen' && (
                <Button variant="contained" startIcon={<QuizIcon />}>
                  Iniciar examen
                </Button>
              )}
              {eventoSeleccionado.tipo === 'tarea' && (
                <Button variant="contained" startIcon={<UploadIcon />}>
                  Entregar tarea
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default CalendarioPage;